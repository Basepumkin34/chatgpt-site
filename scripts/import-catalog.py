"""Build a compact, source-backed static catalog from documented CSV snapshots.
Usage: python3 scripts/import-catalog.py MOVIES_CSV TV_CSV TV_TEXT_CSV
Input snapshots are not fabricated or generated titles. See docs/catalog-sources.md.
"""
import ast,csv,json,pathlib,re,sys
out=pathlib.Path(__file__).resolve().parents[1]/'public/data';out.mkdir(exist_ok=True)
def number(x,default=0):
 try:return float(x)
 except (ValueError,TypeError):return default
def slug(s):return re.sub('[^a-z0-9]+','-',__import__('unicodedata').normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-') or 'title'
def genre_name(s):return {'Science Fiction':'Sci-Fi','Sci-Fi & Fantasy':'Sci-Fi','Action & Adventure':'Adventure','War & Politics':'War'}.get(s,s)
def duration(n):
 n=int(number(n));return f'{n//60}h {n%60}m' if n else ''
movies=[];seen=set()
with open(sys.argv[1],encoding='utf-8') as f:
 for r in csv.DictReader(f):
  if str(r.get('adult','')).lower()!='false' or not str(r.get('id','')).isdigit():continue
  i=int(r['id']);poster=(r.get('poster_path') or '');name=(r.get('title') or '').strip();date=(r.get('release_date') or '')
  if i in seen or not name or not re.match(r'^/[\w]+\.(jpg|png)$',poster) or number(r.get('vote_count'))<20:continue
  try:genres=[genre_name(g['name']) for g in ast.literal_eval(r.get('genres') or '[]') if isinstance(g,dict) and 'name' in g]
  except (ValueError,SyntaxError):genres=[]
  seen.add(i);movies.append(dict(id=f'movie-{i}',tmdb=i,imdb=(r.get('imdb_id') or ''),name=name,year=int(date[:4]) if re.match(r'^\d{4}-',date) else None,type='Movies',genre=genres[0] if genres else 'Uncategorized',genres=genres,length=duration(r.get('runtime')),rating=number(r.get('vote_average')),votes=int(number(r.get('vote_count'))),poster=poster,description=(r.get('overview') or '').strip(),slug=f'{slug(name)}-{i}'))
movies=sorted(movies,key=lambda x:x['votes'],reverse=True)[:10000]
with open(sys.argv[3],encoding='utf-8') as f:text={r['id']:r.get('overview','') for r in csv.DictReader(f)}
tv=[];seen=set()
with open(sys.argv[2],encoding='utf-8') as f:
 for r in csv.DictReader(f):
  if str(r.get('adult','')).lower()!='false' or not str(r.get('id','')).isdigit() or number(r.get('vote_count'))<10:continue
  i=int(r['id']);name=(r.get('name') or '').strip()
  if i in seen or not name:continue
  genres=[genre_name(k[7:]) for k,v in r.items() if k.startswith('genres_') and v=='True' and k!='genres_Empty'];date=(r.get('first_air_date') or '');seasons=int(number(r.get('number_of_seasons')));seen.add(i)
  tv.append(dict(id=f'tv-{i}',tmdb=i,imdb='',name=name,year=int(date[:4]) if re.match(r'^\d{4}-',date) else None,type='TV Shows',genre=genres[0] if genres else 'Uncategorized',genres=genres,length=f'{seasons} seasons' if seasons else '',seasonCount=seasons,episodeCount=int(number(r.get('number_of_episodes'))),rating=number(r.get('vote_average')),votes=int(number(r.get('vote_count'))),poster='',description=text.get(r['id'],'').strip(),slug=f'{slug(name)}-{i}'))
tv=sorted(tv,key=lambda x:x['votes'],reverse=True)[:5000]
index=[]
for kind,records in [('movies',movies),('tv',tv)]:
 for start in range(0,len(records),500):
  batch=records[start:start+500];chunk=f'{kind}-{start//500}.json';(out/chunk).write_text(json.dumps(batch,ensure_ascii=False,separators=(',',':')))
  for row in batch:index.append({**{k:v for k,v in row.items() if k not in ['description','votes','episodeCount']},'chunk':chunk})
manifest={'version':1,'counts':{'movies':len(movies),'tv':len(tv),'total':len(index)},'source':'TMDB archival metadata snapshots; not current availability','titles':index}
(out/'catalog-index.json').write_text(json.dumps(manifest,ensure_ascii=False,separators=(',',':')))
print(json.dumps(manifest['counts']));print('Catalog output bytes:',sum(p.stat().st_size for p in out.glob('*.json')))
