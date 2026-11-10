<?php
declare(strict_types=1);

const APP_ROOT = __DIR__;
const CONFIG_FILE = APP_ROOT . '/config.php';

if (!is_file(CONFIG_FILE)) {
    throw new RuntimeException('初期設定が完了していません。setup.phpを開いてください。');
}

$config = require CONFIG_FILE;
if (!is_array($config)) {
    throw new RuntimeException('config.phpの形式が正しくありません。');
}

date_default_timezone_set((string)($config['timezone'] ?? 'Asia/Tokyo'));

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_name((string)($config['session_name'] ?? 'aiai_sticker_shelf'));
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

function app_config(): array
{
    global $config;
    return $config;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $db = app_config()['db'] ?? [];
    $host = (string)($db['host'] ?? '');
    $port = (int)($db['port'] ?? 3306);
    $name = (string)($db['name'] ?? '');
    $dsn = "mysql:host={$host};port={$port};dbname={$name};charset=utf8mb4";
    $pdo = new PDO($dsn, (string)($db['user'] ?? ''), (string)($db['pass'] ?? ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function is_logged_in(): bool
{
    return !empty($_SESSION['admin_logged_in']);
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return (string)$_SESSION['csrf_token'];
}

function verify_csrf(): void
{
    $sent = (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? '');
    if (!hash_equals(csrf_token(), $sent)) {
        json_response(['error' => 'セキュリティトークンが一致しません。ページを再読み込みしてください。'], 419);
    }
}

function require_login(): void
{
    if (!is_logged_in()) {
        json_response(['error' => 'ログインが必要です。'], 401);
    }
}

function json_response(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_response(['error' => '送信データの形式が正しくありません。'], 400);
    }
    return $decoded;
}

function work_row_to_array(array $row): array
{
    $tags = json_decode((string)($row['tags'] ?? '[]'), true);
    return [
        'id' => (string)$row['id'],
        'title' => (string)$row['title'],
        'series' => (string)$row['series'],
        'type' => (string)$row['type'],
        'category' => (string)$row['category'],
        'releaseDate' => $row['release_date'] ? (string)$row['release_date'] : '',
        'status' => (string)$row['status'],
        'description' => (string)$row['description'],
        'storeUrl' => (string)$row['store_url'],
        'image' => (string)$row['image_url'],
        'accent' => (string)$row['accent'],
        'tags' => is_array($tags) ? array_values($tags) : [],
        'sortOrder' => (int)$row['sort_order'],
        'createdAt' => (string)$row['created_at'],
        'updatedAt' => (string)$row['updated_at'],
    ];
}

function clean_work(array $input): array
{
    $allowedTypes = ['スタンプ', '絵文字', '着せかえ', 'その他'];
    $allowedStatuses = ['販売中', '準備中', '下書き'];
    $id = trim((string)($input['id'] ?? ''));
    if ($id === '') {
        $id = 'manual-' . bin2hex(random_bytes(8));
    }
    $title = trim((string)($input['title'] ?? ''));
    if ($title === '') {
        throw new InvalidArgumentException('作品タイトルは必須です。');
    }
    $tags = $input['tags'] ?? [];
    if (is_string($tags)) {
        $tags = preg_split('/[,、]/u', $tags) ?: [];
    }
    $tags = array_values(array_unique(array_filter(array_map(
        static fn($tag) => mb_substr(trim((string)$tag), 0, 50),
        is_array($tags) ? $tags : []
    ))));
    $releaseDate = trim((string)($input['releaseDate'] ?? ''));
    if ($releaseDate !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $releaseDate)) {
        $releaseDate = '';
    }
    $accent = trim((string)($input['accent'] ?? '#197a63'));
    if (!preg_match('/^#[0-9a-f]{6}$/i', $accent)) {
        $accent = '#197a63';
    }
    return [
        'id' => mb_substr($id, 0, 100),
        'title' => mb_substr($title, 0, 255),
        'series' => mb_substr(trim((string)($input['series'] ?? '')), 0, 255),
        'type' => in_array($input['type'] ?? '', $allowedTypes, true) ? $input['type'] : 'その他',
        'category' => mb_substr(trim((string)($input['category'] ?? '日常')), 0, 100),
        'releaseDate' => $releaseDate,
        'status' => in_array($input['status'] ?? '', $allowedStatuses, true) ? $input['status'] : '下書き',
        'description' => mb_substr(trim((string)($input['description'] ?? '')), 0, 5000),
        'storeUrl' => mb_substr(trim((string)($input['storeUrl'] ?? '')), 0, 1000),
        'image' => mb_substr(trim((string)($input['image'] ?? '')), 0, 2000),
        'accent' => strtolower($accent),
        'tags' => $tags,
        'sortOrder' => (int)($input['sortOrder'] ?? 0),
    ];
}

function upsert_work(PDO $pdo, array $work): void
{
    $sql = 'INSERT INTO works
        (id, title, series, type, category, release_date, status, description, store_url, image_url, accent, tags, sort_order)
        VALUES
        (:id, :title, :series, :type, :category, :release_date, :status, :description, :store_url, :image_url, :accent, :tags, :sort_order)
        ON DUPLICATE KEY UPDATE
        title = VALUES(title), series = VALUES(series), type = VALUES(type), category = VALUES(category),
        release_date = VALUES(release_date), status = VALUES(status), description = VALUES(description),
        store_url = VALUES(store_url), image_url = VALUES(image_url), accent = VALUES(accent),
        tags = VALUES(tags), sort_order = VALUES(sort_order), updated_at = CURRENT_TIMESTAMP';
    $statement = $pdo->prepare($sql);
    $statement->execute([
        ':id' => $work['id'],
        ':title' => $work['title'],
        ':series' => $work['series'],
        ':type' => $work['type'],
        ':category' => $work['category'],
        ':release_date' => $work['releaseDate'] !== '' ? $work['releaseDate'] : null,
        ':status' => $work['status'],
        ':description' => $work['description'],
        ':store_url' => $work['storeUrl'],
        ':image_url' => $work['image'],
        ':accent' => $work['accent'],
        ':tags' => json_encode($work['tags'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ':sort_order' => $work['sortOrder'],
    ]);
}

function all_works(PDO $pdo): array
{
    $rows = $pdo->query('SELECT * FROM works ORDER BY sort_order ASC, created_at DESC, title ASC')->fetchAll();
    return array_map('work_row_to_array', $rows);
}
