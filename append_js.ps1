$content = [System.IO.File]::ReadAllText('y:\ijigenpocket\CharaHikaku.html', [System.Text.Encoding]::UTF8)
$js = [System.IO.File]::ReadAllText('y:\ijigenpocket\temp_relation.js', [System.Text.Encoding]::UTF8)
$newContent = $content.Replace('</script>', $js + "`r`n</script>")
[System.IO.File]::WriteAllText('y:\ijigenpocket\CharaHikaku.html', $newContent, [System.Text.Encoding]::UTF8)
