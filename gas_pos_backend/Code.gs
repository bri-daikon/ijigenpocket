/**
 * Google Spreadsheet POS & Inventory Management Backend
 * 
 * 【初期セットアップ方法】
 * 1. 新規Googleスプレッドシートを作成
 * 2. 拡張機能 > Apps Script を開く
 * 3. 本スクリプトの内容を Code.gs に貼り付け
 * 4. 初回実行: 関数「initSpreadsheet」を選択して「実行」をクリック（シートとヘッダー、サンプルデータが作成されます）
 * 5. デプロイ > 新しいデプロイ
 *    - 種類の選択: ウェブアプリ
 *    - 次のユーザーとして実行: 自分
 *    - アクセスできるユーザー: 全員 (Anyone)
 * 6. 発行された「ウェブアプリのURL」をコピーし、Webアプリ(SpreadsheetPos.html)の設定に入力してください。
 */

const SHEET_PRODUCTS = "Products";
const SHEET_SALES = "Sales";
const SHEET_LOGS = "InventoryLogs";

/**
 * シート初期化
 */
function initSpreadsheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. 商品マスター (Products)
  let prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!prodSheet) {
    prodSheet = ss.insertSheet(SHEET_PRODUCTS);
    prodSheet.appendRow([
      "code", "name", "category", "price", "cost", "stock", "minStock", "image", "updatedAt"
    ]);
    // サンプルデータ
    prodSheet.appendRow(["ITEM001", "オリジナルTシャツ", "アパレル", 2800, 1200, 30, 5, "👕", new Date()]);
    prodSheet.appendRow(["ITEM002", "アクリルキーホルダー", "グッズ", 700, 250, 50, 10, "✨", new Date()]);
    prodSheet.appendRow(["ITEM003", "缶バッジセット", "グッズ", 500, 150, 100, 15, "📛", new Date()]);
    prodSheet.appendRow(["ITEM004", "ステッカーパック", "グッズ", 400, 100, 80, 10, "🏷️", new Date()]);
    prodSheet.appendRow(["ITEM005", "イラスト集 2026", "書籍", 1500, 700, 25, 5, "📖", new Date()]);
    prodSheet.appendRow(["ITEM006", "トートバッグ", "アパレル", 1800, 800, 15, 3, "👜", new Date()]);
    prodSheet.setFrozenRows(1);
  }

  // 2. 売上履歴 (Sales)
  let salesSheet = ss.getSheetByName(SHEET_SALES);
  if (!salesSheet) {
    salesSheet = ss.insertSheet(SHEET_SALES);
    salesSheet.appendRow([
      "orderId", "timestamp", "itemsJson", "totalAmount", "subtotal", "tax", "paidAmount", "changeAmount", "paymentMethod", "memo"
    ]);
    salesSheet.setFrozenRows(1);
  }

  // 3. 入出庫ログ (InventoryLogs)
  let logSheet = ss.getSheetByName(SHEET_LOGS);
  if (!logSheet) {
    logSheet = ss.insertSheet(SHEET_LOGS);
    logSheet.appendRow([
      "logId", "timestamp", "productCode", "productName", "changeQty", "stockAfter", "type", "memo"
    ]);
    logSheet.setFrozenRows(1);
  }

  return { success: true, message: "スプレッドシートの初期化が完了しました。" };
}

/**
 * GETリクエスト処理（商品マスター取得、疎通テスト等）
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || "getProducts";
  let result = {};

  try {
    if (action === "getProducts") {
      result = getProducts();
    } else if (action === "ping") {
      result = { success: true, message: "Spreadsheet POS Backend is running!", timestamp: new Date().toISOString() };
    } else {
      result = { success: false, error: "不明なアクションです: " + action };
    }
  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * POSTリクエスト処理（会計確定、在庫同期、入出庫更新など）
 */
function doPost(e) {
  let result = {};
  try {
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;

    // ロック取得（在庫の二重減算防止）
    const lock = LockService.getScriptLock();
    lock.waitLock(15000); // 最大15秒待機

    try {
      if (action === "checkout") {
        result = handleCheckout(postData.data);
      } else if (action === "batchCheckout") {
        result = handleBatchCheckout(postData.data);
      } else if (action === "adjustStock") {
        result = handleAdjustStock(postData.data);
      } else if (action === "saveProducts") {
        result = handleSaveProducts(postData.data);
      } else if (action === "syncAll") {
        result = handleSyncAll(postData.data);
      } else {
        result = { success: false, error: "不明なPOSTアクションです: " + action };
      }
    } finally {
      lock.releaseLock();
    }

  } catch (err) {
    result = { success: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 商品一覧の取得
 */
function getProducts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!sheet) {
    initSpreadsheet();
    return getProducts();
  }

  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { success: true, products: [] };
  }

  const headers = rows[0];
  const products = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r[0]) continue; // コード空行スキップ
    const item = {};
    headers.forEach((h, colIdx) => {
      item[h] = r[colIdx];
    });
    products.push(item);
  }

  return { success: true, products: products, timestamp: new Date().toISOString() };
}

/**
 * 会計処理（売上保存 + 在庫減算 + ログ記録）
 */
function handleCheckout(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
  const salesSheet = ss.getSheetByName(SHEET_SALES);
  const logSheet = ss.getSheetByName(SHEET_LOGS);

  const orderId = data.orderId || ("ORD-" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd-HHmmss-") + Math.floor(Math.random() * 1000));
  const timestamp = data.timestamp || new Date();
  const items = data.items || []; // [{code, name, price, qty, subtotal}]

  // 1. 売上シートに記録
  salesSheet.appendRow([
    orderId,
    timestamp,
    JSON.stringify(items),
    data.totalAmount || 0,
    data.subtotal || 0,
    data.tax || 0,
    data.paidAmount || 0,
    data.changeAmount || 0,
    data.paymentMethod || "現金",
    data.memo || ""
  ]);

  // 2. 在庫の更新とログ記録
  const prodData = prodSheet.getDataRange().getValues();
  const headers = prodData[0];
  const codeIdx = headers.indexOf("code");
  const nameIdx = headers.indexOf("name");
  const stockIdx = headers.indexOf("stock");
  const updatedIdx = headers.indexOf("updatedAt");

  const stockUpdates = [];

  items.forEach(item => {
    let found = false;
    for (let i = 1; i < prodData.length; i++) {
      if (String(prodData[i][codeIdx]) === String(item.code)) {
        const currentStock = Number(prodData[i][stockIdx]) || 0;
        const changeQty = -Number(item.qty);
        const newStock = currentStock + changeQty;

        // シートのセルを直接更新 (i+1 行, stockIdx+1 列)
        prodSheet.getRange(i + 1, stockIdx + 1).setValue(newStock);
        if (updatedIdx !== -1) {
          prodSheet.getRange(i + 1, updatedIdx + 1).setValue(new Date());
        }

        // ログ記録
        const logId = "LOG-" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd-HHmmss-") + Math.floor(Math.random() * 10000);
        logSheet.appendRow([
          logId,
          timestamp,
          item.code,
          item.name,
          changeQty,
          newStock,
          "販売",
          "注文: " + orderId
        ]);

        stockUpdates.push({ code: item.code, stock: newStock });
        found = true;
        break;
      }
    }
  });

  return {
    success: true,
    orderId: orderId,
    stockUpdates: stockUpdates,
    message: "会計処理が完了しました。"
  };
}

/**
 * オフライン等で溜まった複数トランザクションの一括同期処理
 */
function handleBatchCheckout(dataList) {
  const results = [];
  if (Array.isArray(dataList)) {
    dataList.forEach(data => {
      const res = handleCheckout(data);
      results.push(res);
    });
  }
  return { success: true, processedCount: results.length, results: results };
}

/**
 * 在庫の直接調整・入出庫処理
 */
function handleAdjustStock(data) {
  // data: { code, changeQty, type: "入庫" | "出庫" | "棚卸調整", memo }
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
  const logSheet = ss.getSheetByName(SHEET_LOGS);

  const prodData = prodSheet.getDataRange().getValues();
  const headers = prodData[0];
  const codeIdx = headers.indexOf("code");
  const nameIdx = headers.indexOf("name");
  const stockIdx = headers.indexOf("stock");
  const updatedIdx = headers.indexOf("updatedAt");

  for (let i = 1; i < prodData.length; i++) {
    if (String(prodData[i][codeIdx]) === String(data.code)) {
      const currentStock = Number(prodData[i][stockIdx]) || 0;
      let newStock = currentStock;

      if (data.type === "棚卸調整" && data.exactStock !== undefined) {
        newStock = Number(data.exactStock);
      } else {
        newStock = currentStock + Number(data.changeQty || 0);
      }

      prodSheet.getRange(i + 1, stockIdx + 1).setValue(newStock);
      if (updatedIdx !== -1) {
        prodSheet.getRange(i + 1, updatedIdx + 1).setValue(new Date());
      }

      const logId = "LOG-" + Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd-HHmmss-") + Math.floor(Math.random() * 10000);
      logSheet.appendRow([
        logId,
        new Date(),
        data.code,
        prodData[i][nameIdx],
        newStock - currentStock,
        newStock,
        data.type || "手動調整",
        data.memo || ""
      ]);

      return {
        success: true,
        code: data.code,
        stock: newStock,
        message: "在庫を更新しました。"
      };
    }
  }

  return { success: false, error: "商品コードが見つかりません: " + data.code };
}

/**
 * 商品マスターの一括保存・更新
 */
function handleSaveProducts(products) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
  if (!prodSheet) {
    initSpreadsheet();
    prodSheet = ss.getSheetByName(SHEET_PRODUCTS);
  }

  // 既存を一旦クリアして書き直し（または行ごと更新）
  prodSheet.clearContents();
  const headers = ["code", "name", "category", "price", "cost", "stock", "minStock", "image", "updatedAt"];
  prodSheet.appendRow(headers);

  const rows = [];
  products.forEach(p => {
    rows.push([
      p.code || "",
      p.name || "",
      p.category || "その他",
      Number(p.price) || 0,
      Number(p.cost) || 0,
      Number(p.stock) || 0,
      Number(p.minStock) || 0,
      p.image || "📦",
      new Date()
    ]);
  });

  if (rows.length > 0) {
    prodSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  return { success: true, count: rows.length, message: "商品マスターを保存しました。" };
}
