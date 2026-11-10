<?php
// api.php - 付箋MEMORI バックエンドAPI (PHP + SQLite)

// CORS設定 (GitHub Pagesや他ドメインからのアクセスを許可)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// OPTIONSリクエスト（プリフライト）の処理
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// PHP 8 未満対応
if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle) {
        return (string)$needle !== '' && strncmp($haystack, $needle, strlen($needle)) === 0;
    }
}

// データベース設定 (SQLite)
$dbPath = __DIR__ . '/notes_db.sqlite';

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    // テーブル作成
    $pdo->exec("CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT,
        category TEXT,
        content TEXT,
        url TEXT,
        color TEXT,
        createdAt TEXT,
        updatedAt TEXT
    )");
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM notes ORDER BY updatedAt DESC");
        $notes = $stmt->fetchAll();
        echo json_encode($notes);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

if ($method === 'POST') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (!$data || !isset($data['action'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid request payload"]);
        exit;
    }

    $action = $data['action'];

    try {
        if ($action === 'save') {
            $note = $data['note'] ?? null;
            if (!$note) {
                http_response_code(400);
                echo json_encode(["error" => "Note data missing"]);
                exit;
            }

            $id = $note['id'] ?? null;
            $title = $note['title'] ?? '';
            $category = $note['category'] ?? '未分類';
            $content = $note['content'] ?? '';
            $url = $note['url'] ?? '';
            $color = $note['color'] ?? '#fff9c4';
            $now = gmdate('Y-m-d\TH:i:s\Z');

            if ($id && !str_starts_with($id, 'temp_')) {
                // Update
                $stmt = $pdo->prepare("UPDATE notes SET 
                    title = :title, 
                    category = :category, 
                    content = :content, 
                    url = :url, 
                    color = :color, 
                    updatedAt = :updatedAt 
                    WHERE id = :id");
                
                $stmt->execute([
                    ':title' => $title,
                    ':category' => $category,
                    ':content' => $content,
                    ':url' => $url,
                    ':color' => $color,
                    ':updatedAt' => $now,
                    ':id' => $id
                ]);

                // レコードが存在しなかった場合のみ新規挿入
                $checkStmt = $pdo->prepare("SELECT COUNT(*) FROM notes WHERE id = :id");
                $checkStmt->execute([':id' => $id]);
                if ($checkStmt->fetchColumn() == 0) {
                    $createdAt = $note['createdAt'] ?? $now;
                    $insertStmt = $pdo->prepare("INSERT INTO notes (id, title, category, content, url, color, createdAt, updatedAt) 
                        VALUES (:id, :title, :category, :content, :url, :color, :createdAt, :updatedAt)");
                    $insertStmt->execute([
                        ':id' => $id,
                        ':title' => $title,
                        ':category' => $category,
                        ':content' => $content,
                        ':url' => $url,
                        ':color' => $color,
                        ':createdAt' => $createdAt,
                        ':updatedAt' => $now
                    ]);
                }
            } else {
                // Create
                $id = 'note_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 7);
                $createdAt = $now;
                $stmt = $pdo->prepare("INSERT INTO notes (id, title, category, content, url, color, createdAt, updatedAt) 
                    VALUES (:id, :title, :category, :content, :url, :color, :createdAt, :updatedAt)");
                $stmt->execute([
                    ':id' => $id,
                    ':title' => $title,
                    ':category' => $category,
                    ':content' => $content,
                    ':url' => $url,
                    ':color' => $color,
                    ':createdAt' => $createdAt,
                    ':updatedAt' => $now
                ]);
            }

            // 保存した付箋の取得
            $stmt = $pdo->prepare("SELECT * FROM notes WHERE id = :id");
            $stmt->execute([':id' => $id]);
            $savedNote = $stmt->fetch();

            echo json_encode(["success" => true, "note" => $savedNote]);
            exit;
        }

        if ($action === 'delete') {
            $id = $data['id'] ?? null;
            if (!$id) {
                http_response_code(400);
                echo json_encode(["error" => "ID missing"]);
                exit;
            }

            $stmt = $pdo->prepare("DELETE FROM notes WHERE id = :id");
            $stmt->execute([':id' => $id]);

            echo json_encode(["success" => true]);
            exit;
        }

        if ($action === 'import') {
            $notes = $data['notes'] ?? [];
            if (!is_array($notes)) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid notes format"]);
                exit;
            }

            $pdo->beginTransaction();
            $pdo->exec("DELETE FROM notes");
            
            $stmt = $pdo->prepare("INSERT INTO notes (id, title, category, content, url, color, createdAt, updatedAt) 
                VALUES (:id, :title, :category, :content, :url, :color, :createdAt, :updatedAt)");
            
            foreach ($notes as $n) {
                $stmt->execute([
                    ':id' => $n['id'] ?? ('note_' . time() . '_' . substr(bin2hex(random_bytes(4)), 0, 7)),
                    ':title' => $n['title'] ?? '',
                    ':category' => $n['category'] ?? '未分類',
                    ':content' => $n['content'] ?? '',
                    ':url' => $n['url'] ?? '',
                    ':color' => $n['color'] ?? '#fff9c4',
                    ':createdAt' => $n['createdAt'] ?? gmdate('Y-m-d\TH:i:s\Z'),
                    ':updatedAt' => $n['updatedAt'] ?? gmdate('Y-m-d\TH:i:s\Z')
                ]);
            }

            $pdo->commit();
            echo json_encode(["success" => true, "count" => count($notes)]);
            exit;
        }

        http_response_code(400);
        echo json_encode(["error" => "Unknown action: " . $action]);
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
