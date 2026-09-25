import os, json, re, sys, urllib.request, urllib.error

file_path = os.environ['MD_FILE']
date      = os.environ['POST_DATE']
token     = os.environ['TG_TOKEN']
chat_id   = int(os.environ['TG_CHAT'])
card_url  = f'https://lucasdoti.github.io/bartender-de-bolso/instagram/{date}.html'

with open(file_path, encoding='utf-8') as f:
    content = f.read()

m = re.search(r'### LEGENDA\s*\n(.*?)### DICA', content, re.DOTALL)
if not m:
    print('LEGENDA nao encontrada no arquivo')
    sys.exit(1)

legenda = m.group(1).strip()
text    = legenda + '\n\n---\nVer card: ' + card_url

payload = json.dumps({'chat_id': chat_id, 'text': text}).encode('utf-8')
req = urllib.request.Request(
    f'https://api.telegram.org/bot{token}/sendMessage',
    data=payload,
    headers={'Content-Type': 'application/json; charset=utf-8'},
)
try:
    resp   = urllib.request.urlopen(req)
    result = json.loads(resp.read().decode())
    print('OK:', result.get('ok'))
except urllib.error.HTTPError as e:
    print('Erro HTTP:', e.code, e.read().decode())
    sys.exit(1)
