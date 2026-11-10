import re

def main():
    with open('y:\\ijigenpocket\\Sindandan.html', 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()

    text = text.replace('あなたE', 'あなたの')
    text = text.replace('チェチEしよぁEE</p>', 'チェックしよう！</p>')
    text = text.replace('チェチEしよぁEE', 'チェックしよう！')
    text = text.replace('診断メーカE?', '診断メーカー')
    text = text.replace('全10問E質問！E択）に回答してぁEます?</p>', '全10問の質問（2択）に回答していただきます。</p>')
    text = text.replace('質問！E択）', '質問（2択）')
    text = text.replace('回答してぁEます?', '回答していただきます。')
    text = text.replace('メインコンテナチE?域', 'メインコンテンツ領域')

    with open('y:\\ijigenpocket\\Sindandan.html', 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == '__main__':
    main()
