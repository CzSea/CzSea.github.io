// 简易人设工坊逻辑（无外部依赖）
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

function sampleRandom(){
  const names=['林月','苏暮','沈辞','柳絮','陈默','顾清'];
  const occ=['游侠','侦探','学者','炼金术士','记者','医生'];
  const kws=['冷静','孤儿','复仇','执着','幽默','傲娇','温柔','神秘'];
  return {
    name: names[Math.floor(Math.random()*names.length)],
    keywords: [kws[Math.floor(Math.random()*kws.length)], kws[Math.floor(Math.random()*kws.length)]].filter((v,i,s)=>v && s.indexOf(v)===i).join(', '),
    age: 20 + Math.floor(Math.random()*25),
    gender: ['女','男','不明'][Math.floor(Math.random()*3)],
    occupation: occ[Math.floor(Math.random()*occ.length)],
    style: ['写实','奇幻','现代浪漫','玄幻','悬疑'][Math.floor(Math.random()*5)]
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

function narrative(profile){
  const k = profile.keywords.length ? '（关键词：' + profile.keywords.join('，') + '）' : '';
  const age = profile.age ? profile.age + ' 岁，' : '';
  return `${profile.name} · ${profile.style}
${age}${profile.gender || ''}${profile.gender ? '，' : ''}${profile.occupation || ''}
${k}

简介：
${profile.name} 是一个${profile.occupation || '未知职业'}，性格 ${profile.keywords.join('，') || '未明'}。可以在故事中承担推动情节或作为主角的陪衬，拥有可扩展的背景与成长弧线。`;
}

function renderProfile(profile){
  narrativeEl.textContent = narrative(profile);
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
