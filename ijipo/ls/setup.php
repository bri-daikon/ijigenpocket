<?php
declare(strict_types=1);

const SETUP_ROOT = __DIR__;
$configPath = SETUP_ROOT . '/config.php';
$installed = is_file($configPath);
$errors = [];
$success = false;

function setup_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function setup_schema(PDO $pdo): void
{
    $pdo->exec("CREATE TABLE IF NOT EXISTS works (
        id VARCHAR(100) NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        series VARCHAR(255) NOT NULL DEFAULT '',
        type VARCHAR(30) NOT NULL DEFAULT 'その他',
        category VARCHAR(100) NOT NULL DEFAULT '日常',
        release_date DATE NULL,
        status VARCHAR(30) NOT NULL DEFAULT '下書き',
        description TEXT NOT NULL,
        store_url VARCHAR(1000) NOT NULL DEFAULT '',
        image_url TEXT NOT NULL,
        accent CHAR(7) NOT NULL DEFAULT '#197a63',
        tags TEXT NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_category (category),
        INDEX idx_status (status),
        INDEX idx_sort (sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    $pdo->exec("CREATE TABLE IF NOT EXISTS app_settings (
        setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
        setting_value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
}

function setup_seed(PDO $pdo): int
{
    $path = SETUP_ROOT . '/data/initial-products.json';
    $products = json_decode((string)file_get_contents($path), true);
    if (!is_array($products)) throw new RuntimeException('初期作品データを読み込めませんでした。');
    $sql = 'INSERT INTO works
        (id, title, series, type, category, release_date, status, description, store_url, image_url, accent, tags, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE store_url = VALUES(store_url), image_url = VALUES(image_url), sort_order = VALUES(sort_order)';
    $statement = $pdo->prepare($sql);
    foreach ($products as $index => $work) {
        $statement->execute([
            (string)$work['id'], (string)$work['title'], (string)$work['series'], (string)$work['type'],
            (string)$work['category'], !empty($work['releaseDate']) ? $work['releaseDate'] : null,
            (string)$work['status'], (string)$work['description'], (string)$work['storeUrl'],
            (string)$work['image'], (string)$work['accent'],
            json_encode($work['tags'] ?? [], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $index,
        ]);
    }
    return count($products);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$installed) {
    $host = trim((string)($_POST['db_host'] ?? ''));
    $port = (int)($_POST['db_port'] ?? 3306);
    $name = trim((string)($_POST['db_name'] ?? ''));
    $user = trim((string)($_POST['db_user'] ?? ''));
    $pass = (string)($_POST['db_pass'] ?? '');
    $adminPassword = (string)($_POST['admin_password'] ?? '');
    $adminConfirm = (string)($_POST['admin_confirm'] ?? '');
    $siteTitle = trim((string)($_POST['site_title'] ?? 'アイアイのLINEスタンプ作品集'));

    if ($host === '' || $name === '' || $user === '') $errors[] = 'MySQLのサーバー・データベース名・ユーザー名を入力してください。';
    if (strlen($adminPassword) < 12) $errors[] = '管理パスワードは12文字以上にしてください。';
    if ($adminPassword !== $adminConfirm) $errors[] = '管理パスワードの確認入力が一致しません。';
    $requiredExtensions = ['pdo_mysql' => 'PDO MySQL', 'mbstring' => 'mbstring', 'dom' => 'DOM', 'fileinfo' => 'Fileinfo'];
    foreach ($requiredExtensions as $extension => $label) {
        if (!extension_loaded($extension)) $errors[] = "{$label}が利用できません。ロリポップのPHP設定を確認してください。";
    }

    if (!$errors) {
        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            setup_schema($pdo);
            $seedCount = setup_seed($pdo);
            $config = [
                'db' => ['host' => $host, 'port' => $port, 'name' => $name, 'user' => $user, 'pass' => $pass],
                'admin_password_hash' => password_hash($adminPassword, PASSWORD_DEFAULT),
                'site_title' => $siteTitle !== '' ? $siteTitle : 'アイアイのLINEスタンプ作品集',
                'timezone' => 'Asia/Tokyo',
                'session_name' => 'aiai_sticker_' . bin2hex(random_bytes(5)),
                'author_url' => 'https://store.line.me/stickershop/author/6151799/ja',
            ];
            $contents = "<?php\ndeclare(strict_types=1);\n\nreturn " . var_export($config, true) . ";\n";
            if (file_put_contents($configPath, $contents, LOCK_EX) === false) {
                throw new RuntimeException('config.phpを書き込めません。フォルダの書き込み権限を確認してください。');
            }
            @chmod($configPath, 0600);
            if (!is_dir(SETUP_ROOT . '/uploads')) @mkdir(SETUP_ROOT . '/uploads', 0755, true);
            $success = true;
            $installed = true;
        } catch (Throwable $error) {
            $errors[] = '設定に失敗しました：' . $error->getMessage();
        }
    }
}

$phpOkay = version_compare(PHP_VERSION, '8.1.0', '>=');
?>
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Sticker Shelf 初期設定</title>
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="setupPage">
  <main class="setupCard">
    <div class="setupBrand"><span>AI</span><div><b>Sticker Shelf</b><small>ロリポップ！初期設定</small></div></div>
    <?php if ($success): ?>
      <div class="setupResult successBox">
        <p class="eyebrow">SETUP COMPLETE</p>
        <h1>準備ができました！</h1>
        <p><?= (int)$seedCount ?>件のLINE作品をMySQLへ登録しました。ここからは設定した管理パスワードでログインできます。</p>
        <a class="primaryButton" href="index.php">管理画面を開く</a>
      </div>
    <?php elseif ($installed): ?>
      <div class="setupResult">
        <p class="eyebrow">ALREADY INSTALLED</p>
        <h1>初期設定は完了しています</h1>
        <p>再設定が必要な場合は、先にサーバー上の <code>config.php</code> をバックアップしてください。</p>
        <a class="primaryButton" href="index.php">管理画面を開く</a>
      </div>
    <?php else: ?>
      <p class="eyebrow">FIRST SETUP</p>
      <h1>作品棚をサーバーに作る</h1>
      <p class="setupLead">ロリポップの「データベース」画面に表示される接続情報を入力してください。パスワードはこのサーバー内だけに保存されます。</p>
      <?php if (!$phpOkay): ?><div class="errorBox">PHP 8.1以上が必要です。現在：<?= setup_h(PHP_VERSION) ?></div><?php endif; ?>
      <?php foreach ($errors as $error): ?><div class="errorBox"><?= setup_h($error) ?></div><?php endforeach; ?>
      <form method="post" class="setupForm" autocomplete="off">
        <label class="field full"><span>サイト名</span><input name="site_title" value="<?= setup_h((string)($_POST['site_title'] ?? 'アイアイのLINEスタンプ作品集')) ?>" required></label>
        <label class="field full"><span>データベースサーバー</span><input name="db_host" value="<?= setup_h((string)($_POST['db_host'] ?? '')) ?>" placeholder="mysql000.phy.lolipop.lan" required></label>
        <label class="field"><span>ポート</span><input name="db_port" inputmode="numeric" value="<?= setup_h((string)($_POST['db_port'] ?? '3306')) ?>" required></label>
        <label class="field"><span>データベース名</span><input name="db_name" value="<?= setup_h((string)($_POST['db_name'] ?? '')) ?>" required></label>
        <label class="field"><span>ユーザー名</span><input name="db_user" value="<?= setup_h((string)($_POST['db_user'] ?? '')) ?>" required></label>
        <label class="field"><span>データベースパスワード</span><input type="password" name="db_pass" required></label>
        <label class="field"><span>管理パスワード（12文字以上）</span><input type="password" name="admin_password" minlength="12" required autocomplete="new-password"></label>
        <label class="field"><span>管理パスワードの確認</span><input type="password" name="admin_confirm" minlength="12" required autocomplete="new-password"></label>
        <button class="primaryButton setupSubmit" type="submit" <?= !$phpOkay ? 'disabled' : '' ?>>初期設定を実行</button>
      </form>
      <p class="setupHelp">接続情報はロリポップの「サーバーの管理・設定 → データベース」で確認できます。</p>
    <?php endif; ?>
  </main>
</body>
</html>
