<?php
declare(strict_types=1);

function catalog_http_get(string $url): string
{
    if (function_exists('curl_init')) {
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_USERAGENT => 'Mozilla/5.0 StickerShelf/1.0',
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        $body = curl_exec($curl);
        $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        if (is_string($body) && $status >= 200 && $status < 300) {
            return $body;
        }
        throw new RuntimeException('LINE STOREの取得に失敗しました: ' . ($error ?: "HTTP {$status}"));
    }
    $context = stream_context_create(['http' => [
        'timeout' => 25,
        'follow_location' => 1,
        'header' => "User-Agent: Mozilla/5.0 StickerShelf/1.0\r\n",
    ]]);
    $body = @file_get_contents($url, false, $context);
    if (!is_string($body)) {
        throw new RuntimeException('LINE STOREの取得に失敗しました。');
    }
    return $body;
}

function catalog_series(string $title): string
{
    $groups = [
        ['/(マヌルネコ|デイブ)/u', '虹色マヌルネコのデイブ'],
        ['/(ゆめかわ|ゆめか)/u', 'ゆめかわポニーのゆめか'],
        ['/ウルル/u', 'ネットの海を漂うウルル'],
        ['/(ウサフクロウ|うさふくろう|ウッポー)/u', 'ウサフクロウのウッポー'],
        ['/(ハシビロコウ|ヒロシ)/u', 'ハシビロコウのヒロシ'],
        ['/(コーギー|コットン)/u', 'わたがしコーギーのコットン'],
        ['/(ドラゴン|フォス)/u', 'のんびりドラゴンのフォス'],
        ['/(くらげ|クラゲ|ロロ)/u', 'ぷるぷるくらげのロロ'],
        ['/(吸血鬼ペンギン|ペンキュー)/u', '吸血鬼ペンギンのペンキュー'],
        ['/(黒猫|スズ)/u', '黒猫スズ'],
        ['/(ウサギ|うさぎ|ポリー)/u', 'ウサギのポリー'],
        ['/(子狐|花あかり|ほたる|雪もち|みのり)/u', '子狐四つ子'],
        ['/(羊|ポポン)/u', 'のんびり羊のポポン'],
        ['/大根/u', '大根ちゃん'],
        ['/(もちぷるメンダコ|メンダコ|ラムネ)/u', 'もちぷるメンダコ'],
        ['/(よちよちシマエナガ|シマエナガ)/u', 'よちよちシマエナガ'],
        ['/(団扇|うちわ|扇子|月窓)/u', '日本の四季・風景'],
    ];
    foreach ($groups as [$pattern, $series]) {
        if (preg_match($pattern, $title)) return $series;
    }
    return 'その他の作品';
}

function catalog_category(string $title): string
{
    $groups = [
        ['/(秋|紅葉|お月見)/u', '季節・秋'],
        ['/(夏|真夏|夏祭り|夏休み)/u', '季節・夏'],
        ['/(冬|春)/u', '季節'],
        ['/(ネガティブ|落ち込|満身創痍|締切が怖い|心配)/u', 'ネガティブ'],
        ['/(TRPG|KP)/u', 'TRPG'],
        ['/(推し|ライブ|オタ)/u', '推し活'],
        ['/(ゲーム|レトロゲーム|電子の海|ネットの海)/u', 'ネット・ゲーム'],
        ['/(仕事|労働|敬語)/u', 'お仕事'],
        ['/(防災|連絡)/u', '防災'],
        ['/(食|大食|ハラヘリ|おかん|スイーツ)/u', '食べ物'],
        ['/(ファンタジー|魔法|オカルト|吸血鬼|骨董|世紀末)/u', 'ファンタジー'],
    ];
    foreach ($groups as [$pattern, $category]) {
        if (preg_match($pattern, $title)) return $category;
    }
    return '日常';
}

function catalog_parse_page(string $html): array
{
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query('//li[contains(concat(" ", normalize-space(@class), " "), " mdCMN02Li ")]/a[.//img]');
    $colors = ['#ff7c83', '#f0a444', '#58a98c', '#7186e8', '#bd78c7', '#3f9db4'];
    $products = [];
    if ($nodes === false) return $products;
    foreach ($nodes as $index => $node) {
        if (!$node instanceof DOMElement) continue;
        $href = trim($node->getAttribute('href'));
        $imageNode = $xpath->query('.//img', $node)?->item(0);
        if (!$imageNode instanceof DOMElement || $href === '') continue;
        $title = trim($imageNode->getAttribute('alt'));
        $image = trim($imageNode->getAttribute('src'));
        if ($title === '') continue;
        preg_match('#/product/([^/]+)#', $href, $idMatch);
        $productId = $idMatch[1] ?? sha1($href);
        $type = str_contains($href, '/emojishop/') ? '絵文字' : 'スタンプ';
        $series = catalog_series($title);
        $category = catalog_category($title);
        $colorIndex = array_sum(array_map('ord', str_split((string)$productId))) % count($colors);
        $products[] = [
            'id' => 'line-' . $productId,
            'title' => $title,
            'series' => $series,
            'type' => $type,
            'category' => $category,
            'releaseDate' => '',
            'status' => '販売中',
            'description' => "LINE STOREから取得した「{$title}」の{$type}です。",
            'storeUrl' => str_starts_with($href, 'http') ? $href : 'https://store.line.me' . $href,
            'image' => $image,
            'accent' => $colors[$colorIndex],
            'tags' => array_values(array_unique([$type, $category, $series])),
            'sortOrder' => $index,
        ];
    }
    libxml_clear_errors();
    return $products;
}

function catalog_baseline(): array
{
    $path = APP_ROOT . '/data/initial-products.json';
    $decoded = json_decode((string)file_get_contents($path), true);
    if (!is_array($decoded)) return [];
    return array_map(static function (array $work, int $index): array {
        $work['sortOrder'] = $index;
        return $work;
    }, $decoded, array_keys($decoded));
}

function catalog_parse_theme_page(string $html): array
{
    libxml_use_internal_errors(true);
    $dom = new DOMDocument();
    $dom->loadHTML($html, LIBXML_NOERROR | LIBXML_NOWARNING);
    $xpath = new DOMXPath($dom);
    $nodes = $xpath->query('//li[contains(concat(" ", normalize-space(@class), " "), " mdCMN02Li ")]/a[contains(@href, "/themeshop/product/")]');
    $products = [];
    if ($nodes !== false) foreach ($nodes as $node) {
        if (!$node instanceof DOMElement) continue;
        $href = trim($node->getAttribute('href'));
        if (!preg_match('#/themeshop/product/([0-9a-f-]{36})/#i', $href, $match)) continue;
        $titleNode = $xpath->query('.//*[contains(concat(" ", normalize-space(@class), " "), " mdCMN05Ttl ")]', $node)?->item(0);
        $title = trim($titleNode?->textContent ?? '');
        $image = '';
        foreach ($xpath->query('.//img', $node) ?: [] as $img) {
            if (!$img instanceof DOMElement) continue;
            $candidate = trim($img->getAttribute('src'));
            if (str_starts_with($candidate, 'https://shop.line-scdn.net/themeshop/')) {
                $image = $candidate;
                if ($title === '') $title = trim($img->getAttribute('alt'));
                break;
            }
        }
        if ($title === '') continue;
        $series = catalog_series($title);
        $category = catalog_category($title);
        $products[] = [
            'id' => 'theme-' . strtolower($match[1]),
            'title' => $title,
            'series' => $series,
            'type' => '着せかえ',
            'category' => $category,
            'releaseDate' => '',
            'status' => '販売中',
            'description' => "LINE STOREで公開中の「{$title}」の着せかえです。",
            'storeUrl' => 'https://store.line.me/themeshop/product/' . strtolower($match[1]) . '/ja',
            'image' => $image,
            'accent' => '#58a98c',
            'tags' => array_values(array_unique(['着せかえ', $category, $series])),
            'sortOrder' => count($products),
        ];
    }
    libxml_clear_errors();
    return $products;
}

function fetch_line_catalog(): array
{
    $authorUrl = (string)(app_config()['author_url'] ?? 'https://store.line.me/stickershop/author/6151799/ja');
    $themeAuthorUrl = (string)(app_config()['theme_author_url'] ?? 'https://store.line.me/themeshop/author/11931075/ja');
    $baseline = catalog_baseline();
    $products = $baseline;
    $liveTotal = 0;
    $warnings = [];
    $status = 'baseline';
    try {
        $firstHtml = catalog_http_get($authorUrl);
        $firstPage = catalog_parse_page($firstHtml);
        if (!$firstPage) throw new RuntimeException('スタンプ作者ページから作品を読み取れませんでした。');
        preg_match('/<span>(\d+) 件<\/span>/u', $firstHtml, $totalMatch);
        $total = (int)($totalMatch[1] ?? count($firstPage));
        $pageCount = min(100, max(1, (int)ceil($total / count($firstPage))));
        $live = $firstPage;
        for ($page = 2; $page <= $pageCount; $page++) {
            foreach (catalog_parse_page(catalog_http_get($authorUrl . '?page=' . $page)) as $item) $live[] = $item;
        }
        $liveTotal += count($live);
        $liveByUrl = [];
        foreach ($live as $work) $liveByUrl[$work['storeUrl']] = $work;
        $baselineUrls = [];
        $products = [];
        foreach ($baseline as $work) {
            $baselineUrls[$work['storeUrl']] = true;
            $products[] = $liveByUrl[$work['storeUrl']] ?? $work;
        }
        foreach ($live as $work) if (!isset($baselineUrls[$work['storeUrl']])) $products[] = $work;
        $status = count($live) >= count($baseline) ? 'live' : 'live-with-baseline';
    } catch (Throwable $error) {
        $warnings[] = 'スタンプ・絵文字: ' . $error->getMessage();
    }
    try {
        $parts = parse_url($themeAuthorUrl);
        if (!is_array($parts) || ($parts['scheme'] ?? '') !== 'https' || ($parts['host'] ?? '') !== 'store.line.me' || !preg_match('#^/themeshop/author/\d+/ja$#', $parts['path'] ?? '')) {
            throw new RuntimeException('着せかえ作者URLの形式が正しくありません。');
        }
        $firstHtml = catalog_http_get($themeAuthorUrl);
        $firstPage = catalog_parse_theme_page($firstHtml);
        preg_match('/<span>(\d+) 件<\/span>/u', $firstHtml, $totalMatch);
        $total = (int)($totalMatch[1] ?? count($firstPage));
        if ($total > 0 && !$firstPage) throw new RuntimeException('着せかえ作者ページから作品を読み取れませんでした。');
        $pageCount = $firstPage ? min(100, max(1, (int)ceil($total / count($firstPage)))) : 1;
        $themes = $firstPage;
        for ($page = 2; $page <= $pageCount; $page++) {
            foreach (catalog_parse_theme_page(catalog_http_get($themeAuthorUrl . '?page=' . $page)) as $item) $themes[] = $item;
        }
        $seen = [];
        foreach ($products as $work) $seen[$work['storeUrl']] = true;
        foreach ($themes as $work) if (!isset($seen[$work['storeUrl']])) { $products[] = $work; $seen[$work['storeUrl']] = true; }
        $liveTotal += count($themes);
    } catch (Throwable $error) {
        $warnings[] = '着せかえ: ' . $error->getMessage();
    }
    foreach ($products as $index => &$work) $work['sortOrder'] = $index;
    unset($work);
    return [
        'products' => $products,
        'liveTotal' => $liveTotal,
        'status' => $status,
        'warning' => $warnings ? implode(' / ', $warnings) : null,
    ];
}