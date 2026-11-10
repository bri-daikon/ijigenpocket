/**
 * Spreadsheet POS & Inventory Management App Logic
 */

// --- 状態管理 ---
const STATE = {
    products: [],
    cart: [],
    categories: ["すべて"],
    activeCategory: "すべて",
    searchQuery: "",
    gasUrl: localStorage.getItem("pos_gas_url") || "",
    storeName: localStorage.getItem("pos_store_name") || "異次元ポケットショップ",
    taxRate: Number(localStorage.getItem("pos_tax_rate")) || 10,
    cardViewMode: localStorage.getItem("pos_card_view_mode") || "large", // "large" or "compact"
    offlineQueue: JSON.parse(localStorage.getItem("pos_offline_queue") || "[]"),
    isOnline: navigator.onLine,
    isSyncing: false,
    scanner: null,
    scannerActive: false
};

// サンプル初期データ（初回起動時・オフライン時用）
const DEFAULT_PRODUCTS = [
    { code: "ITEM001", name: "オリジナルTシャツ", category: "アパレル", price: 2800, cost: 1200, stock: 24, minStock: 5, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80" },
    { code: "ITEM002", name: "アクリルキーホルダー", category: "グッズ", price: 700, cost: 250, stock: 45, minStock: 10, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
    { code: "ITEM003", name: "缶バッジセット", category: "グッズ", price: 500, cost: 150, stock: 3, minStock: 15, image: "📛" },
    { code: "ITEM004", name: "ステッカーパック", category: "グッズ", price: 400, cost: 100, stock: 80, minStock: 10, image: "🏷️" },
    { code: "ITEM005", name: "イラスト集 2026", category: "書籍", price: 1500, cost: 700, stock: 12, minStock: 5, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80" },
    { code: "ITEM006", name: "トートバッグ", category: "アパレル", price: 1800, cost: 800, stock: 2, minStock: 5, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80" },
    { code: "ITEM007", name: "クリアファイル", category: "文具", price: 350, cost: 80, stock: 30, minStock: 10, image: "📁" },
    { code: "ITEM008", name: "ポストカード5種", category: "文具", price: 600, cost: 120, stock: 50, minStock: 10, image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80" }
];

// --- 初期化 ---
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    // ローカルキャッシュから商品読み込み
    const savedProducts = localStorage.getItem("pos_cached_products");
    if (savedProducts) {
        try {
            STATE.products = JSON.parse(savedProducts);
        } catch(e) {
            STATE.products = DEFAULT_PRODUCTS;
        }
    } else {
        STATE.products = DEFAULT_PRODUCTS;
        saveProductsToLocal();
    }

    updateViewModeButtonLabel();
    updateCategories();
    renderProducts();
    renderCart();
    renderInventoryTable();
    updateOfflineQueueBadge();
    updateSyncStatus();

    // GAS URL設定済みなら初回データ同期を試みる
    if (STATE.gasUrl && STATE.isOnline) {
        fetchProductsFromGas();
    }

    // テーマ設定復元
    const savedTheme = localStorage.getItem("pos_theme") || "dark";
    setTheme(savedTheme);

    // オンライン/オフライン検知
    window.addEventListener("online", () => {
        STATE.isOnline = true;
        updateSyncStatus();
        showToast("オンラインに復旧しました。未送信データを同期します...", "info");
        syncOfflineQueue();
    });
    window.addEventListener("offline", () => {
        STATE.isOnline = false;
        updateSyncStatus();
        showToast("オフラインモードに切り替わりました。会計はローカルに保存されます。", "warning");
    });
}

function toggleCardViewMode() {
    STATE.cardViewMode = STATE.cardViewMode === "large" ? "compact" : "large";
    localStorage.setItem("pos_card_view_mode", STATE.cardViewMode);
    updateViewModeButtonLabel();
    renderProducts();
}

function updateViewModeButtonLabel() {
    const label = document.getElementById("viewmode-label");
    if (label) {
        label.innerText = STATE.cardViewMode === "large" ? "写真大" : "コンパクト";
    }
}

function setupEventListeners() {
    // 検索入力
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            STATE.searchQuery = e.target.value.trim().toLowerCase();
            renderProducts();
        });
    }

    // キーボードショートカット (Enterで会計、Escでモーダル閉じる)
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeAllModals();
        }
    });
}

// --- カテゴリ・商品レンダリング ---
function updateCategories() {
    const cats = new Set(["すべて"]);
    STATE.products.forEach(p => {
        if (p.category) cats.add(p.category);
    });
    STATE.categories = Array.from(cats);

    const catContainer = document.getElementById("category-tabs");
    if (!catContainer) return;

    catContainer.innerHTML = STATE.categories.map(cat => {
        const isActive = STATE.activeCategory === cat;
        return `
            <button onclick="setCategory('${cat}')" 
                class="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5'
                }">
                ${cat}
            </button>
        `;
    }).join("");
}

function setCategory(cat) {
    STATE.activeCategory = cat;
    updateCategories();
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    const filtered = STATE.products.filter(p => {
        const matchesCat = (STATE.activeCategory === "すべて" || p.category === STATE.activeCategory);
        const matchesSearch = !STATE.searchQuery || 
            (p.name && p.name.toLowerCase().includes(STATE.searchQuery)) ||
            (p.code && p.code.toLowerCase().includes(STATE.searchQuery));
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-16 text-center text-slate-500">
                <div class="text-4xl mb-2">🔍</div>
                <p>該当する商品が見つかりません</p>
            </div>
        `;
        return;
    }

    const isLarge = STATE.cardViewMode === "large";

    grid.innerHTML = filtered.map(p => {
        const stockNum = Number(p.stock) || 0;
        const minStock = Number(p.minStock) || 5;
        const isOutOfStock = stockNum <= 0;
        const isLowStock = !isOutOfStock && stockNum <= minStock;

        let badgeHtml = "";
        if (isOutOfStock) {
            badgeHtml = `<span class="bg-red-500/80 backdrop-blur-md text-white border border-red-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">完売</span>`;
        } else if (isLowStock) {
            badgeHtml = `<span class="badge-low-stock bg-amber-500/80 backdrop-blur-md text-white border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">残 ${stockNum}</span>`;
        } else {
            badgeHtml = `<span class="bg-black/40 backdrop-blur-md text-slate-200 text-[10px] px-2 py-0.5 rounded-full font-medium">残 ${stockNum}</span>`;
        }

        const isImageEmoji = !p.image || (!p.image.startsWith("http") && !p.image.startsWith("data:image/"));

        if (isLarge) {
            // 写真・イラスト強調レイアウト（縦型カード）
            return `
                <div onclick="addToCart('${p.code}')" 
                    class="product-card card-mode-large group relative bg-white/5 hover:bg-white/10 active:bg-blue-900/20 border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between shadow-md hover:shadow-2xl transition-all select-none">
                    
                    <!-- 画像エリア -->
                    <div class="card-image-box relative w-full h-36 bg-black/30 overflow-hidden flex items-center justify-center">
                        ${isImageEmoji 
                            ? `<div class="text-5xl group-hover:scale-125 transition-transform duration-300 select-none">${p.image || "📦"}</div>` 
                            : `<img src="${p.image}" alt="${p.name}" class="product-thumbnail" onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'text-4xl\\'>📦</div>';">`
                        }
                        
                        <!-- オーバーレイバッジ -->
                        <div class="absolute top-2 left-2">
                            <span class="text-[10px] font-mono text-slate-200 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded">${p.code}</span>
                        </div>
                        <div class="absolute top-2 right-2">
                            ${badgeHtml}
                        </div>
                    </div>

                    <!-- 商品情報 -->
                    <div class="p-3 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5 truncate">${p.category || 'その他'}</div>
                            <div class="text-sm font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2 leading-tight">${p.name}</div>
                        </div>

                        <div class="mt-2.5 pt-2 border-t border-white/5 flex items-baseline justify-between">
                            <span class="text-[10px] text-slate-400 font-medium">価格(税込)</span>
                            <span class="text-base font-black text-slate-100 font-mono">¥${Number(p.price).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // コンパクトレイアウト（横長サムネイル）
            return `
                <div onclick="addToCart('${p.code}')" 
                    class="product-card card-mode-compact group relative bg-white/5 hover:bg-white/10 active:bg-blue-900/20 border border-white/10 hover:border-blue-500/50 rounded-2xl p-3 cursor-pointer flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all select-none">
                    <div class="flex items-start justify-between gap-2 mb-2">
                        <span class="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">${p.code}</span>
                        ${badgeHtml}
                    </div>
                    
                    <div class="flex items-center gap-3 my-1">
                        <div class="w-12 h-12 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                            ${isImageEmoji 
                                ? (p.image || "📦") 
                                : `<img src="${p.image}" class="w-full h-full object-cover" onerror="this.onerror=null; this.parentElement.innerText='📦';">`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="text-sm font-bold truncate text-slate-100 group-hover:text-blue-400 transition-colors">${p.name}</div>
                            <div class="text-[11px] text-slate-400 truncate">${p.category || 'その他'}</div>
                        </div>
                    </div>

                    <div class="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                        <span class="text-xs text-slate-400 font-medium">単価</span>
                        <span class="text-base font-bold text-slate-100 font-mono">¥${Number(p.price).toLocaleString()}</span>
                    </div>
                </div>
            `;
        }
    }).join("");
}

// --- カート操作 ---
function addToCart(code) {
    const product = STATE.products.find(p => p.code === code);
    if (!product) return;

    const cartItem = STATE.cart.find(item => item.code === code);
    const currentCartQty = cartItem ? cartItem.qty : 0;
    const availableStock = Number(product.stock) || 0;

    if (currentCartQty + 1 > availableStock) {
        showToast(`「${product.name}」の在庫数が不足しています（在庫: ${availableStock}）`, "warning");
    }

    if (cartItem) {
        cartItem.qty += 1;
    } else {
        STATE.cart.push({
            code: product.code,
            name: product.name,
            price: Number(product.price),
            qty: 1
        });
    }

    renderCart();
    // 軽いバイブレーション（対応デバイス）
    if (navigator.vibrate) navigator.vibrate(30);
}

function updateCartQty(code, delta) {
    const itemIndex = STATE.cart.findIndex(i => i.code === code);
    if (itemIndex === -1) return;

    const item = STATE.cart[itemIndex];
    const product = STATE.products.find(p => p.code === code);
    const availableStock = product ? Number(product.stock) : 9999;

    const newQty = item.qty + delta;

    if (newQty > availableStock) {
        showToast(`在庫数（${availableStock}）を超える数量は指定できません`, "warning");
        return;
    }

    if (newQty <= 0) {
        STATE.cart.splice(itemIndex, 1);
    } else {
        item.qty = newQty;
    }

    renderCart();
}

function clearCart() {
    if (STATE.cart.length === 0) return;
    STATE.cart = [];
    renderCart();
}

function getCartTotals() {
    const subtotal = STATE.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const totalQty = STATE.cart.reduce((sum, item) => sum + item.qty, 0);
    const tax = Math.round(subtotal * (STATE.taxRate / 100));
    const total = subtotal; // 税込表記の場合はそのまま、外税の場合は subtotal + tax
    return { subtotal, tax, total, totalQty };
}

function renderCart() {
    const cartItemsEl = document.getElementById("cart-items");
    const cartCountEl = document.getElementById("cart-total-count");
    const cartSubtotalEl = document.getElementById("cart-subtotal");
    const cartTaxEl = document.getElementById("cart-tax");
    const cartTotalEl = document.getElementById("cart-total-amount");
    const checkoutBtn = document.getElementById("btn-checkout");

    if (!cartItemsEl) return;

    const { subtotal, tax, total, totalQty } = getCartTotals();

    if (cartCountEl) cartCountEl.innerText = `${totalQty} 点`;
    if (cartSubtotalEl) cartSubtotalEl.innerText = `¥${subtotal.toLocaleString()}`;
    if (cartTaxEl) cartTaxEl.innerText = `¥${tax.toLocaleString()}`;
    if (cartTotalEl) cartTotalEl.innerText = `¥${total.toLocaleString()}`;

    if (checkoutBtn) {
        checkoutBtn.disabled = STATE.cart.length === 0;
    }

    if (STATE.cart.length === 0) {
        cartItemsEl.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <div class="text-4xl mb-3 opacity-40">🛒</div>
                <p class="text-sm">商品を選択してください</p>
                <p class="text-xs opacity-60 mt-1">バーコードスキャンも利用可能</p>
            </div>
        `;
        return;
    }

    cartItemsEl.innerHTML = STATE.cart.map(item => `
        <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 gap-2">
            <div class="flex-1 min-w-0">
                <div class="text-sm font-bold truncate text-slate-200">${item.name}</div>
                <div class="text-xs text-slate-400 font-mono">¥${item.price.toLocaleString()} × ${item.qty}</div>
            </div>
            
            <div class="text-right mr-2">
                <div class="text-sm font-bold font-mono text-slate-100">¥${(item.price * item.qty).toLocaleString()}</div>
            </div>

            <div class="flex items-center gap-1 bg-black/30 p-1 rounded-lg border border-white/10">
                <button onclick="updateCartQty('${item.code}', -1)" class="w-7 h-7 rounded bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 font-bold flex items-center justify-center transition-all">-</button>
                <span class="w-6 text-center text-xs font-mono font-bold">${item.qty}</span>
                <button onclick="updateCartQty('${item.code}', 1)" class="w-7 h-7 rounded bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 font-bold flex items-center justify-center transition-all">+</button>
            </div>
        </div>
    `).join("");
}

// --- 会計・テンキーモーダル ---
let currentPaidInput = "";

function openCheckoutModal() {
    if (STATE.cart.length === 0) return;

    const { total } = getCartTotals();
    currentPaidInput = ""; // 初期は空（ぴったり支払ボタンもあり）

    document.getElementById("checkout-modal-total").innerText = `¥${total.toLocaleString()}`;
    updatePaidDisplay();

    const modal = document.getElementById("checkout-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeCheckoutModal() {
    const modal = document.getElementById("checkout-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function appendNum(num) {
    if (currentPaidInput.length >= 8) return;
    currentPaidInput += num;
    updatePaidDisplay();
}

function clearNum() {
    currentPaidInput = "";
    updatePaidDisplay();
}

function backspaceNum() {
    currentPaidInput = currentPaidInput.slice(0, -1);
    updatePaidDisplay();
}

function setExactPay() {
    const { total } = getCartTotals();
    currentPaidInput = String(total);
    updatePaidDisplay();
}

function addQuickAmount(amount) {
    const current = Number(currentPaidInput) || 0;
    currentPaidInput = String(current + amount);
    updatePaidDisplay();
}

function updatePaidDisplay() {
    const { total } = getCartTotals();
    const paid = Number(currentPaidInput) || 0;
    const change = paid - total;

    const paidEl = document.getElementById("checkout-paid-amount");
    const changeEl = document.getElementById("checkout-change-amount");
    const confirmBtn = document.getElementById("btn-confirm-payment");

    if (paidEl) {
        paidEl.innerText = currentPaidInput ? `¥${paid.toLocaleString()}` : "¥0";
    }

    if (changeEl) {
        if (change >= 0) {
            changeEl.innerText = `¥${change.toLocaleString()}`;
            changeEl.className = "text-2xl font-bold font-mono text-emerald-400";
        } else {
            changeEl.innerText = `不足: ¥${Math.abs(change).toLocaleString()}`;
            changeEl.className = "text-xl font-bold font-mono text-red-400";
        }
    }

    if (confirmBtn) {
        confirmBtn.disabled = (paid < total);
    }
}

// 会計確定処理
async function processCheckout() {
    const { subtotal, tax, total } = getCartTotals();
    const paid = Number(currentPaidInput) || total;
    const change = paid - total;

    if (paid < total) {
        showToast("お預かり金額が合計金額より少ないです", "warning");
        return;
    }

    const orderData = {
        orderId: "ORD-" + formatDateId(new Date()),
        timestamp: new Date().toISOString(),
        items: STATE.cart.map(i => ({
            code: i.code,
            name: i.name,
            price: i.price,
            qty: i.qty,
            subtotal: i.price * i.qty
        })),
        subtotal: subtotal,
        tax: tax,
        totalAmount: total,
        paidAmount: paid,
        changeAmount: change,
        paymentMethod: document.querySelector('input[name="payment-method"]:checked')?.value || "現金",
        memo: ""
    };

    // 1. ローカルの在庫を即時減算
    STATE.cart.forEach(item => {
        const prod = STATE.products.find(p => p.code === item.code);
        if (prod) {
            prod.stock = Math.max(0, (Number(prod.stock) || 0) - item.qty);
        }
    });
    saveProductsToLocal();
    renderProducts();
    renderInventoryTable();

    closeCheckoutModal();

    // 2. レシート印刷プレビューを表示
    showReceiptModal(orderData);

    // 3. カートをクリア
    STATE.cart = [];
    renderCart();

    // 4. GASへ送信またはオフラインキューに退避
    if (STATE.isOnline && STATE.gasUrl) {
        showToast("スプレッドシートに売上・在庫を反映中...", "info");
        try {
            const res = await fetch(STATE.gasUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain" }, // GAS CORS対策
                body: JSON.stringify({ action: "checkout", data: orderData })
            });
            const result = await res.json();
            if (result.success) {
                showToast("✅ スプレッドシートと在庫が同期されました！", "success");
            } else {
                throw new Error(result.error || "GASエラー");
            }
        } catch (err) {
            console.warn("GAS同期失敗、オフラインキューに保存:", err);
            enqueueOfflineOrder(orderData);
            showToast("⚠️ 通信エラーのため未送信キューに保存しました。後で自動同期されます。", "warning");
        }
    } else {
        enqueueOfflineOrder(orderData);
        showToast("💾 オフラインキューに保存されました（次回接続時に同期）", "info");
    }
}

// --- レシートモーダル ---
function showReceiptModal(order) {
    const modal = document.getElementById("receipt-modal");
    const container = document.getElementById("receipt-print-area");

    const dateStr = new Date(order.timestamp).toLocaleString("ja-JP");

    container.innerHTML = `
        <div class="text-center pb-3 border-b border-dashed border-slate-400 mb-3">
            <h2 class="text-lg font-bold">${STATE.storeName}</h2>
            <p class="text-xs text-slate-500">領収書・お買上明細</p>
            <p class="text-[10px] text-slate-400 font-mono mt-1">${dateStr}</p>
            <p class="text-[10px] text-slate-400 font-mono">No. ${order.orderId}</p>
        </div>

        <div class="space-y-1.5 text-xs mb-3 pb-3 border-b border-dashed border-slate-400">
            ${order.items.map(item => `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div>${item.name}</div>
                        <div class="text-[10px] text-slate-500 font-mono">¥${item.price.toLocaleString()} × ${item.qty}</div>
                    </div>
                    <div class="font-mono font-bold">¥${item.subtotal.toLocaleString()}</div>
                </div>
            `).join("")}
        </div>

        <div class="space-y-1 text-xs mb-3 pb-3 border-b border-dashed border-slate-400 font-mono">
            <div class="flex justify-between">
                <span>小計</span>
                <span>¥${order.subtotal.toLocaleString()}</span>
            </div>
            <div class="flex justify-between text-slate-500">
                <span>内消費税(${STATE.taxRate}%)</span>
                <span>¥${order.tax.toLocaleString()}</span>
            </div>
            <div class="flex justify-between text-base font-bold pt-1 border-t border-slate-300">
                <span>合計</span>
                <span>¥${order.totalAmount.toLocaleString()}</span>
            </div>
            <div class="flex justify-between pt-1">
                <span>お預かり (${order.paymentMethod})</span>
                <span>¥${order.paidAmount.toLocaleString()}</span>
            </div>
            <div class="flex justify-between font-bold text-sm">
                <span>お釣り</span>
                <span>¥${order.changeAmount.toLocaleString()}</span>
            </div>
        </div>

        <div class="text-center text-[10px] text-slate-500">
            <p>毎度ありがとうございます。</p>
            <p class="mt-1">異次元ポケット POS System</p>
        </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeReceiptModal() {
    const modal = document.getElementById("receipt-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function printReceipt() {
    document.body.classList.remove("printing-labels");
    document.body.classList.add("printing-receipt");
    window.print();
    setTimeout(() => {
        document.body.classList.remove("printing-receipt");
    }, 1000);
}

// --- バーコード / QRコードカメラ読み取り ---
function toggleBarcodeScanner() {
    const modal = document.getElementById("scanner-modal");
    if (!STATE.scannerActive) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
        startScanner();
    } else {
        stopScanner();
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

function startScanner() {
    if (!window.Html5Qrcode) {
        showToast("バーコードリーダーライブラリを読み込み中です...", "info");
        return;
    }

    STATE.scanner = new Html5Qrcode("barcode-reader");
    STATE.scannerActive = true;

    const config = { fps: 10, qrbox: { width: 250, height: 180 } };

    STATE.scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
            // スキャン成功時
            onBarcodeScanned(decodedText.trim());
        },
        (errorMessage) => {
            // 解析エラー（頻繁に出るため無視）
        }
    ).catch(err => {
        console.error("カメラ起動エラー:", err);
        showToast("カメラの起動に失敗しました。カメラ権限を確認してください。", "danger");
        stopScanner();
        document.getElementById("scanner-modal").classList.add("hidden");
    });
}

function stopScanner() {
    if (STATE.scanner && STATE.scannerActive) {
        STATE.scanner.stop().then(() => {
            STATE.scanner.clear();
            STATE.scannerActive = false;
        }).catch(err => console.error("スキャナ停止エラー", err));
    }
}

function onBarcodeScanned(code) {
    // 該当する商品を検索
    const product = STATE.products.find(p => p.code.toLowerCase() === code.toLowerCase());
    if (product) {
        addToCart(product.code);
        showToast(`🎯 「${product.name}」を追加しました！`, "success");
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    } else {
        showToast(`未登録のコードです: ${code}`, "warning");
    }
}

// 手動コード入力
function addByManualCode() {
    const input = document.getElementById("manual-code-input");
    const code = input.value.trim();
    if (!code) return;

    onBarcodeScanned(code);
    input.value = "";
}

// --- 在庫マネージャー & 入出庫操作 ---
function renderInventoryTable() {
    const tbody = document.getElementById("inventory-table-body");
    if (!tbody) return;

    tbody.innerHTML = STATE.products.map(p => {
        const stockNum = Number(p.stock) || 0;
        const minStock = Number(p.minStock) || 5;
        const isLow = stockNum <= minStock;
        const isImageEmoji = !p.image || (!p.image.startsWith("http") && !p.image.startsWith("data:image/"));

        return `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td class="p-3">
                    <div class="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl overflow-hidden">
                        ${isImageEmoji 
                            ? (p.image || "📦") 
                            : `<img src="${p.image}" class="w-full h-full object-cover" onerror="this.parentElement.innerText='📦'">`
                        }
                    </div>
                </td>
                <td class="p-3 font-mono text-xs text-slate-400">${p.code}</td>
                <td class="p-3">
                    <div class="font-bold text-slate-100 flex items-center gap-2">
                        <span>${p.name}</span>
                    </div>
                    <div class="text-[11px] text-slate-400">${p.category || "-"}</div>
                </td>
                <td class="p-3 text-right font-mono font-bold text-slate-200">¥${Number(p.price).toLocaleString()}</td>
                <td class="p-3 text-right font-mono text-slate-400">¥${Number(p.cost || 0).toLocaleString()}</td>
                <td class="p-3 text-right">
                    <span class="font-mono font-bold text-sm ${isLow ? 'text-amber-400' : 'text-slate-100'}">${stockNum}</span>
                    ${isLow ? '<span class="ml-1 text-[10px] text-amber-500 font-bold">⚠️少</span>' : ''}
                </td>
                <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-1 flex-wrap">
                        <button onclick="openStockAdjustModal('${p.code}', '入庫')" class="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 px-2 py-1 rounded-lg text-xs font-bold transition-all">+ 入庫</button>
                        <button onclick="openStockAdjustModal('${p.code}', '出庫')" class="bg-red-600/30 hover:bg-red-600/50 text-red-300 px-2 py-1 rounded-lg text-xs font-bold transition-all">- 出庫</button>
                        <button onclick="openStockAdjustModal('${p.code}', '棚卸調整')" class="bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 px-2 py-1 rounded-lg text-xs font-bold transition-all">棚卸</button>
                        <button onclick="openSingleProductLabelPrint('${p.code}')" class="bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 px-2 py-1 rounded-lg text-xs font-bold transition-all" title="この商品のバーコード・名刺タグを印刷">🏷️ 印刷</button>
                        <button onclick="openEditProductModal('${p.code}')" class="bg-white/10 hover:bg-white/20 text-slate-200 px-2 py-1 rounded-lg text-xs font-bold transition-all" title="商品情報を編集（写真/価格など）">✏️ 編集</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

let targetStockCode = null;
let targetAdjustType = "入庫";

function openStockAdjustModal(code, type) {
    const product = STATE.products.find(p => p.code === code);
    if (!product) return;

    targetStockCode = code;
    targetAdjustType = type;

    document.getElementById("adjust-modal-title").innerText = `在庫の${type}`;
    document.getElementById("adjust-prod-name").innerText = `${product.name} (現在在庫: ${product.stock})`;
    
    const qtyInput = document.getElementById("adjust-qty-input");
    qtyInput.value = type === "棚卸調整" ? product.stock : "10";
    document.getElementById("adjust-memo-input").value = "";

    const modal = document.getElementById("stock-adjust-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeStockAdjustModal() {
    const modal = document.getElementById("stock-adjust-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    targetStockCode = null;
}

async function saveStockAdjust() {
    if (!targetStockCode) return;
    const product = STATE.products.find(p => p.code === targetStockCode);
    if (!product) return;

    const qty = Number(document.getElementById("adjust-qty-input").value) || 0;
    const memo = document.getElementById("adjust-memo-input").value.trim();

    let changeQty = 0;
    let newStock = Number(product.stock);

    if (targetAdjustType === "入庫") {
        changeQty = qty;
        newStock += qty;
    } else if (targetAdjustType === "出庫") {
        changeQty = -qty;
        newStock = Math.max(0, newStock - qty);
    } else if (targetAdjustType === "棚卸調整") {
        changeQty = qty - newStock;
        newStock = qty;
    }

    product.stock = newStock;
    saveProductsToLocal();
    renderProducts();
    renderInventoryTable();
    closeStockAdjustModal();

    showToast(`在庫を更新しました (新在庫: ${newStock})`, "success");

    // GASに反映
    if (STATE.isOnline && STATE.gasUrl) {
        try {
            await fetch(STATE.gasUrl, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({
                    action: "adjustStock",
                    data: {
                        code: product.code,
                        changeQty: changeQty,
                        exactStock: targetAdjustType === "棚卸調整" ? newStock : undefined,
                        type: targetAdjustType,
                        memo: memo
                    }
                })
            });
        } catch (err) {
            console.error("GAS在庫調整更新エラー:", err);
        }
    }
}

// 商品の新規追加モーダル
function openAddProductModal() {
    document.getElementById("prod-form-code").value = "ITEM" + String(STATE.products.length + 1).padStart(3, "0");
    document.getElementById("prod-form-code").readOnly = false;
    document.getElementById("prod-form-name").value = "";
    document.getElementById("prod-form-category").value = "グッズ";
    document.getElementById("prod-form-price").value = "1000";
    document.getElementById("prod-form-cost").value = "400";
    document.getElementById("prod-form-stock").value = "20";
    document.getElementById("prod-form-minstock").value = "5";
    document.getElementById("prod-form-image").value = "🎁";
    updateImagePreview("🎁");

    const modal = document.getElementById("add-product-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

// 既存商品の編集モーダル展開
function openEditProductModal(code) {
    const product = STATE.products.find(p => p.code === code);
    if (!product) return;

    document.getElementById("prod-form-code").value = product.code;
    document.getElementById("prod-form-code").readOnly = true; // コードはキーのため編集ロック
    document.getElementById("prod-form-name").value = product.name;
    document.getElementById("prod-form-category").value = product.category || "その他";
    document.getElementById("prod-form-price").value = product.price;
    document.getElementById("prod-form-cost").value = product.cost || 0;
    document.getElementById("prod-form-stock").value = product.stock;
    document.getElementById("prod-form-minstock").value = product.minStock || 5;
    document.getElementById("prod-form-image").value = product.image || "📦";
    updateImagePreview(product.image || "📦");

    const modal = document.getElementById("add-product-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

// 画像プレビュー更新
function updateImagePreview(val) {
    const preview = document.getElementById("prod-form-image-preview");
    if (!preview) return;

    const trimmed = (val || "").trim();
    if (!trimmed) {
        preview.innerHTML = "📦";
        return;
    }

    if (trimmed.startsWith("http") || trimmed.startsWith("data:image/")) {
        preview.innerHTML = `<img src="${trimmed}" class="w-full h-full object-cover" onerror="this.parentElement.innerText='⚠️'">`;
    } else {
        preview.innerHTML = trimmed;
    }
}

// プリセット絵文字のクイック選択
function selectPresetEmoji(emoji) {
    const input = document.getElementById("prod-form-image");
    if (input) {
        input.value = emoji;
        updateImagePreview(emoji);
    }
}

// ローカル画像のアップロード（Base64 DataURLにリサイズ圧縮して保存）
function handleImageFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            // スプレッドシートやlocalStorageの容量を節約するため、最大300pxに自動リサイズ圧縮
            const canvas = document.createElement("canvas");
            const maxDim = 320;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxDim) {
                    height = Math.round((height * maxDim) / width);
                    width = maxDim;
                }
            } else {
                if (height > maxDim) {
                    width = Math.round((width * maxDim) / height);
                    height = maxDim;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.75);
            const input = document.getElementById("prod-form-image");
            if (input) {
                input.value = compressedDataUrl;
                updateImagePreview(compressedDataUrl);
            }
            showToast("📷 写真を読み込みました！", "success");
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function closeAddProductModal() {
    const modal = document.getElementById("add-product-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

async function saveNewProduct() {
    const code = document.getElementById("prod-form-code").value.trim();
    const name = document.getElementById("prod-form-name").value.trim();
    const category = document.getElementById("prod-form-category").value.trim() || "その他";
    const price = Number(document.getElementById("prod-form-price").value) || 0;
    const cost = Number(document.getElementById("prod-form-cost").value) || 0;
    const stock = Number(document.getElementById("prod-form-stock").value) || 0;
    const minStock = Number(document.getElementById("prod-form-minstock").value) || 0;
    const image = document.getElementById("prod-form-image").value.trim() || "📦";

    if (!code || !name) {
        showToast("商品コードと商品名は必須です", "warning");
        return;
    }

    // 重複チェック
    const existingIdx = STATE.products.findIndex(p => p.code === code);
    const newProduct = { code, name, category, price, cost, stock, minStock, image };

    if (existingIdx !== -1) {
        STATE.products[existingIdx] = newProduct;
    } else {
        STATE.products.push(newProduct);
    }

    saveProductsToLocal();
    updateCategories();
    renderProducts();
    renderInventoryTable();
    closeAddProductModal();

    showToast(`商品「${name}」を登録しました`, "success");

    // GASに全商品を保存
    if (STATE.isOnline && STATE.gasUrl) {
        syncAllProductsToGas();
    }
}

// --- Google スプレッドシート同期 ---
async function fetchProductsFromGas() {
    if (!STATE.gasUrl) {
        showToast("GASのURLが設定されていません。設定画面から登録してください。", "info");
        return;
    }

    STATE.isSyncing = true;
    updateSyncStatus();

    try {
        const res = await fetch(`${STATE.gasUrl}?action=getProducts`);
        const result = await res.json();

        if (result.success && Array.isArray(result.products) && result.products.length > 0) {
            STATE.products = result.products.map(p => ({
                code: String(p.code),
                name: String(p.name),
                category: String(p.category || "その他"),
                price: Number(p.price) || 0,
                cost: Number(p.cost) || 0,
                stock: Number(p.stock) || 0,
                minStock: Number(p.minStock) || 5,
                image: String(p.image || "📦")
            }));
            saveProductsToLocal();
            updateCategories();
            renderProducts();
            renderInventoryTable();
            showToast("✅ スプレッドシートから最新商品・在庫を取得しました", "success");
        }
    } catch (err) {
        console.error("スプレッドシート取得エラー:", err);
        showToast("スプレッドシートの取得に失敗しました。URLまたはネット環境を確認してください。", "danger");
    } finally {
        STATE.isSyncing = false;
        updateSyncStatus();
    }
}

async function syncAllProductsToGas() {
    if (!STATE.gasUrl) return;
    try {
        await fetch(STATE.gasUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "saveProducts", data: STATE.products })
        });
        showToast("スプレッドシートの商品マスターを更新しました", "success");
    } catch(err) {
        console.error("全商品同期エラー:", err);
    }
}

// オフラインキューの管理
function enqueueOfflineOrder(order) {
    STATE.offlineQueue.push(order);
    localStorage.setItem("pos_offline_queue", JSON.stringify(STATE.offlineQueue));
    updateOfflineQueueBadge();
}

async function syncOfflineQueue() {
    if (STATE.offlineQueue.length === 0 || !STATE.isOnline || !STATE.gasUrl) return;

    STATE.isSyncing = true;
    updateSyncStatus();
    showToast(`${STATE.offlineQueue.length}件の未送信データをスプレッドシートに送信中...`, "info");

    try {
        const res = await fetch(STATE.gasUrl, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ action: "batchCheckout", data: STATE.offlineQueue })
        });
        const result = await res.json();
        if (result.success) {
            STATE.offlineQueue = [];
            localStorage.setItem("pos_offline_queue", "[]");
            updateOfflineQueueBadge();
            showToast("🎉 保留中のすべての売上がスプレッドシートに同期されました！", "success");
            // 最新在庫を再取得
            fetchProductsFromGas();
        }
    } catch (err) {
        console.error("オフラインキュー同期失敗:", err);
        showToast("オフラインキューの同期に失敗しました", "danger");
    } finally {
        STATE.isSyncing = false;
        updateSyncStatus();
    }
}

function updateOfflineQueueBadge() {
    const badge = document.getElementById("offline-badge");
    if (!badge) return;
    if (STATE.offlineQueue.length > 0) {
        badge.innerText = `${STATE.offlineQueue.length}件未送信`;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

function updateSyncStatus() {
    const statusEl = document.getElementById("sync-status-indicator");
    if (!statusEl) return;

    if (!STATE.isOnline) {
        statusEl.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5"></span>オフライン`;
    } else if (STATE.isSyncing) {
        statusEl.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping mr-1.5"></span>同期中...`;
    } else {
        statusEl.innerHTML = `<span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5"></span>オンライン連動中`;
    }
}

// --- 設定モーダル ---
function openSettingsModal() {
    document.getElementById("setting-gas-url").value = STATE.gasUrl;
    document.getElementById("setting-store-name").value = STATE.storeName;
    document.getElementById("setting-tax-rate").value = STATE.taxRate;

    const modal = document.getElementById("settings-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeSettingsModal() {
    const modal = document.getElementById("settings-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

async function saveSettingsAndTest() {
    const gasUrl = document.getElementById("setting-gas-url").value.trim();
    const storeName = document.getElementById("setting-store-name").value.trim() || "異次元ポケットショップ";
    const taxRate = Number(document.getElementById("setting-tax-rate").value) || 10;

    STATE.gasUrl = gasUrl;
    STATE.storeName = storeName;
    STATE.taxRate = taxRate;

    localStorage.setItem("pos_gas_url", gasUrl);
    localStorage.setItem("pos_store_name", storeName);
    localStorage.setItem("pos_tax_rate", taxRate);

    document.getElementById("header-store-name").innerText = storeName;

    if (gasUrl) {
        showToast("スプレッドシートとの接続テスト中...", "info");
        try {
            const res = await fetch(`${gasUrl}?action=ping`);
            const data = await res.json();
            if (data.success) {
                showToast("🎉 スプレッドシート接続成功！", "success");
                closeSettingsModal();
                fetchProductsFromGas();
                return;
            }
        } catch (e) {
            showToast("接続テストに失敗しました。URLとデプロイ設定(アクセス:全員)を確認してください。", "danger");
            return;
        }
    }

    closeSettingsModal();
    showToast("設定を保存しました", "success");
}

// --- ユーティリティ ---
function saveProductsToLocal() {
    localStorage.setItem("pos_cached_products", JSON.stringify(STATE.products));
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pos_theme", theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(current === "dark" ? "light" : "dark");
}

function switchView(viewName) {
    const posView = document.getElementById("pos-view");
    const inventoryView = document.getElementById("inventory-view");
    const tabPos = document.getElementById("tab-btn-pos");
    const tabInv = document.getElementById("tab-btn-inv");

    if (viewName === "pos") {
        posView.classList.remove("hidden");
        inventoryView.classList.add("hidden");
        tabPos.className = "px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all";
        tabInv.className = "px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all";
    } else {
        posView.classList.add("hidden");
        inventoryView.classList.remove("hidden");
        renderInventoryTable();
        tabInv.className = "px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all";
        tabPos.className = "px-4 py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-all";
    }
}

function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;

    let bgClass = "bg-slate-800 border-slate-700 text-white";
    if (type === "success") bgClass = "bg-emerald-900/90 border-emerald-500 text-emerald-100";
    if (type === "warning") bgClass = "bg-amber-900/90 border-amber-500 text-amber-100";
    if (type === "danger") bgClass = "bg-red-900/90 border-red-500 text-red-100";

    toast.className = `fixed bottom-6 right-6 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 z-50 animate-bounce duration-300 ${bgClass}`;
    toast.innerHTML = message;
    toast.classList.remove("hidden");

    setTimeout(() => {
        toast.classList.add("hidden");
    }, 4000);
}

function closeAllModals() {
    closeCheckoutModal();
    closeReceiptModal();
    closeSettingsModal();
    closeStockAdjustModal();
    closeAddProductModal();
    closeLabelPrintModal();
    if (STATE.scannerActive) toggleBarcodeScanner();
}

function formatDateId(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}-${Math.floor(Math.random()*1000)}`;
}

// ==================== バーコード・QRコード ラベル / 名刺タグ印刷機能 ====================
let labelPrintSelection = {}; // { [code]: quantity }

function openLabelPrintModal(targetCode = null) {
    const modal = document.getElementById("label-print-modal");
    if (!modal) return;

    // 印刷選択の初期化
    labelPrintSelection = {};
    if (targetCode) {
        labelPrintSelection[targetCode] = 1;
    } else {
        // デフォルトは全商品1枚ずつ
        STATE.products.forEach(p => {
            labelPrintSelection[p.code] = 1;
        });
    }

    renderLabelProductSelectList();
    updateLabelPreview();

    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function openSingleProductLabelPrint(code) {
    openLabelPrintModal(code);
}

function closeLabelPrintModal() {
    const modal = document.getElementById("label-print-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

function renderLabelProductSelectList() {
    const container = document.getElementById("label-product-select-list");
    if (!container) return;

    container.innerHTML = STATE.products.map(p => {
        const qty = labelPrintSelection[p.code] || 0;
        const isImageEmoji = !p.image || (!p.image.startsWith("http") && !p.image.startsWith("data:image/"));
        return `
            <div class="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                <div class="flex items-center gap-2 overflow-hidden flex-1 mr-2">
                    <div class="w-6 h-6 rounded bg-black/30 flex items-center justify-center text-xs flex-shrink-0">
                        ${isImageEmoji ? (p.image || "📦") : `<img src="${p.image}" class="w-full h-full object-cover rounded">`}
                    </div>
                    <div class="truncate">
                        <div class="font-bold truncate text-slate-200">${p.name}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${p.code} / ¥${Number(p.price).toLocaleString()}</div>
                    </div>
                </div>
                <div class="flex items-center gap-1 flex-shrink-0">
                    <input type="number" min="0" max="99" value="${qty}" 
                        onchange="updateLabelItemQty('${p.code}', this.value)"
                        class="w-12 p-1 bg-white/10 border border-white/10 rounded-lg text-center font-mono text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <span class="text-[11px] text-slate-400">枚</span>
                </div>
            </div>
        `;
    }).join("");
}

function updateLabelItemQty(code, qty) {
    const count = Math.max(0, parseInt(qty, 10) || 0);
    labelPrintSelection[code] = count;
    updateLabelPreview();
}

function setAllLabelCopies(qty) {
    STATE.products.forEach(p => {
        labelPrintSelection[p.code] = qty;
    });
    renderLabelProductSelectList();
    updateLabelPreview();
}

function setLabelCopiesByStock() {
    STATE.products.forEach(p => {
        const stock = Math.max(1, parseInt(p.stock, 10) || 1);
        labelPrintSelection[p.code] = stock;
    });
    renderLabelProductSelectList();
    updateLabelPreview();
}

function updateLabelPreview() {
    const sheet = document.getElementById("label-print-sheet");
    const summaryEl = document.getElementById("label-summary-info");
    if (!sheet) return;

    // 設定値の取得
    const codeTypeRadio = document.querySelector('input[name="label-code-type"]:checked');
    const codeType = codeTypeRadio ? codeTypeRadio.value : "barcode";
    const layoutType = document.getElementById("label-layout-type") ? document.getElementById("label-layout-type").value : "business_card";

    const showImage = document.getElementById("chk-show-image") ? document.getElementById("chk-show-image").checked : true;
    const showPrice = document.getElementById("chk-show-price") ? document.getElementById("chk-show-price").checked : true;
    const showCategory = document.getElementById("chk-show-category") ? document.getElementById("chk-show-category").checked : true;
    const showStore = document.getElementById("chk-show-store") ? document.getElementById("chk-show-store").checked : true;

    // 出力カードの生成リスト
    const cardsToRender = [];
    let totalCopies = 0;

    STATE.products.forEach(p => {
        const qty = labelPrintSelection[p.code] || 0;
        if (qty > 0) {
            totalCopies += qty;
            for (let i = 0; i < qty; i++) {
                cardsToRender.push(p);
            }
        }
    });

    if (summaryEl) {
        summaryEl.innerText = `印刷合計: ${totalCopies}枚（${cardsToRender.length}枚プレビュー中）`;
    }

    if (cardsToRender.length === 0) {
        sheet.innerHTML = `
            <div class="w-full py-16 text-center text-slate-400 font-medium">
                <div class="text-3xl mb-2">🏷️</div>
                印刷対象の商品枚数が 0枚 です。<br>左側のリストから枚数を指定してください。
            </div>
        `;
        return;
    }

    // カードのHTML構造組み立て
    sheet.innerHTML = cardsToRender.map((p, idx) => {
        const isImageEmoji = !p.image || (!p.image.startsWith("http") && !p.image.startsWith("data:image/"));
        const cardId = `label-card-${idx}`;
        const codeElementId = `label-code-el-${idx}`;

        let cardInnerHtml = "";

        if (layoutType === "business_card") {
            // 名刺サイズ 横型 (91 x 55mm)
            cardInnerHtml = `
                <div class="flex justify-between items-start border-b border-slate-200 pb-1 mb-1">
                    <div class="overflow-hidden pr-2">
                        ${showCategory && p.category ? `<span class="inline-block text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-bold">${p.category}</span>` : ''}
                        <h4 class="font-bold text-[13px] leading-tight text-slate-900 mt-0.5 truncate">${p.name}</h4>
                    </div>
                    ${showStore ? `<span class="text-[9px] text-slate-500 font-medium whitespace-nowrap">${STATE.storeName}</span>` : ''}
                </div>

                <div class="flex items-center gap-3 flex-1 overflow-hidden my-0.5">
                    ${showImage ? `
                        <div class="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                            ${isImageEmoji ? (p.image || "📦") : `<img src="${p.image}" class="w-full h-full object-cover">`}
                        </div>
                    ` : ''}
                    
                    <div class="flex-1 flex flex-col justify-center overflow-hidden">
                        ${showPrice ? `
                            <div class="text-[10px] text-slate-500">販売価格 (税込)</div>
                            <div class="text-xl font-black font-mono text-blue-600 leading-tight">¥${Number(p.price).toLocaleString()}</div>
                        ` : ''}
                        <div class="text-[9px] text-slate-400 font-mono mt-0.5">CODE: ${p.code}</div>
                    </div>
                </div>

                <div class="border-t border-slate-100 pt-1 flex items-center justify-center h-11">
                    ${codeType === "barcode" 
                        ? `<svg id="${codeElementId}" class="label-barcode-svg"></svg>`
                        : `<div id="${codeElementId}" class="label-qrcode-container"></div>`
                    }
                </div>
            `;
        } else if (layoutType === "business_card_vert") {
            // 名刺サイズ 縦型 (55 x 91mm)
            cardInnerHtml = `
                <div class="w-full text-center border-b border-slate-200 pb-1 mb-1">
                    ${showStore ? `<div class="text-[8px] text-slate-400 font-medium">${STATE.storeName}</div>` : ''}
                    ${showCategory && p.category ? `<span class="inline-block text-[8px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-bold">${p.category}</span>` : ''}
                    <h4 class="font-bold text-[12px] leading-tight text-slate-900 mt-0.5">${p.name}</h4>
                </div>

                ${showImage ? `
                    <div class="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl overflow-hidden my-1 flex-shrink-0">
                        ${isImageEmoji ? (p.image || "📦") : `<img src="${p.image}" class="w-full h-full object-cover">`}
                    </div>
                ` : ''}

                ${showPrice ? `
                    <div class="w-full my-1">
                        <div class="text-[9px] text-slate-500">価格 (税込)</div>
                        <div class="text-lg font-black font-mono text-blue-600 leading-none">¥${Number(p.price).toLocaleString()}</div>
                    </div>
                ` : ''}

                <div class="w-full border-t border-slate-100 pt-1 flex flex-col items-center justify-center">
                    ${codeType === "barcode" 
                        ? `<svg id="${codeElementId}" class="label-barcode-svg"></svg>`
                        : `<div id="${codeElementId}" class="label-qrcode-container"></div>`
                    }
                    <div class="text-[8px] text-slate-400 font-mono mt-0.5">${p.code}</div>
                </div>
            `;
        } else {
            // コンパクト値札タグ (65 x 38mm)
            cardInnerHtml = `
                <div class="flex justify-between items-center border-b border-slate-200 pb-0.5 mb-0.5">
                    <h4 class="font-bold text-[11px] leading-tight text-slate-900 truncate flex-1">${p.name}</h4>
                    ${showPrice ? `<span class="text-sm font-black font-mono text-blue-600 ml-2 whitespace-nowrap">¥${Number(p.price).toLocaleString()}</span>` : ''}
                </div>
                <div class="flex items-center gap-2 flex-1 overflow-hidden">
                    ${showImage ? `
                        <div class="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-base overflow-hidden flex-shrink-0">
                            ${isImageEmoji ? (p.image || "📦") : `<img src="${p.image}" class="w-full h-full object-cover">`}
                        </div>
                    ` : ''}
                    <div class="flex-1 flex items-center justify-center h-8">
                        ${codeType === "barcode" 
                            ? `<svg id="${codeElementId}" class="label-barcode-svg"></svg>`
                            : `<div id="${codeElementId}" class="label-qrcode-container"></div>`
                        }
                    </div>
                </div>
                <div class="flex justify-between items-center text-[8px] text-slate-400 font-mono border-t border-slate-100 pt-0.5">
                    <span>${p.code}</span>
                    ${showStore ? `<span>${STATE.storeName}</span>` : ''}
                </div>
            `;
        }

        return `
            <div class="label-card ${layoutType}" id="${cardId}">
                ${cardInnerHtml}
            </div>
        `;
    }).join("");

    // バーコード & QRコードの描画処理
    setTimeout(() => {
        cardsToRender.forEach((p, idx) => {
            const codeElementId = `label-code-el-${idx}`;
            const targetEl = document.getElementById(codeElementId);
            if (!targetEl) return;

            const codeValue = String(p.code).trim() || "000000";

            if (codeType === "barcode") {
                try {
                    // JsBarcodeによるバーコード生成
                    if (window.JsBarcode) {
                        JsBarcode(`#${codeElementId}`, codeValue, {
                            format: "CODE128",
                            lineColor: "#0f172a",
                            width: 1.3,
                            height: layoutType === "tag_compact" ? 22 : 30,
                            displayValue: false, // カード下部にテキスト表示しているため非表示でスッキリ
                            margin: 0
                        });
                    }
                } catch (e) {
                    console.warn("バーコード描画エラー:", e);
                }
            } else {
                // QRCode.jsによるQRコード生成
                try {
                    targetEl.innerHTML = "";
                    const qrSize = layoutType === "tag_compact" ? 30 : (layoutType === "business_card_vert" ? 42 : 38);
                    if (window.QRCode) {
                        new QRCode(targetEl, {
                            text: codeValue,
                            width: qrSize,
                            height: qrSize,
                            colorDark: "#0f172a",
                            colorLight: "#ffffff",
                            correctLevel: QRCode.CorrectLevel.M
                        });
                    }
                } catch (e) {
                    console.warn("QRコード描画エラー:", e);
                }
            }
        });
    }, 50);
}

function executeLabelPrint() {
    document.body.classList.remove("printing-receipt");
    document.body.classList.add("printing-labels");
    window.print();
    setTimeout(() => {
        document.body.classList.remove("printing-labels");
    }, 1000);
}

