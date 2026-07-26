// 增强版人设工坊逻辑：生成不少于 500 字的长篇人物背景（中文）
const q = s => document.querySelector(s);
const inputName = q('#input-name');
const inputKeywords = q('#input-keywords');
const inputAge = q('#input-age');
const inputGender = q('#input-gender');
const inputOccupation = q('#input-occupation');
const inputStyle = q('#input-style');

const btnGenerate = q('#btn-generate');
const btnSave = q('#btn-save');
const btnRandom = q('#btn-random');
const btnDownloadJson = q('#btn-download-json');
const btnDownloadMd = q('#btn-download-md');
const btnPrint = q('#btn-print');
const btnDownloadAll = q('#btn-download-all');

const narrativeEl = q('#narrative');
const jsonOutput = q('#json-output');
const profilesList = q('#profiles-list');

const STORAGE_KEY = 'renshe_profiles_v1';

// 更多随机素材，丰富生成
const birthPlaces = ['沿海小镇', '北方边城', '都会郊区', '山间村落', '王都学区', '流浪者营地', '宇宙殖民地'];
const familyNotes = [
  '父亲早逝，母亲独自抚养',
  '家族中世代为铁匠/医生/学者',
  '来自名门望族，但家道中落',
  '父母是同行的旅人，常年不在家',
  '被寄养在远方的亲戚家中'
];
const incitingEvents = [
  '一场突如其来的火灾摧毁了他们的家',
  '在少年时期失去挚友，从此立誓复仇',
  '发现一本神秘手稿，改变了人生道路',
  '目睹一个冤案，决定追寻真相',
  '在外地经历战争/瘟疫，学会了坚韧'
];
const personalityBits = [
  '冷静而敏锐，常常先观察再行动',
  '热情且冲动，容易被感情推动',
  '内向沉默，但在关键时刻会爆发力量',
  '幽默风趣，善于用语言化解尴尬',
  '理智且讲究原则，讨厌模糊地带'
];
const skillsList = [
  '擅长追踪与侦查',
  '具有医术/炼金/工匠手艺',
  '精通剑术或射击',
  '熟悉古文字与历史典籍',
  '擅长社交与谈判'
];
const appearanceBits = [
  '一头凌乱的黑发，一双深邃的眼睛',
  '身材高挑，面容略带沧桑',
  '脸上有一道不易察觉的旧疤',
  '总穿着带有家族徽记的披风',
  '手上常年带着一串旧念珠'
];
const relations = [
  '与儿时玩伴反目成仇',
  '与导师保持复杂的师徒关系',
  '与某个组织有着剪不断的牵连',
  '和家人保持疏离却又难以割舍',
  '有一段被隐藏的爱情故事'
];
const secrets = [
  '为了保护他人隐瞒了真相',
  '曾为生存而做出违背信念的事',
  '身体内藏有别人不知道的弱点/诅咒',
  '其实并非自己所说的身份',
  '曾参与过一场被封存的阴谋'
];

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function sampleRandom(){
  const names=['林月','苏暮','沈辞','柳絮','陈默','顾清','凌霜','莫言','夏陌','顾北'];
  const occ=['游侠','侦探','学者','炼金术士','记者','医生','铁匠','舰长','历史学家','赏金猎人'];
  const kws=['冷静','孤儿','复仇','执着','幽默','傲娇','温柔','神秘','坚韧','善良','机智','多疑'];
  return {
    name: names[Math.floor(Math.random()*names.length)],
    keywords: Array.from({length: 3}, ()=>kws[Math.floor(Math.random()*kws.length)]).filter((v,i,s)=>s.indexOf(v)===i),
    age: 18 + Math.floor(Math.random()*30),
    gender: ['女','男','不明'][Math.floor(Math.random()*3)],
    occupation: occ[Math.floor(Math.random()*occ.length)],
    style: ['写实','奇幻','现代浪漫','玄幻','悬疑','历史','科幻','蒸汽朋克','黑暗幻想','喜剧'][Math.floor(Math.random()*10)]
  };
}

function buildProfileFromForm(){
  return {
    name: (inputName.value || '未命名').trim(),
    keywords: (inputKeywords.value||'').split(',').map(s=>s.trim()).filter(Boolean),
    age: inputAge.value ? Number(inputAge.value) : null,
    gender: (inputGender.value||'').trim(),
    occupation: (inputOccupation.value||'').trim(),
    style: (inputStyle.value||'').trim(),
    createdAt: new Date().toISOString()
  };
}

// 保证长度至少 minChars（中文字符计数）
function ensureMinLength(text, minChars){
  // 若已足够，直接返回；否则循环追加素材句子直到满足
  const pool = [
    '他的过去里有许多无法言说的瞬间，那些记忆像潮水一般，既冲刷又塑造了现在的他。',
    '在无数个不眠之夜里，他一次次问自己：我要为了什么活下去？',
    '若要描述他的灵魂，或许可以用“矛盾”来概括：既渴望被理解，又害怕被拖累。',
    '每一次决定都带着代价，他学会了权衡与承受。',
    '他的行动里常常带着小心的温柔，那是经历过太多苦痛后仍不肯放弃的人性光亮。'
  ];
  let out = text;
  let i = 0;
  while(out.length < minChars && i < 50){
    out += '\n\n' + pick(pool);
    i++;
  }
  return out;
}

function narrative(profile){
  // 生成多段结构化长文
  const place = pick(birthPlaces);
  const family = pick(familyNotes);
  const incident = pick(incitingEvents);
  const per = pick(personalityBits);
  const skill = pick(skillsList);
  const appear = pick(appearanceBits);
  const rel = pick(relations);
  const secret = pick(secrets);

  const name = profile.name || '某人';
  const style = profile.style || '写实';
  const kw = (profile.keywords && profile.keywords.length) ? profile.keywords.join('，') : '无明显关键词';
  const age = profile.age ? profile.age + ' 岁' : '年龄未明';
  const occ = profile.occupation || '无职业设定';

  let parts = [];

  parts.push(`${name} · ${style}`);
  parts.push(`出生与成长：${name} 出生在 ${place}，${family}。童年并不平静，周围的人和环境将他/她逐步塑造成一个沉默而警觉的人。在早年的经历中，${incident}，这成为他/她人生的转折点。`);
  parts.push(`经历与转折：那次事件之后，${name} 被迫离开熟悉的环境，学会了独立与自救。为了生存，他/她学会了 ${skill}，并在实践中不断磨砺技艺与心智。道路并非坦途，反而由此结识了几位关键人物，这些人既可能是盟友，也可能成为日后的敌人。`);
  parts.push(`性格与动机：从性格上看，${name} ${per}。关键词：${kw}。他/她的内心有一股不肯妥协的意志，驱使着他/她去追求某个明确的目标（或复仇、或救赎、或探寻真相）。在社交场合，表面冷静的外衣下常藏着复杂的情绪。`);
  parts.push(`外貌与标志：${appear}。这些外观特征让他/她在众人中易于辨识，也常常成为他/她身份与过去的线索。`);
  parts.push(`重要关系：${name} 与他/她的世界有着复杂的牵连：${rel}。这些关系既推动剧情发展，也为人物增加了道德与情感的冲突，使其更具立体感。`);
  parts.push(`秘密与矛盾：最大的秘密是，${secret}。这个秘密既是弱点，也是推动角色成长的内在矛盾，在关键时刻可能改变故事的走向。`);
  parts.push(`现在与目标：现在的 ${name} 正朝着一个明确的方向前进：${profile.occupation ? '以“' + profile.occupation + '”的身份履行自己的职责' : '寻求答案与和解'}。他/她的目标既包含外在的实务任务，也承载着内心的救赎欲望。`);
  parts.push(`结语：${name} 的故事还未结束，更多的篇章将由他/她的选择与遭遇书写——每一次决定都可能使命运发生偏移，而读者将看到一个在伤痕与希望中不断前行的人物。`);

  let text = parts.join('\n\n');

  // 确保不少于 500 个中文字符（约 500 字）
  text = ensureMinLength(text, 500);

  return text;
}

function renderProfile(profile){
  const text = narrative(profile);
  narrativeEl.textContent = text;
  jsonOutput.textContent = JSON.stringify(profile, null, 2);
}

function loadLibrary(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){return [];}
}

function saveLibrary(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

function refreshLibraryUI(){
  const list = loadLibrary();
  if(!list.length){ profilesList.innerHTML = '<div class="hint">暂无已保存的人设。</div>'; return; }
  profilesList.innerHTML = '';
  list.slice().reverse().forEach((p, idx)=>{
    const div = document.createElement('div'); div.className='item';
    const meta = document.createElement('div'); meta.innerHTML = `<div><strong>${p.name}</strong></div><div class="meta">${p.occupation || ''} · ${p.style || ''} · ${p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>`;
    const actions = document.createElement('div');
    const btnLoad = document.createElement('button'); btnLoad.textContent='加载'; btnLoad.className='btn ghost';
    btnLoad.onclick = ()=>{ renderProfile(p); populateForm(p); };
    const btnDelete = document.createElement('button'); btnDelete.textContent='删除'; btnDelete.className='btn';
    btnDelete.onclick = ()=>{
      if(!confirm('确认删除该人设？')) return;
      const orig = loadLibrary(); orig.splice(orig.length-1-idx,1); saveLibrary(orig); refreshLibraryUI();
    };
    actions.appendChild(btnLoad); actions.appendChild(btnDelete);
    div.appendChild(meta); div.appendChild(actions);
    profilesList.appendChild(div);
  });
}

function populateForm(p){
  inputName.value = p.name || '';
  inputKeywords.value = (p.keywords||[]).join(', ');
  inputAge.value = p.age || '';
  inputGender.value = p.gender || '';
  inputOccupation.value = p.occupation || '';
  inputStyle.value = p.style || '写实';
}

btnRandom.addEventListener('click', ()=>{
  const s = sampleRandom();
  populateForm(s);
  renderProfile(buildProfileFromForm());
});

btnGenerate.addEventListener('click', ()=>{
  const p = buildProfileFromForm();
  renderProfile(p);
});

btnSave.addEventListener('click', ()=>{
  const p = buildProfileFromForm();
  const arr = loadLibrary();
  arr.push(p);
  saveLibrary(arr);
  refreshLibraryUI();
  alert('已保存到本地库');
});

btnDownloadJson.addEventListener('click', ()=>{
  const p = buildProfileFromForm();
  const blob = new Blob([JSON.stringify(p,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = (p.name||'profile') + '.json'; a.click(); URL.revokeObjectURL(url);
});

btnDownloadMd.addEventListener('click', ()=>{
  const p = buildProfileFromForm();
  const md = `# ${p.name}\n\n- 职业：${p.occupation||'-'}\n- 年龄：${p.age||'-'}\n- 性别：${p.gender||'-'}\n- 风格：${p.style||'-'}\n- 关键词：${(p.keywords||[]).join('，')}\n\n## 简介\n\n${narrative(p)}\n`;
  const blob = new Blob([md],{type:'text/markdown'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=(p.name||'profile')+'.md'; a.click(); URL.revokeObjectURL(url);
});

btnPrint.addEventListener('click', ()=>{ window.print(); });

btnDownloadAll.addEventListener('click', ()=>{
  const arr = loadLibrary();
  if(!arr.length){ alert('本地库为空'); return; }
  const blob = new Blob([JSON.stringify(arr,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='renshe-library.json'; a.click(); URL.revokeObjectURL(url);
});

function init(){
  refreshLibraryUI();
  // Render a default sample
  const sample = { name: '示例：林月', keywords:['冷静','执着'], age:28, gender:'女', occupation:'游侠', style:'写实', createdAt:new Date().toISOString() };
  renderProfile(sample);
}
init();
