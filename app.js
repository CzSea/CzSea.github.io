    const focusBackstory = q('#focus-backstory');
    const focusRelations = q('#focus-relations');
    const focusSecrets = q('#focus-secrets');
    const focusAppearance = q('#focus-appearance');

    const customKey = q('#custom-key');
    const customValue = q('#custom-value');
    const btnAddCustom = q('#btn-add-custom');
    const customList = q('#custom-list');
    const customNotes = q('#custom-notes');

    const STORAGE_KEY = 'renshe_profiles_v2';

    if(!narrativeEl){
      console.warn('页面元素未找到（#narrative），脚本将终止。');
      return;
    }

    // Basic pools
    const birthPlaces = ['沿海小镇','北方边城','都会郊区','山间村落','王都学区','流浪者营地','宇宙殖民地'];
    const familyNotes = ['父亲早逝，母亲独自抚养','家族中世代为铁匠/医生/学者','来自名门望族，但家道中落','父母是旅人，常年不在家','被寄养在远方亲戚家中'];
    const incitingEvents = ['一场突如其来的火灾摧毁了他们的家','在少年时期失去挚友，从此立誓复仇','发现一本神秘手稿，改变人生道路','目睹一个冤案，决定追寻真相','在外地经历战争/瘟疫，学会坚韧'];
    const personalityBits = ['冷静而敏锐','热情且冲动','内向沉默但关键时刻会爆发','幽默风趣','理智且讲究原则'];
    const skillsList = ['擅长追踪与侦查','具有医术/炼金/工匠手艺','精通剑术或射击','熟悉古文字与历史典籍','擅长社交与谈判'];
    const appearanceBits = ['一头凌乱的黑发，一双深邃的眼睛','身材高挑，面容略带沧桑','脸上有一道不易察觉的旧疤','总穿着带有家族徽记的披风','手上常年带着一串旧念珠'];
    const relations = ['与儿时玩伴反目成仇','与导师保持复杂师徒关系','与某组织有牵连','和家人保持疏离却难以割舍','有一段被隐藏的爱情故事'];
    const secrets = ['为了保护他人隐瞒了真相','曾为生存做出违背信念之事','身体内藏别人不知道的弱点/诅咒','其实并非自己所说的身份','曾参与过一场被封存的阴谋'];

    function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

    // sample random for quick fill
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

    // custom fields store
    let customFields = [];

    function escapeHtml(s){
      return String(s || '').replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
    }

    function renderCustomList(){
      if(!customList) return;
      if(!customFields.length){ customList.innerHTML = '<div class="hint">（尚未添加）</div>'; return; }
      customList.innerHTML = '';
      customFields.forEach((f, idx)=>{
        const div = document.createElement('div'); div.className='custom-item';
        const left = document.createElement('div'); left.innerHTML = `<span class="k">${escapeHtml(f.k)}</span>: <span class="v">${escapeHtml(f.v)}</span>`;
        const actions = document.createElement('div');
        const btnDel = document.createElement('button'); btnDel.textContent='删除'; btnDel.className='btn';
        btnDel.onclick = ()=>{ customFields.splice(idx,1); renderCustomList(); };
        actions.appendChild(btnDel);
        div.appendChild(left); div.appendChild(actions);
        customList.appendChild(div);
      });
    }

    if(btnAddCustom) btnAddCustom.addEventListener('click', ()=>{
      const k = (customKey.value || '').trim();
      const v = (customValue.value || '').trim();
      if(!k || !v){ alert('请填写字段名和字段值'); return; }
      customFields.push({k,v});
      customKey.value=''; customValue.value='';
      renderCustomList();
    });

    // length slider update
    if(lengthRange && lengthValue){
      lengthValue.textContent = lengthRange.value;
      lengthRange.addEventListener('input', ()=> lengthValue.textContent = lengthRange.value);
    }

    // build profile from form
    function buildProfileFromForm(){
      return {
        name: (inputName && inputName.value || '未命名').trim(),
        keywords: (inputKeywords && inputKeywords.value || '').split(',').map(s=>s.trim()).filter(Boolean),
        age: (inputAge && inputAge.value) ? Number(inputAge.value) : null,
        gender: (inputGender && inputGender.value || '').trim(),
        occupation: (inputOccupation && inputOccupation.value || '').trim(),
        style: (inputStyle && inputStyle.value || '').trim(),
        tone: (toneSelect && toneSelect.value) || 'neutral',
        length: Number((lengthRange && lengthRange.value) || 600),
        focus: {
          backstory: !!(focusBackstory && focusBackstory.checked),
          relations: !!(focusRelations && focusRelations.checked),
          secrets: !!(focusSecrets && focusSecrets.checked),
          appearance: !!(focusAppearance && focusAppearance.checked)
        },
        custom: customFields.slice(),
        notes: (customNotes && customNotes.value || '').trim(),
        createdAt: new Date().toISOString()
      };
    }

    // ensure min length
    function ensureMinLength(text, minChars, pool){
      let out = text || '';
      let i=0;
      while(out.length < minChars && i < 120){
        out += '\n\n' + pick(pool || [
          '他的过去里有许多无法言说的瞬间，那些记忆像潮水一般，既冲刷又塑造了现在的他。',
          '在无数个不眠之夜里，他一次次问自己：我要为了什么活下去？',
          '若要描述他的灵魂，或许可以用“矛盾”来概括：既渴望被理解，又害怕被拖累。',
          '每一次决定都带着代价，他学会了权衡与承受。',
          '他的行动里常常带着小心的温柔，那是经历过太多苦痛后仍不肯放弃的人性光亮。'
        ]);
        i++;
      }
      return out;
    }

    // style modifiers and tone templates
    const styleModifiers = {
      '写实': (parts)=>parts,
      '奇幻': (parts)=>{ parts.splice(2,0,'魔法/异能线索：在成长过程中接触到不为人知的仪式或传承，这会引入超自然冲突。'); return parts; },
      '玄幻': (parts)=>{ parts.push('玄幻元素：修炼、门派或灵器会贯穿人物命运。'); return parts; },
      '悬疑': (parts)=>{ parts.push('悬疑线：故事中埋下若干疑点，主角的调查会成为推动力。'); return parts; },
      '历史': (parts)=>{ parts.push('年代感：强调时代与家族世系，塑造权力与伦理冲突。'); return parts; },
      '科幻': (parts)=>{ parts.push('科技关联：可能涉及义体改造、基因或太空殖民等科技元素。'); return parts; },
      '蒸汽朋克': (parts)=>{ parts.push('蒸汽朋克：齿轮、蒸汽与复古机械是世界观装饰。'); return parts; },
      '黑暗幻想': (parts)=>{ parts.push('黑暗元素：道德模糊与恐惧试炼，人物接受沉重代价。'); return parts; },
      '喜剧': (parts)=>{ parts.push('喜剧风：更多幽默描写与轻松冲突。'); return parts; }
    };
    const toneTemplates = {
      serious: s=>s,
      neutral: s=>s,
      playful: s=>s.replace(/。/g,'！'),
      melancholic: s=>s.replace(/。/g,'。')
    };

    // build narrative
    function narrative(profile){
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
      if(profile.focus.backstory) parts.push(`出生与成长：${name} 出生在 ${place}，${family}。童年并不平静，早年的转折是：${incident}，这件事深刻影响了他/她的价值观与选择。`);
      parts.push(`经历与转折：在曲折的路途中，${name} 学会了生存与适应，并掌握了 ${skill}。这些经历既让他/她变得坚韧，也在性格中留下了痕迹。`);
      if(profile.focus.appearance) parts.push(`外貌与标志：${appear}。这些细节常常成为辨认他/她身份的线索。`);
      if(profile.focus.relations) parts.push(`重要关系：${name} 与世界的牵连包括：${rel}。这些关系既能成为动力，也可能引发冲突。`);
      if(profile.focus.secrets) parts.push(`秘密与矛盾：${name} 的内心藏着秘密：${secret}。在剧情推进中，这既是弱点也是推动力。`);
      parts.push(`性格与动机：从性格上看，${name} ${per}。关键词：${kw}。他/她常被内心的某个目标驱使：复仇、救赎或寻找真相。`);
      parts.push(`现在与目标：现在的 ${name} 正在朝着目标前进：${occ} 或追寻内心的和解。`);

      if(profile.custom && profile.custom.length){
        const lines = profile.custom.map(c=>`${c.k}：${c.v}`);
        parts.push(`额外设定：${lines.join('；')}`);
      }
      if(profile.notes) parts.push(`创作笔记：${profile.notes}`);

      // style modifier
      const modifier = styleModifiers[style] || (p=>p);
      parts = modifier(parts, profile);

      let text = parts.join('\n\n');
      const toneFn = toneTemplates[profile.tone] || (s=>s);
      text = toneFn(text);
      text = ensureMinLength(text, profile.length || 500);
      return text;
    }

    // render function
    function renderProfile(profile){
      const text = narrative(profile);
      narrativeEl.textContent = text;
      if(jsonOutput) jsonOutput.textContent = JSON.stringify(profile, null, 2);
    }

    // storage functions
    function loadLibrary(){
      try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }catch(e){ return []; }
    }
    function saveLibrary(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

    function refreshLibraryUI(){
      if(!profilesList) return;
      const list = loadLibrary();
      if(!list.length){ profilesList.innerHTML = '<div class="hint">暂无已保存的人设。</div>'; return; }
      profilesList.innerHTML = '';
      list.slice().reverse().forEach((p, idx)=>{
        const div = document.createElement('div'); div.className='item';
        const meta = document.createElement('div'); meta.innerHTML = `<div><strong>${escapeHtml(p.name||'未命名')}</strong></div><div class="meta">${escapeHtml(p.occupation||'')} · ${escapeHtml(p.style||'')} · ${p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>`;
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
      if(!p) return;
      if(inputName) inputName.value = p.name || '';
      if(inputKeywords) inputKeywords.value = (p.keywords||[]).join(', ');
      if(inputAge) inputAge.value = p.age || '';
      if(inputGender) inputGender.value = p.gender || '';
      if(inputOccupation) inputOccupation.value = p.occupation || '';
      if(inputStyle) inputStyle.value = p.style || '写实';
      if(toneSelect) toneSelect.value = p.tone || 'neutral';
      if(lengthRange){ lengthRange.value = p.length || 600; lengthValue.textContent = lengthRange.value; }
      if(focusBackstory) focusBackstory.checked = p.focus ? !!p.focus.backstory : true;
      if(focusRelations) focusRelations.checked = p.focus ? !!p.focus.relations : true;
      if(focusSecrets) focusSecrets.checked = p.focus ? !!p.focus.secrets : true;
      if(focusAppearance) focusAppearance.checked = p.focus ? !!p.focus.appearance : true;
      customFields = (p.custom && p.custom.slice()) || [];
      renderCustomList();
      if(customNotes) customNotes.value = p.notes || '';
    }

    // event bindings (guarded)
    if(btnRandom) btnRandom.addEventListener('click', ()=>{
      const s = sampleRandom();
      populateForm(s);
      renderProfile(buildProfileFromForm());
    });
    if(btnGenerate) btnGenerate.addEventListener('click', ()=>{
      try{
        const profile = buildProfileFromForm();
        renderProfile(profile);
      }catch(e){
        console.error(e);
        narrativeEl.textContent = '生成发生错误：' + (e.message || e);
      }
    });
    if(btnSave) btnSave.addEventListener('click', ()=>{
      const p = buildProfileFromForm();
      const arr = loadLibrary(); arr.push(p); saveLibrary(arr); refreshLibraryUI();
      alert('已保存到本地库');
    });
    if(btnDownloadJson) btnDownloadJson.addEventListener('click', ()=>{
      const p = buildProfileFromForm();
      const blob = new Blob([JSON.stringify(p,null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download = (p.name||'profile') + '.json'; a.click(); URL.revokeObjectURL(url);
    });
    if(btnDownloadMd) btnDownloadMd.addEventListener('click', ()=>{
      const p = buildProfileFromForm();
      const md = `# ${p.name}\n\n- 职业：${p.occupation||'-'}\n- 年龄：${p.age||'-'}\n- 性别：${p.gender||'-'}\n- 风格：${p.style||'-'}\n- 关键词：${(p.keywords||[]).join('，')}\n\n## 长篇背景\n\n${narrative(p)}\n\n## 额外设定\n\n${(p.custom||[]).map(c=>`- ${c.k}：${c.v}`).join('\n')}\n\n## 创作笔记\n\n${p.notes||''}`;
      const blob = new Blob([md],{type:'text/markdown'});
      const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=(p.name||'profile')+'.md'; a.click(); URL.revokeObjectURL(url);
    });
    if(btnPrint) btnPrint.addEventListener('click', ()=>{ window.print(); });
    if(btnDownloadAll) btnDownloadAll.addEventListener('click', ()=>{
      const arr = loadLibrary();
      if(!arr.length){ alert('本地库为空'); return; }
      const blob = new Blob([JSON.stringify(arr,null,2)],{type:'application/json'});
      const url = URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='renshe-library.json'; a.click(); URL.revokeObjectURL(url);
    });

    // init UI & sample
    function boot(){
      renderCustomList();
      refreshLibraryUI();
      const sample = { name: '示例：林月', keywords:['冷静','执着'], age:28, gender:'女', occupation:'游侠', style:'写实', tone:'neutral', length:600, focus:{backstory:true,relations:true,secrets:true,appearance:true}, custom:[], notes:'示例：角色的动机是为家族复仇。', createdAt:new Date().toISOString() };
      renderProfile(sample);
    }
    boot();
  }); // end safe
})();
