<?php
/**
 * AI Gallery Studio - Lolipop Server Backend API
 * 
 * Supports uploading, saving, listing, and deleting artworks & comic panels.
 * Stores data in JSON (data/artworks.json) and images in uploads/ directory.
 */

error_reporting(E_ALL & ~E_NOTICE);
ini_set('display_errors', '0');

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Key');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ----------------------------------------------------
// Configuration
// ----------------------------------------------------
define('ADMIN_KEY', 'eiswein123'); 

define('DATA_DIR', __DIR__ . '/data');
define('DATA_FILE', DATA_DIR . '/artworks.json');
define('UPLOADS_DIR', __DIR__ . '/uploads');

// Ensure directories exist
if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}
if (!file_exists(UPLOADS_DIR)) {
    mkdir(UPLOADS_DIR, 0755, true);
}

// Helper: JSON response
function sendResponse($success, $data = null, $error = null, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'error' => $error
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

// Helper: Check Admin Key
function checkAuth($payload = null) {
    if (ADMIN_KEY === '') {
        return true;
    }

    $reqKey = '';

    if (!empty($_SERVER['HTTP_X_ADMIN_KEY'])) {
        $reqKey = $_SERVER['HTTP_X_ADMIN_KEY'];
    }

    if ($reqKey === '' && function_exists('getallheaders')) {
        $headers = getallheaders();
        foreach ($headers as $name => $val) {
            if (strcasecmp($name, 'X-Admin-Key') === 0) {
                $reqKey = $val;
                break;
            }
        }
    }

    if ($reqKey === '' && isset($_GET['admin_key'])) {
        $reqKey = $_GET['admin_key'];
    }

    if ($reqKey === '' && isset($_POST['admin_key'])) {
        $reqKey = $_POST['admin_key'];
    }

    if ($reqKey === '' && is_array($payload) && isset($payload['admin_key'])) {
        $reqKey = $payload['admin_key'];
    }

    if ($reqKey !== ADMIN_KEY) {
        sendResponse(false, null, 'Authentication failed: Invalid Admin Key. パスワード（Admin Key）が未設定または一致しません。', 401);
    }
    return true;
}

// Helper: Read artworks JSON
function getArtworks() {
    if (!file_exists(DATA_FILE)) {
        return [];
    }
    $json = file_get_contents(DATA_FILE);
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

// Helper: Save artworks JSON
function saveArtworks($list) {
    $json = json_encode($list, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    return file_put_contents(DATA_FILE, $json, LOCK_EX);
}

// Helper: Save Base64 data URL to file in uploads/
function saveBase64Image($dataUrl, $prefix = 'panel') {
    if (!preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $type)) {
        return $dataUrl;
    }

    $imageType = strtolower($type[1]);
    if (!in_array($imageType, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
        $imageType = 'png';
    }

    $data = substr($dataUrl, strpos($dataUrl, ',') + 1);
    $decoded = base64_decode($data);
    if ($decoded === false) {
        return $dataUrl;
    }

    $filename = $prefix . '_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4)) . '.' . $imageType;
    $filepath = UPLOADS_DIR . '/' . $filename;

    if (file_put_contents($filepath, $decoded)) {
        return 'uploads/' . $filename;
    }
    return $dataUrl;
}

// ----------------------------------------------------
// Router
// ----------------------------------------------------
$action = isset($_GET['action']) ? $_GET['action'] : '';

// 1. GET: List artworks
if ($_SERVER['REQUEST_METHOD'] === 'GET' && ($action === 'list' || $action === '')) {
    $list = getArtworks();
    sendResponse(true, $list);
}

// Read raw input once for POST requests
$rawInput = file_get_contents('php://input');
$jsonPayload = json_decode($rawInput, true);

// 2. POST: Save / Update artwork
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'save') {
    $payload = is_array($jsonPayload) ? $jsonPayload : $_POST;
    checkAuth($payload);

    if (empty($payload['title'])) {
        sendResponse(false, null, 'Title is required.', 400);
    }

    $id = !empty($payload['id']) ? preg_replace('/[^a-zA-Z0-9_-]/', '', $payload['id']) : 'art_' . time() . '_' . bin2hex(random_bytes(2));
    
    // Process images
    $savedImages = [];
    if (!empty($payload['images']) && is_array($payload['images'])) {
        foreach ($payload['images'] as $idx => $img) {
            if (!empty($img)) {
                $savedImages[] = saveBase64Image($img, $id . '_p' . $idx);
            }
        }
    }

    $artworks = getArtworks();
    $existingIndex = -1;
    $existingCreatedAt = time() * 1000;
    $existingFav = false;

    foreach ($artworks as $i => $item) {
        if ($item['id'] === $id) {
            $existingIndex = $i;
            $existingCreatedAt = isset($item['createdAt']) ? $item['createdAt'] : $existingCreatedAt;
            $existingFav = isset($item['isFavorite']) ? $item['isFavorite'] : false;
            break;
        }
    }

    // Category supports any custom category string
    $category = !empty($payload['category']) ? trim($payload['category']) : 'illust';
    $displayMode = !empty($payload['displayMode']) ? trim($payload['displayMode']) : ($category === '4koma' ? 'scroll' : 'fit');

    $newItem = [
        'id' => $id,
        'title' => trim($payload['title']),
        'category' => $category,
        'displayMode' => $displayMode,
        'images' => $savedImages,
        'model' => isset($payload['model']) ? trim($payload['model']) : '',
        'date' => isset($payload['date']) ? trim($payload['date']) : date('Y-m-d'),
        'tags' => isset($payload['tags']) && is_array($payload['tags']) ? $payload['tags'] : [],
        'prompt' => isset($payload['prompt']) ? trim($payload['prompt']) : '',
        'negativePrompt' => isset($payload['negativePrompt']) ? trim($payload['negativePrompt']) : '',
        'notes' => isset($payload['notes']) ? trim($payload['notes']) : '',
        'isFavorite' => isset($payload['isFavorite']) ? (bool)$payload['isFavorite'] : $existingFav,
        'createdAt' => isset($payload['createdAt']) ? $payload['createdAt'] : $existingCreatedAt
    ];

    if ($existingIndex >= 0) {
        $artworks[$existingIndex] = $newItem;
    } else {
        array_unshift($artworks, $newItem);
    }

    if (saveArtworks($artworks)) {
        sendResponse(true, $newItem);
    } else {
        sendResponse(false, null, 'Failed to write artworks to data file. サーバーの書き込み権限を確認してください。', 500);
    }
}

// 3. POST: Delete artwork
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'delete') {
    $payload = is_array($jsonPayload) ? $jsonPayload : $_POST;
    checkAuth($payload);

    $id = isset($payload['id']) ? $payload['id'] : '';

    if (empty($id)) {
        sendResponse(false, null, 'Artwork ID is required.', 400);
    }

    $artworks = getArtworks();
    $found = false;
    $newArtworks = [];

    foreach ($artworks as $item) {
        if ($item['id'] === $id) {
            $found = true;
            if (!empty($item['images']) && is_array($item['images'])) {
                foreach ($item['images'] as $img) {
                    if (strpos($img, 'uploads/') === 0) {
                        $targetFile = __DIR__ . '/' . $img;
                        if (file_exists($targetFile)) {
                            @unlink($targetFile);
                        }
                    }
                }
            }
        } else {
            $newArtworks[] = $item;
        }
    }

    if ($found) {
        saveArtworks($newArtworks);
    }
    sendResponse(true, ['id' => $id, 'deleted' => true, 'found' => $found]);
}

// 4. POST: Toggle favorite
if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'toggle_fav') {
    $payload = is_array($jsonPayload) ? $jsonPayload : $_POST;
    $id = isset($payload['id']) ? $payload['id'] : '';

    if (empty($id)) {
        sendResponse(false, null, 'Artwork ID is required.', 400);
    }

    $artworks = getArtworks();
    $updated = false;
    $newFavState = false;

    foreach ($artworks as &$item) {
        if ($item['id'] === $id) {
            $item['isFavorite'] = empty($item['isFavorite']);
            $newFavState = $item['isFavorite'];
            $updated = true;
            break;
        }
    }

    if ($updated) {
        saveArtworks($artworks);
        sendResponse(true, ['id' => $id, 'isFavorite' => $newFavState]);
    } else {
        sendResponse(true, ['id' => $id, 'isFavorite' => true]);
    }
}

// Fallback
sendResponse(false, null, 'Invalid request or action.', 400);
