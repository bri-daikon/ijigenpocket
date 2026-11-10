<?php
declare(strict_types=1);

if (!is_file(__DIR__ . '/config.php')) {
    http_response_code(503);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => '初期設定が必要です。setup.phpを開いてください。'], JSON_UNESCAPED_UNICODE);
    exit;
}

require __DIR__ . '/bootstrap.php';
require __DIR__ . '/inc/catalog.php';

require_login();
$action = (string)($_GET['action'] ?? 'list');
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
$pdo = db();

try {
    if ($action === 'list' && $method === 'GET') {
        $works = all_works($pdo);
        $lastSync = $pdo->query("SELECT setting_value FROM app_settings WHERE setting_key = 'last_sync_at'")->fetchColumn();
        json_response(['works' => $works, 'total' => count($works), 'lastSyncAt' => $lastSync ?: null]);
    }

    if ($action === 'save' && $method === 'POST') {
        verify_csrf();
        $work = clean_work(json_input());
        upsert_work($pdo, $work);
        json_response(['success' => true, 'work' => $work]);
    }

    if ($action === 'delete' && $method === 'POST') {
        verify_csrf();
        $input = json_input();
        $id = mb_substr(trim((string)($input['id'] ?? '')), 0, 100);
        if ($id === '') json_response(['error' => '削除対象が指定されていません。'], 400);
        $imageStatement = $pdo->prepare('SELECT image_url FROM works WHERE id = ?');
        $imageStatement->execute([$id]);
        $image = (string)($imageStatement->fetchColumn() ?: '');
        $statement = $pdo->prepare('DELETE FROM works WHERE id = ?');
        $statement->execute([$id]);
        if (str_starts_with($image, 'uploads/')) {
            $localPath = realpath(APP_ROOT . '/' . $image);
            $uploadRoot = realpath(APP_ROOT . '/uploads');
            if ($localPath && $uploadRoot && str_starts_with($localPath, $uploadRoot . DIRECTORY_SEPARATOR)) @unlink($localPath);
        }
        json_response(['success' => true]);
    }

    if ($action === 'sync' && $method === 'POST') {
        verify_csrf();
        $catalog = fetch_line_catalog();
        $pdo->beginTransaction();
        foreach ($catalog['products'] as $index => $product) {
            $product['sortOrder'] = $index;
            upsert_work($pdo, clean_work($product));
        }
        $setting = $pdo->prepare('INSERT INTO app_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)');
        $setting->execute(['last_sync_at', date(DATE_ATOM)]);
        $setting->execute(['last_sync_count', (string)count($catalog['products'])]);
        $pdo->commit();
        json_response([
            'success' => true,
            'count' => count($catalog['products']),
            'liveTotal' => $catalog['liveTotal'],
            'sourceStatus' => $catalog['status'],
            'warning' => $catalog['warning'] ?? null,
        ]);
    }

    if ($action === 'import' && $method === 'POST') {
        verify_csrf();
        $input = json_input();
        $products = isset($input['products']) && is_array($input['products']) ? $input['products'] : $input;
        if (!is_array($products)) json_response(['error' => '作品データが見つかりません。'], 400);
        $pdo->beginTransaction();
        $count = 0;
        foreach ($products as $product) {
            if (!is_array($product)) continue;
            upsert_work($pdo, clean_work($product));
            $count++;
        }
        $pdo->commit();
        json_response(['success' => true, 'count' => $count]);
    }

    if ($action === 'export' && $method === 'GET') {
        $works = all_works($pdo);
        header('Content-Type: application/json; charset=utf-8');
        header('Content-Disposition: attachment; filename="line-stamp-library-' . date('Y-m-d') . '.json"');
        header('Cache-Control: no-store');
        echo json_encode($works, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    if ($action === 'upload' && $method === 'POST') {
        verify_csrf();
        if (empty($_FILES['image']) || !is_uploaded_file($_FILES['image']['tmp_name'])) {
            json_response(['error' => '画像ファイルを選択してください。'], 400);
        }
        $file = $_FILES['image'];
        if ((int)$file['size'] > 5 * 1024 * 1024) json_response(['error' => '画像は5MB以下にしてください。'], 400);
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = (string)$finfo->file($file['tmp_name']);
        $extensions = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];
        if (!isset($extensions[$mime])) json_response(['error' => 'JPEG・PNG・WebP・GIF画像を選択してください。'], 400);
        $name = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
        $directory = APP_ROOT . '/uploads';
        if (!is_dir($directory) && !mkdir($directory, 0755, true)) json_response(['error' => '画像保存フォルダを作成できません。'], 500);
        if (!move_uploaded_file($file['tmp_name'], $directory . '/' . $name)) json_response(['error' => '画像を保存できません。'], 500);
        json_response(['success' => true, 'url' => 'uploads/' . $name]);
    }

    if ($action === 'logout' && $method === 'POST') {
        verify_csrf();
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        json_response(['success' => true]);
    }

    json_response(['error' => '操作が見つかりません。'], 404);
} catch (InvalidArgumentException $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    json_response(['error' => $error->getMessage()], 422);
} catch (Throwable $error) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('[StickerShelf] ' . $error->getMessage());
    json_response(['error' => '処理に失敗しました。サーバーのエラーログを確認してください。'], 500);
}
