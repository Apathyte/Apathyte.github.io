"""Fail closed on release files and common disclosure patterns; not an IP opinion."""
from pathlib import Path
import json,re,sys,subprocess
root=Path(__file__).resolve().parents[1]
allowed=json.loads((root/'release-files.json').read_text());errors=[]
patterns={
'private key':r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
'GitHub credential':r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})',
'cloud access ID':r'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b',
'bearer credential':r'(?i)bearer\s+[A-Za-z0-9_\-\.]{24,}',
'credential in URL':r'https?://[^\s/<>]+:[^\s/<>]+@',
'secret assignment':r'(?i)(?:api[_-]?key|client[_-]?secret|password)\s*[:=]\s*["\x27][A-Za-z0-9_\-/+]{16,}',
'hosted workspace identity':r'\bappg(?:prj|dep|ver)_[a-z0-9_]+',
'private address':r'(?<![\w.])(?:10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2[0-9]|3[01])\.\d{1,3}\.\d{1,3})(?![\w.])'}
for rel in allowed:
 if '..' in Path(rel).parts or Path(rel).is_absolute():errors.append(f'{rel}: unsafe path');continue
 p=root/rel
 if p.is_symlink() or not p.is_file():errors.append(f'{rel}: missing or symlink');continue
 if any(x in p.parts for x in ['node_modules','.git','.openai','.wrangler','private','exports']):errors.append(f'{rel}: forbidden directory')
 if p.suffix.lower() in ['.map','.db','.pem','.key','.pfx','.p12','.sqlite'] or p.name.startswith('.env'):errors.append(f'{rel}: forbidden type')
 try:text=p.read_text()
 except UnicodeError:errors.append(f'{rel}: unapproved binary');continue
 for name,pattern in patterns.items():
  if re.search(pattern,text):errors.append(f'{rel}: {name}')
 if len(sys.argv)>1:
  for pattern in json.loads(Path(sys.argv[1]).read_text()):
   if re.search(pattern,text,re.I):errors.append(f'{rel}: restricted-source reference')
for required in ['LICENSE','THIRD_PARTY_NOTICES.txt','package-lock.json','src/lib/public-seed.json','index.html','assets/app.js','assets/index.css']:
 if required not in allowed:errors.append(f'{required}: missing from allowlist')
tracked=subprocess.run(['git','ls-files','--','.'],cwd=root,text=True,capture_output=True)
if tracked.returncode==0:
 for rel in tracked.stdout.splitlines():
  if rel not in allowed:errors.append(f'{rel}: tracked outside allowlist')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(allowed)} allowlisted files; no flagged disclosure patterns. Manual provenance review remains required.')
