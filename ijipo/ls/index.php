<?php
declare(strict_types=1);

if (!is_file(__DIR__ . '/config.php')) {
    header('Location: setup.php');
    exit;
}

require __DIR__ . '/bootstrap.php';
$loginError = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_password'])) {
    $sentToken = (string)($_POST['csrf_token'] ?? '');
    if (!hash_equals(csrf_token(), $sentToken)) {
        $loginError = 'ページを再読み込みして、もう一度お試しください。';
    } elseif (!empty($_SESSION['login_locked_until']) && (int)$_SESSION['login_locked_until'] > time()) {
        $loginError = '試行回数が多いため、しばらく待ってからお試しください。';
    } elseif (password_verify((string)$_POST['login_password'], (string)(app_config()['admin_password_hash'] ?? ''))) {
        session_regenerate_id(true);
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['login_failures'] = 0;
        unset($_SESSION['login_locked_until']);
        header('Location: index.php');
        exit;
    } else {
        $_SESSION['login_failures'] = (int)($_SESSION['login_failures'] ?? 0) + 1;
        if ($_SESSION['login_failures'] >= 5) {
            $_SESSION['login_locked_until'] = time() + 300;
            $_SESSION['login_failures'] = 0;
        }
        $loginError = '管理パスワードが違います。';
    }
}

$siteTitle = (string)(app_config()['site_title'] ?? 'アイアイのLINEスタンプ作品集');
function page_h(string $value): string { return htmlspecialchars($value, ENT_QUOTES, 'UTF-8'); }
?>
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="csrf-token" content="<?= page_h(csrf_token()) ?>">
  <title><?= page_h($siteTitle) ?></title>
  <link rel="stylesheet" href="assets/style.css?v=1.0.0">
</head>
<?php if (!is_logged_in()): ?>
<body class="loginPage">
  <main class="loginCard">
    <div class="setupBrand"><span>AI</span><div><b>Sticker Shelf</b><small>PRIVATE COLLECTION</small></div></div>
    <p class="eyebrow">WELCOME BACK</p>
    <h1><?= page_h($siteTitle) ?></h1>
    <p>この作品棚は非公開です。管理パスワードを入力してください。</p>
    <?php if ($loginError !== ''): ?><div class="errorBox"><?= page_h($loginError) ?></div><?php endif; ?>
    <form method="post" class="loginForm">
      <input type="hidden" name="csrf_token" value="<?= page_h(csrf_token()) ?>">
      <label class="field"><span>管理パスワード</span><input type="password" name="login_password" required autofocus autocomplete="current-password"></label>
      <button class="primaryButton" type="submit">作品棚を開く</button>
    </form>
  </main>
</body>
<?php else: ?>
<body>
  <header class="siteHeader">
    <a class="brand" href="#top"><span class="brandMark">AI</span><span><strong>Sticker Shelf</strong><small><?= page_h($siteTitle) ?></small></span></a>
    <div class="headerActions">
      <span class="privateBadge"><span>●</span> 非公開</span>
      <button class="primaryButton compact" id="newWorkButton" type="button">＋ 作品を登録</button>
      <button class="iconButton" id="logoutButton" type="button" title="ログアウト">退出</button>
    </div>
  </header>

  <main>
    <section class="hero" id="top">
      <div class="heroCopy">
        <p class="eyebrow">MY LINE CREATIONS</p>
        <h1>作品が増えるほど、<br><em>探しやすく。</em></h1>
        <p class="heroText">LINEスタンプ・絵文字・着せかえをサーバーで一括管理。どの端末から開いても、同じ作品一覧を検索・編集できます。</p>
        <div class="heroButtons">
          <button class="primaryButton" id="heroNewButton" type="button">＋ 新しい作品を登録</button>
          <button class="ghostButton" id="syncButton" type="button">↻ LINEから同期</button>
          <a class="ghostButton buttonLink" href="api.php?action=export">⇩ バックアップ</a>
          <button class="textButton" id="importButton" type="button">⇧ 読み込み</button>
          <input type="file" id="importInput" accept="application/json" hidden>
        </div>
        <p class="saveNote"><span>✓</span> 作品データはロリポップのMySQLへ保存されます</p>
      </div>
      <div class="heroStats">
        <div class="statPrimary"><span>COLLECTION</span><strong id="totalStat">—</strong><p>登録作品</p></div>
        <div class="statSmall">
          <span><b id="saleStat">—</b>販売中</span>
          <span><b id="seriesStat">—</b>シリーズ</span>
          <span><b id="draftStat">—</b>準備・下書き</span>
        </div>
        <div class="decoSticker decoOne">LIVE</div><div class="decoSticker decoTwo">★</div>
      </div>
    </section>

    <section class="collection">
      <div class="collectionHead"><div><p class="eyebrow">COLLECTION</p><h2>作品一覧</h2></div><p><strong id="filteredCount">0</strong> / <span id="allCount">0</span> 作品</p></div>
      <div class="toolbar">
        <label class="searchBox"><span>⌕</span><input id="searchInput" placeholder="タイトル・シリーズ・タグを検索"><button id="clearSearch" type="button" aria-label="検索語を消去">×</button></label>
        <div class="selectGroup">
          <label><span>カテゴリ</span><select id="categorySelect"><option>すべて</option></select></label>
          <label><span>並び順</span><select id="sortSelect"><option value="default">LINE掲載順</option><option value="title">タイトル順</option><option value="newest">更新が新しい順</option></select></label>
        </div>
      </div>
      <div class="categoryRow">
        <div class="typeTabs" id="typeTabs"></div>
        <div class="syncStatus" id="syncStatus">読み込み中…</div>
      </div>
      <div class="workGrid" id="workGrid"></div>
      <div class="emptyState" id="emptyState" hidden><span>⌕</span><h3>作品が見つかりませんでした</h3><p>検索語やカテゴリを変えてみましょう。</p></div>
      <button class="loadMore" id="loadMoreButton" type="button" hidden>もっと見る</button>
    </section>
  </main>

  <footer><p>Sticker Shelf <span>·</span> Private collection</p><p><a href="<?= page_h((string)(app_config()['author_url'] ?? '#')) ?>" target="_blank" rel="noreferrer">LINE STORE 作者ページ ↗</a></p></footer>

  <div class="modalBackdrop" id="workModal" hidden>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modalHeader"><div><p class="eyebrow">WORK EDITOR</p><h2 id="modalTitle">新しい作品を登録</h2></div><button id="closeModal" type="button">×</button></div>
      <form id="workForm">
        <input type="hidden" name="id">
        <input type="hidden" name="image">
        <div class="formGrid">
          <label class="field full"><span>作品タイトル <b>必須</b></span><input name="title" required></label>
          <label class="field full"><span>シリーズ名</span><input name="series"></label>
          <label class="field"><span>作品タイプ</span><select name="type"><option>スタンプ</option><option>絵文字</option><option>着せかえ</option><option>その他</option></select></label>
          <label class="field"><span>カテゴリ</span><input name="category" value="日常"></label>
          <label class="field"><span>リリース日</span><input name="releaseDate" type="date"></label>
          <label class="field"><span>ステータス</span><select name="status"><option>販売中</option><option>準備中</option><option>下書き</option></select></label>
          <label class="field full"><span>紹介文</span><textarea name="description" rows="3"></textarea></label>
          <label class="field full"><span>タグ <small>カンマ区切り</small></span><input name="tags"></label>
          <label class="field full"><span>LINE STORE URL</span><input name="storeUrl" type="url"></label>
          <div class="field full"><span>作品画像</span><div class="imageEditor"><div class="imagePreview" id="imagePreview">作</div><div><label class="uploadButton">画像を選ぶ<input id="imageInput" type="file" accept="image/jpeg,image/png,image/webp,image/gif"></label><button class="removeImage" id="removeImage" type="button">画像を外す</button><p>5MBまでのJPEG・PNG・WebP・GIFに対応します。</p></div></div></div>
          <label class="field full"><span>アクセントカラー</span><input class="colorInput" name="accent" type="color" value="#197a63"></label>
        </div>
        <div class="modalFooter"><button class="ghostButton" id="cancelModal" type="button">キャンセル</button><button class="primaryButton" type="submit">保存する</button></div>
      </form>
    </div>
  </div>
  <div class="toast" id="toast" hidden></div>
  <script src="assets/app.js?v=1.0.0" defer></script>
</body>
<?php endif; ?>
</html>
