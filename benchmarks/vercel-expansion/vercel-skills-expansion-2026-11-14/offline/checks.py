"""Only self-authored, offline toy models. No upstream SDK, network, filesystem target or side effect."""
import copy
import hashlib
import json
from pathlib import Path
from urllib.parse import urlsplit

results = []
def check(name, condition, scope):
    results.append({'case': name, 'passed': bool(condition), 'scope': scope})

def safe_url(value, domain='example.com'):
    try:
        p = urlsplit(value)
        host = (p.hostname or '').lower()
        return (p.scheme == 'https' and p.port in (None, 443)
                and p.username is None and p.password is None
                and (host == domain or host.endswith('.' + domain)))
    except (ValueError, TypeError):
        return False

for value, allowed in [
    ('https://example.com/doc', True), ('https://docs.example.com/doc', True),
    ('https://notexample.com', False), ('https://example.com.evil.test', False),
    ('https://example.com@evil.test', False), ('javascript:alert(1)', False),
    ('data:text/html,test', False), ('http://example.com', False),
    ('https://example.com:444', False), ('https://example.com:bad', False),
]:
    check('url:' + value, safe_url(value) == allowed, '自建URL主机/协议规则；不是渲染库测试')
check('裸endsWith反例确实误判', 'notexample.com'.endswith('example.com'), '仅Python字符串行为，揭示示例风险')

# Minimal custom tree schema: not the upstream json-render specification validator.
PROPS = {'Card': set(), 'Text': {'text'}, 'Button': {'label'}}
def valid_spec(spec, allowed_actions=frozenset({'preview'}), max_nodes=12, max_depth=5):
    if not isinstance(spec, dict) or set(spec) != {'root', 'elements'}: return False
    els = spec['elements']
    if not isinstance(els, dict) or not 0 < len(els) <= max_nodes: return False
    if not isinstance(spec['root'], str) or spec['root'] not in els: return False
    visiting, seen = set(), set()
    def walk(key, depth):
        if key not in els or key in visiting or key in seen or depth > max_depth: return False
        e = els[key]
        if not isinstance(e, dict) or not {'type','props','children'} <= set(e) or set(e)-{'type','props','children','on'}: return False
        typ = e['type']
        if not isinstance(typ, str) or typ not in PROPS or not isinstance(e['props'], dict) or set(e['props']) != PROPS[typ]: return False
        if any(not isinstance(v, str) or len(v) > 200 for v in e['props'].values()): return False
        if not isinstance(e['children'], list) or any(not isinstance(c,str) for c in e['children']): return False
        if typ != 'Card' and e['children']: return False
        events = e.get('on', {})
        if not isinstance(events, dict) or set(events)-({'press'} if typ=='Button' else set()): return False
        if any(not isinstance(a,str) or a not in allowed_actions for a in events.values()): return False
        visiting.add(key)
        for child in e['children']:
            if not walk(child, depth+1): return False
        visiting.remove(key); seen.add(key); return True
    return walk(spec['root'], 1) and seen == set(els)

base = {'root': 'r', 'elements': {
    'r': {'type':'Card','props':{},'children':['t','b']},
    't': {'type':'Text','props':{'text':'中文内容'},'children':[]},
    'b': {'type':'Button','props':{'label':'预览'},'children':[],'on':{'press':'preview'}}}}
check('合法中文小树', valid_spec(base), '自建声明式schema')
variants=[]
x=copy.deepcopy(base);x['elements']['t']['type']='Eval';variants.append(('未知组件',x))
x=copy.deepcopy(base);x['elements']['r']['children'].append('missing');variants.append(('悬空引用',x))
x=copy.deepcopy(base);x['elements']['r']['children'].append('r');variants.append(('循环',x))
x=copy.deepcopy(base);x['elements']['orphan']={'type':'Text','props':{'text':'孤岛'},'children':[]};variants.append(('不可达节点',x))
x=copy.deepcopy(base);x['elements']['r']['children'].append('t');variants.append(('共享节点非树',x))
x=copy.deepcopy(base);x['elements']['b']['on']['press']='delete';variants.append(('未声明动作',x))
x=copy.deepcopy(base);x['elements']['t']['props']['html']='<script/>';variants.append(('额外HTML字段',x))
x=copy.deepcopy(base);x['elements']['t']['props']['text']='a'*201;variants.append(('超长prop',x))
x={'root':'0','elements':{str(i):{'type':'Card','props':{},'children':[str(i+1)] if i<5 else []} for i in range(6)}};variants.append(('超深树',x))
x=copy.deepcopy(base);x['elements']['t']['type']=[];variants.append(('畸形组件类型',x))
x=copy.deepcopy(base);x['elements']['b']['on']['press']={};variants.append(('畸形动作类型',x))
for name, data in variants:check(name, not valid_spec(data), '自建声明式schema；不是上游validateSpec')
last_good=copy.deepcopy(base)
bad=variants[0][1]
if valid_spec(bad):last_good=bad
check('无效patch保留上个有效快照',last_good==base,'自建提交逻辑，无流式renderer')

def authorized(session_actor, resource_owner, action, approval):
    return (session_actor == resource_owner and action == 'save'
            and approval == {'actor':session_actor,'version':2,'action':'save','granted':True})
check('合法服务端主体与批准',authorized('owner','owner','save',{'actor':'owner','version':2,'action':'save','granted':True}),'自建动作权限')
check('客户端approved不改变服务端主体',not authorized('attacker','owner','save',{'actor':'owner','version':2,'action':'save','granted':True}),'自建动作权限')
check('旧版本批准拒绝',not authorized('owner','owner','save',{'actor':'owner','version':1,'action':'save','granted':True}),'自建动作权限')
check('拒绝不能执行',not authorized('owner','owner','save',{'actor':'owner','version':2,'action':'save','granted':False}),'自建动作权限')

# Serial in-memory toy ledger; deliberately NOT a distributed transaction implementation.
ledger={};logical_effects=[]
def perform(business_key,payload,approved,remote_uncertain=False):
    digest=hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest()
    if not approved:return 'denied'
    if business_key in ledger:
        row=ledger[business_key]
        if row['digest']!=digest:return 'conflict'
        return row['status']
    ledger[business_key]={'digest':digest,'status':'pending'}
    if remote_uncertain:
        ledger[business_key]['status']='unknown';return 'unknown'
    logical_effects.append(business_key)
    ledger[business_key]['status']='committed';return 'committed'
check('首次逻辑效果',perform('tenant:doc:export:v2',{'format':'pdf'},True)=='committed','串行自建账本')
check('重复业务意图复用回执',perform('tenant:doc:export:v2',{'format':'pdf'},True)=='committed' and len(logical_effects)==1,'串行自建账本')
check('同键不同payload冲突',perform('tenant:doc:export:v2',{'format':'html'},True)=='conflict' and len(logical_effects)==1,'串行自建账本')
check('未批准不执行',perform('tenant:doc:send:v2',{},False)=='denied' and len(logical_effects)==1,'串行自建账本')
check('unknown不自动重发',perform('tenant:doc:publish:v2',{},True,True)=='unknown' and perform('tenant:doc:publish:v2',{},True)=='unknown' and len(logical_effects)==1,'串行自建账本；不模拟远端真实提交')

counts={'HIT':60,'STALE':10,'PRERENDER':10,'MISS':20,'BYPASS':100}
served=sum(counts[k] for k in ['HIT','STALE','PRERENDER'])
check('可缓存流量分母命中率80%',served/(served+counts['MISS'])==0.8,'自建指标算术')
check('trace秒纳秒转毫秒',2*1000+500000000/1e6==2500,'自建单位换算')
def can_parallel(a,b,deps):
    # Two-request toy graph only; arbitrary graphs need transitive dependency analysis.
    return a not in deps.get(b,set()) and b not in deps.get(a,set())
check('有依赖请求不可并行',not can_parallel('fetchUser','fetchPosts',{'fetchPosts':{'fetchUser'}}),'两请求显式有向依赖示例，不做源码静态分析')
check('独立请求允许并行',can_parallel('fetchUser','fetchPublicPosts',{}),'两请求显式有向依赖示例')

report={'kind':'SELF_AUTHORED_OFFLINE_TOY_CHECKS_ONLY','total':len(results),'passed':sum(x['passed'] for x in results),'failed':sum(not x['passed'] for x in results),'upstream_sdks_run':False,'network_requests':0,'live_deployments':0,'cases':results,'limitations':['无真实数据库/并发/事务/外部幂等窗口','无上游SDK安装、模型调用或平台API','无DOM/Markdown流式渲染/无障碍/E2E/性能测量','schema为自建子集，不是json-render validateSpec实现']}
Path(__file__).with_name('results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:report[k] for k in ['total','passed','failed','upstream_sdks_run','network_requests']},ensure_ascii=False))
raise SystemExit(1 if report['failed'] else 0)
