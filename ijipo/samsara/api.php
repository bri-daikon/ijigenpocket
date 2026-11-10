<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
ini_set('display_errors', '0');
date_default_timezone_set('Asia/Tokyo');
function reply(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
function fail(string $message, int $status): void { reply(['error' => $message], $status); }
function migrate(PDO $pdo, string $legacyPassword): void {
    $pdo->exec("CREATE TABLE IF NOT EXISTS samsara_users (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, username VARCHAR(30) NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, UNIQUE KEY samsara_username (username)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin");
    $db=$pdo->query('SELECT DATABASE()')->fetchColumn();
    $hasOwner=$pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='samsara_characters' AND COLUMN_NAME='owner_user_id'");$hasOwner->execute([$db]);
    if (!(int)$hasOwner->fetchColumn()) $pdo->exec('ALTER TABLE samsara_characters ADD COLUMN owner_user_id BIGINT UNSIGNED NULL, ADD INDEX samsara_owner_updated (owner_user_id,updated_at)');
    $hasPublic=$pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='samsara_characters' AND COLUMN_NAME='public_id'");$hasPublic->execute([$db]);
    if (!(int)$hasPublic->fetchColumn()) $pdo->exec('ALTER TABLE samsara_characters ADD COLUMN public_id CHAR(32) CHARACTER SET ascii COLLATE ascii_bin NULL, ADD UNIQUE KEY samsara_public_id (public_id)');
    if ((int)$pdo->query('SELECT COUNT(*) FROM samsara_users')->fetchColumn()===0) {
        $pdo->beginTransaction();
        try {$q=$pdo->prepare('INSERT INTO samsara_users (username,password_hash,created_at) VALUES (?,?,?)');$q->execute(['admin',password_hash($legacyPassword,PASSWORD_DEFAULT),date('Y-m-d H:i:s')]);$adminId=(int)$pdo->lastInsertId();$q=$pdo->prepare('UPDATE samsara_characters SET owner_user_id=? WHERE owner_user_id IS NULL');$q->execute([$adminId]);$pdo->commit();}catch(Throwable $e){if($pdo->inTransaction())$pdo->rollBack();throw $e;}
    }
}
function accountInput(array $input): array {
    $username=trim((string)($input['username']??''));$password=$input['password']??'';
    if (!preg_match('/\A[\p{L}\p{N}_-]{3,30}\z/u',$username)) fail('ユーザー名は3〜30文字の文字・数字・_・-で入力してください。',422);
    if (!is_string($password)||strlen($password)<10||strlen($password)>200) fail('パスワードは10〜200文字で入力してください。',422);
    return [$username,$password];
}
function validateData($d): array {
    if (!is_array($d) || ($d['schemaVersion'] ?? null) !== 1) fail('シート形式が不正です。', 422);
    if (!isset($d['name']) || !is_string($d['name'])) fail('キャラクター名の形式が不正です。', 422);
    $name = trim($d['name']);
    if ($name === '' || mb_strlen($name, 'UTF-8') > 200) fail('キャラクター名は1〜200文字で入力してください。', 422);
    $fields = ['name','earthName','death','age','gender','origin','race','feature','trait','occupation','lifestyle','money','income','expense','leisure','profileMemo','characterColor','karma','hpMod','apMod','weightMod','storage','extraLanguage','followerLeaderName','followerSpirit','followerCorrection','followerTroopValue','followerExpense','followerTotalFormation','territoryAffiliation','territoryLord','territoryLandCount','territoryIncome','territoryResidents'];
    $clean = ['schemaVersion' => 1];
    $scalar = function($v) {
        if ((!is_string($v) && !is_int($v) && !is_float($v)) || mb_strlen((string)$v, 'UTF-8') > 10000) fail('入力値の形式または長さが不正です。', 422);
        return $v;
    };
    $numeric = function($v) use ($scalar) {
        $scalar($v);
        if ($v !== '' && (!is_numeric($v) || !is_finite((float)$v) || abs((float)$v) > 1000000)) fail('数値は±1000000以内で入力してください。', 422);
        return $v;
    };
    foreach ($fields as $key) if (isset($d[$key])) $clean[$key] = in_array($key, ['karma','hpMod','apMod','weightMod','followerSpirit','followerCorrection','followerTroopValue','followerTotalFormation','territoryLandCount'], true) ? $numeric($d[$key]) : $scalar($d[$key]);
    $clean['name'] = $name;
    if (isset($clean['characterColor']) && !preg_match('/^#[0-9a-f]{6}$/iD', (string)$clean['characterColor'])) fail('カラーコードの形式が不正です。', 422);
    $clean['images'] = [];
    if (isset($d['images'])) {
        if (!is_array($d['images']) || count($d['images']) > 8) fail('画像は8枚まで登録できます。', 422);
        foreach ($d['images'] as $image) {
            if (!is_array($image) || !is_string($image['name'] ?? null) || mb_strlen($image['name'], 'UTF-8') > 200 || !is_string($image['dataUrl'] ?? null)) fail('画像の形式が不正です。', 422);
            if (!preg_match('#^data:image/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$#D', $image['dataUrl'], $match)) fail('対応していない画像形式です。', 422);
            $bytes = base64_decode($match[2], true);
            if ($bytes === false || strlen($bytes) > 350000) fail('画像1枚の容量は350KBまでです。', 422);
            $clean['images'][] = ['name'=>$image['name'], 'dataUrl'=>$image['dataUrl']];
        }
    }
    $validateBallad = function($b) use ($scalar): array {
        if (!is_array($b)) fail('バラッドシートの形式が不正です。', 422);
        $id = $b['id'] ?? '';
        if (!is_string($id) || $id === '' || strlen($id) > 100) fail('バラッドシートIDが不正です。', 422);
        $out = ['id' => $id];
        foreach (['title','chapterCount','enemy','desire','memo','playDate','gm'] as $key) $out[$key] = $scalar($b[$key] ?? '');
        if (!isset($b['players']) || !is_array($b['players']) || count($b['players']) > 30) fail('参加者の形式が不正です。', 422);
        $out['players'] = [];
        foreach ($b['players'] as $player) {
            if (!is_array($player)) fail('参加者の形式が不正です。', 422);
            $out['players'][] = ['name' => $scalar($player['name'] ?? '')];
        }
        if (!isset($b['chapters']) || !is_array($b['chapters']) || count($b['chapters']) !== 8) fail('チャプターの形式が不正です。', 422);
        $out['chapters'] = [];
        foreach ($b['chapters'] as $chapter) {
            if (!is_array($chapter)) fail('チャプターの形式が不正です。', 422);
            $cleanChapter = [];
            foreach (['name','periods','incident','mission','karma'] as $key) $cleanChapter[$key] = $scalar($chapter[$key] ?? '');
            if (!isset($chapter['tasks']) || !is_array($chapter['tasks']) || count($chapter['tasks']) !== 6) fail('タスクの形式が不正です。', 422);
            $cleanChapter['tasks'] = [];
            foreach ($chapter['tasks'] as $task) {
                if (!is_array($task)) fail('タスクの形式が不正です。', 422);
                $cleanChapter['tasks'][] = ['task' => $scalar($task['task'] ?? ''), 'solution' => $scalar($task['solution'] ?? '')];
            }
            $out['chapters'][] = $cleanChapter;
        }
        return $out;
    };
    $clean['ballads'] = [];
    if (isset($d['ballads'])) {
        if (!is_array($d['ballads']) || count($d['ballads']) > 100) fail('バラッドシートは100件まで登録できます。', 422);
        foreach ($d['ballads'] as $ballad) $clean['ballads'][] = $validateBallad($ballad);
    }
    $activeBalladId = $d['activeBalladId'] ?? '';
    if (!is_string($activeBalladId) || strlen($activeBalladId) > 100) fail('バラッドシートの選択情報が不正です。', 422);
    $clean['activeBalladId'] = $activeBalladId;
    if (!isset($d['abilities']) || !is_array($d['abilities']) || count($d['abilities']) !== 4 || array_keys($d['abilities']) !== [0,1,2,3]) fail('能力値の形式が不正です。', 422);
    $clean['abilities'] = [];
    foreach ($d['abilities'] as $r) {
        if (!is_array($r)) fail('能力値の形式が不正です。', 422);
        $row = [];
        foreach (['race','growth','mod','check'] as $key) $row[$key] = $numeric($r[$key] ?? '');
        $clean['abilities'][] = $row;
    }
    foreach (['tags','languages'] as $key) {
        if (!isset($d[$key]) || !is_array($d[$key]) || count($d[$key]) > 200) fail('習熟・言語の形式が不正です。', 422);
        $clean[$key] = [];
        foreach ($d[$key] as $v) {
            if (!is_string($v) || mb_strlen($v, 'UTF-8') > 200) fail('習熟・言語の形式が不正です。', 422);
            $clean[$key][] = $v;
        }
    }
    $groups = [
        'cheats' => ['name','general','bond','unique','karma','use','intensity','range','target','effect'],
        'career' => ['B','C','D','E','F','G','H','I','J','K','L','N'],
        'followers' => ['B','C','D','E','F','G','H','I','J','K','L'],
        'magic' => ['B','C','D','E','F','G','H','I','J','K','L','M','O'],
        'equipment' => ['B','C','D','E','F','G','H','I','J','K','L','M'],
        'items' => ['B','C','D','E'],
        'territoryEvents' => ['roll10','roll20','name','effect'],
        'facilities' => ['name','count','type','incomeUnit','incomeSubtotal','effect','reference'],
    ];
    $numbers = ['cheats'=>['karma'],'career'=>['G'],'followers'=>['C','D'],'magic'=>['E','L'],'equipment'=>['K','L'],'items'=>['C','D'],'territoryEvents'=>[],'facilities'=>['count','incomeUnit','incomeSubtotal']];
    for ($i=0;$i<10;$i++) {
        foreach (['generalOn','generalStrength','generalChoices','generalOther','generalText'] as $prefix) $groups['cheats'][]=$prefix.$i;
    }
    $groups['career'][]='legacyNotes';
    foreach ($groups as $key => $columns) {
        if (!isset($d[$key]) || !is_array($d[$key]) || count($d[$key]) > 100) fail('各明細は100件まで登録できます。', 422);
        $clean[$key] = [];
        foreach ($d[$key] as $r) {
            if (!is_array($r)) fail('明細の形式が不正です。', 422);
            $row = [];
            foreach ($columns as $col) if (isset($r[$col])) $row[$col] = in_array($col, $numbers[$key], true) ? $numeric($r[$col]) : $scalar($r[$col]);
            if ($key==='cheats') {
                for ($i=0;$i<10;$i++) {
                    $flag=$row['generalOn'.$i]??'';
                    if (!in_array($flag,['','1'],true)) fail('汎用効果の選択値が不正です。',422);
                    $row['generalOn'.$i]=$flag;
                }
            }
            if ($key==='career') {
                $notes=[];
                foreach (['B'=>['前世','現世'],'H'=>['常時','割込','余暇']] as $col=>$choices) {
                    if (!in_array($row[$col]??'', $choices,true)) {
                        if (isset($row[$col]) && $row[$col]!=='') $notes[]=($col==='B'?'時期':'使用').'：'.$row[$col];
                        $row[$col]=$choices[0];
                    }
                }
                if ($notes) $row['legacyNotes']=implode("\n",array_filter(array_merge([$row['legacyNotes']??''],$notes)));
            }
            $clean[$key][] = $row;
        }
    }
    return $clean;
}
try {
    if (!is_file(__DIR__ . '/config.php')) fail('DB設定が未完了です。設置手順に沿ってconfig.phpを用意してください。', 503);
    $config = require __DIR__ . '/config.php';
    if (!is_array($config) || strlen($config['app_password'] ?? '') < 16 || $config['app_password'] === 'CHANGE_ME') fail('保存用パスワードを16文字以上に設定してください。', 503);
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('samsara_session');
    session_set_cookie_params(['lifetime'=>0,'path'=>rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\') . '/', 'secure'=>!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off', 'httponly'=>true,'samesite'=>'Strict']);
    session_start();
    if (!isset($_SESSION['csrf'])) $_SESSION['csrf'] = bin2hex(random_bytes(32));
    if (isset($_SESSION['last_seen']) && time() - $_SESSION['last_seen'] > 7200) unset($_SESSION['user_id'],$_SESSION['username']);
    $action = $_GET['action'] ?? 'session';
    $method = $_SERVER['REQUEST_METHOD'];
    $postActions = ['login','register','logout','save','delete'];
    if (!in_array($action, ['session','login','register','logout','list','get','view','save','delete'], true)) fail('対象の操作がありません。', 404);
    if ($method !== (in_array($action, $postActions, true) ? 'POST' : 'GET')) fail('対応していないHTTPメソッドです。', 405);
    $input = [];
    if ($method === 'POST') {
        if (!hash_equals($_SESSION['csrf'], $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '')) fail('セッションが変わりました。JSONを書き出してから画面を再読込してください。', 403);
        if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4000000) fail('データが大きすぎます（4MBまで）。', 413);
        $raw = file_get_contents('php://input', false, null, 0, 4000001);
        if (strlen($raw) > 4000000) fail('データが大きすぎます。', 413);
        try { $input = json_decode($raw, true, 32, JSON_THROW_ON_ERROR); } catch (JsonException $e) { fail('JSONの形式が不正です。', 400); }
        if (!is_array($input)) fail('入力形式が不正です。', 400);
    }
    if ($action === 'session') reply(['csrf'=>$_SESSION['csrf'],'authenticated'=>!empty($_SESSION['user_id']),'username'=>$_SESSION['username']??null]);
    if ($action === 'logout') { $_SESSION = []; session_destroy(); reply(['ok'=>true]); }
    if (!in_array($action,['login','register','view'],true) && empty($_SESSION['user_id'])) fail('ログインが必要です。ログイン後にもう一度操作してください。', 401);
    $pdo = new PDO('mysql:host='.$config['db_host'].';dbname='.$config['db_name'].';charset=utf8mb4', $config['db_user'], $config['db_password'], [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_EMULATE_PREPARES=>false,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    migrate($pdo,$config['app_password']);
    if ($action === 'register') {
        [$username,$password]=accountInput($input);$now=date('Y-m-d H:i:s');
        try {$q=$pdo->prepare('INSERT INTO samsara_users (username,password_hash,created_at) VALUES (?,?,?)');$q->execute([$username,password_hash($password,PASSWORD_DEFAULT),$now]);$userId=(int)$pdo->lastInsertId();}
        catch (PDOException $e) {if((string)$e->getCode()==='23000')fail('そのユーザー名はすでに使われています。',409);throw $e;}
        session_regenerate_id(true);$_SESSION['user_id']=$userId;$_SESSION['username']=$username;$_SESSION['last_seen']=time();$_SESSION['csrf']=bin2hex(random_bytes(32));
        reply(['csrf'=>$_SESSION['csrf'],'ok'=>true,'username'=>$username],201);
    }
    if ($action === 'login') {
        [$username,$password]=accountInput($input);
        $key = hash_hmac('sha256', ($_SERVER['REMOTE_ADDR'] ?? 'unknown').'|'.mb_strtolower($username,'UTF-8'), $config['app_password']);
        $now = time();
        $q=$pdo->prepare('INSERT INTO samsara_login_attempts (client_key,attempts,started_at) VALUES (?,1,?) ON DUPLICATE KEY UPDATE attempts=IF(started_at < ?,1,attempts+1), started_at=IF(started_at < ?,?,started_at)');
        $q->execute([$key,$now,$now-900,$now-900,$now]);
        $q=$pdo->prepare('SELECT attempts FROM samsara_login_attempts WHERE client_key=?');$q->execute([$key]);
        if ((int)$q->fetchColumn()>10) fail('ログイン試行が多いため、15分ほど待ってから再試行してください。', 429);
        $q=$pdo->prepare('SELECT id,username,password_hash FROM samsara_users WHERE username=?');$q->execute([$username]);$user=$q->fetch();
        if (!$user||!password_verify($password,$user['password_hash'])) fail('ユーザー名またはパスワードが違います。', 401);
        $q=$pdo->prepare('DELETE FROM samsara_login_attempts WHERE client_key=? OR started_at<?');$q->execute([$key,$now-86400]);
        session_regenerate_id(true);$_SESSION['user_id']=(int)$user['id'];$_SESSION['username']=$user['username'];$_SESSION['last_seen']=$now;$_SESSION['csrf']=bin2hex(random_bytes(32));
        reply(['csrf'=>$_SESSION['csrf'],'ok'=>true,'username'=>$user['username']]);
    }
    if ($action === 'view') {
        $publicId=$_GET['id']??'';if(!is_string($publicId)||!preg_match('/^[a-f0-9]{32}$/D',$publicId))fail('閲覧URLが不正です。',422);
        $q=$pdo->prepare('SELECT data,updated_at FROM samsara_characters WHERE public_id=?');$q->execute([$publicId]);$row=$q->fetch();if(!$row)fail('キャラクターが見つかりません。',404);
        reply(['data'=>json_decode($row['data'],true,32,JSON_THROW_ON_ERROR),'updated_at'=>$row['updated_at']]);
    }
    $_SESSION['last_seen']=time();$userId=(int)$_SESSION['user_id'];
    if ($action === 'list') {
        $q=$pdo->prepare('SELECT id,name,version,public_id,updated_at FROM samsara_characters WHERE owner_user_id=? ORDER BY updated_at DESC,id');$q->execute([$userId]);$rows=$q->fetchAll();
        reply(['characters'=>$rows]);
    }
    if ($action === 'get') {
        $id=$_GET['id']??'';
        if (!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)) fail('IDが不正です。',422);
        $q=$pdo->prepare('SELECT id,data,version,public_id FROM samsara_characters WHERE id=? AND owner_user_id=?');$q->execute([$id,$userId]);$row=$q->fetch();
        if (!$row) fail('キャラクターが見つかりません。',404);
        if(!$row['public_id']){$row['public_id']=bin2hex(random_bytes(16));$q=$pdo->prepare('UPDATE samsara_characters SET public_id=? WHERE id=? AND owner_user_id=?');$q->execute([$row['public_id'],$id,$userId]);}
        reply(['id'=>$row['id'],'version'=>(int)$row['version'],'public_id'=>$row['public_id'],'data'=>json_decode($row['data'],true,32,JSON_THROW_ON_ERROR)]);
    }
    if ($action === 'delete') {
        $id=$input['id']??'';
        if (!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)) fail('IDが不正です。',422);
        $q=$pdo->prepare('DELETE FROM samsara_characters WHERE id=? AND owner_user_id=?');$q->execute([$id,$userId]);
        if ($q->rowCount()!==1) fail('キャラクターが見つかりません。',404);
        reply(['ok'=>true]);
    }
    if ($action === 'save') {
        $data=validateData($input['data']??null);$json=json_encode($data,JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR);$id=$input['id']??null;$version=$input['version']??0;$now=date('Y-m-d H:i:s');
        if (!is_int($version)||$version<0) fail('更新番号が不正です。',422);
        if ($id===null) {
            if ($version!==0) fail('新規登録の更新番号が不正です。',422);
            $id=bin2hex(random_bytes(16));$publicId=bin2hex(random_bytes(16));$q=$pdo->prepare('INSERT INTO samsara_characters (id,name,data,version,created_at,updated_at,owner_user_id,public_id) VALUES (?,?,?,1,?,?,?,?)');$q->execute([$id,$data['name'],$json,$now,$now,$userId,$publicId]);
            reply(['id'=>$id,'version'=>1,'public_id'=>$publicId],201);
        }
        if (!is_string($id)||!preg_match('/^[a-f0-9]{32}$/D',$id)||$version<1) fail('IDまたは更新番号が不正です。',422);
        $q=$pdo->prepare('UPDATE samsara_characters SET name=?,data=?,version=version+1,updated_at=? WHERE id=? AND version=? AND owner_user_id=?');$q->execute([$data['name'],$json,$now,$id,$version,$userId]);
        if ($q->rowCount()!==1) fail('別の画面で更新されています。入力をJSONに書き出して退避し、最新のシートを読み込んでください。',409);
        $q=$pdo->prepare('SELECT public_id FROM samsara_characters WHERE id=? AND owner_user_id=?');$q->execute([$id,$userId]);$publicId=$q->fetchColumn();
        if(!$publicId){$publicId=bin2hex(random_bytes(16));$q=$pdo->prepare('UPDATE samsara_characters SET public_id=? WHERE id=? AND owner_user_id=?');$q->execute([$publicId,$id,$userId]);}
        reply(['id'=>$id,'version'=>$version+1,'public_id'=>$publicId]);
    }
} catch (Throwable $e) {
    error_log('Samsara API: '.$e->getMessage());
    fail('サーバー処理に失敗しました。DB設定・テーブル作成・PHPのエラーログを確認してください。',500);
}
