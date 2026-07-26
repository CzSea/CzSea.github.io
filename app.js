(function () {
  'use strict';

  function safe(fn){
    try{ fn(); }catch(e){
      console.error(e);
      const out = document.getElementById('narrative');
      if(out) out.textContent = '脚本加载错误：' + (e && e.message ? e.message : String(e)) + '\n把这段错误信息发给我。';
    }
  }

  safe(function initAll(){
    const q = s => document.querySelector(s);

    // Inputs & buttons
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

    const lengthRange = q('#length-range');
    const lengthValue = q('#length-value');
    const toneSelect = q('#tone');
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
      console.warn('#narrative 未找到，脚本停止执行。');
      return;
    }

    // 内容素材（完整）
    const birthPlaces = [
      '沿海小镇', '北方边城', '都会郊区', '山间村落', '王都学区', '流浪者营地', '宇宙殖民地'
    ];
    const familyNotes = [
      '父亲早逝，母亲独自抚养',
      '家族中世代为铁匠/医生/学者',
      '来自名门望族，但家道中落',
      '父母是旅人，常年不在家',
      '被寄养在远方亲戚家中'
    ];
    const incitingEvents = [
      '一场突如其来的火灾摧毁了他们的家',
      '在少年时期失去挚友，从此立誓复仇',
      '发现一本神秘手稿，改变人生道路',
      '目睹一个冤案，决定追寻真相',
      '在外地经历战争或瘟疫，学会坚韧'
    ];
    const personalityBits = [
      '冷静而敏锐', '热情且冲动', '内向沉默但关键时刻会爆发', '幽默风趣', '理智且讲究原则'
    ];
    const skillsList = [
      '擅长追踪与侦查', '具有医术/炼金/工匠手艺', '精通剑术或射击',
      '熟悉古文字与历史典籍', '擅长社交与谈判'
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
      '与导师保持复杂师徒关系',
      '与某组织有牵连',
      '和家人保持疏离却难以割舍',
      '有一段被隐藏的爱情故事'
    ];
    const secrets = [
      '为了保护他人隐瞒了真相',
      '曾为生存做出违背信念之事',
      '身体内藏别人不知道的弱点或诅咒',
      '其实并非自己所说的身份',
      '曾参与过一场被封存的阴谋'
    ];

    function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

    function sampleRandom(){
      const names = ['林月','苏暮','沈辞','柳絮','陈默','顾清','凌霜','莫言','夏陌','顾北'];
      const occ = ['游侠','侦探','学者','炼金术士','记者','医生','铁匠','舰长','历史学家','赏金猎人'];
      const kws = ['冷静','孤儿','复仇','执着','幽默','傲娇','温柔','神秘','坚韧','善良','机智','多疑'];
      return {
        name: names[Math.floor(Math.random()*names.length)],
        keywords: Array.from({length:3}, ()=>kws[Math.floor(Math.random()*kws.length)]).filter((v,i,s)=>s.indexOf(v)===i),
        age: 18 + Math.floor(Math.random()*30),
        gender: ['女','男','不明'][Math.floor(Math.random()*3)],
        occupation: occ[Math.floor(Math.random()*occ.length)],
        style: ['写实','奇幻','现代浪漫','玄幻','悬疑','历史','科幻','蒸汽朋克','黑暗幻想','喜剧'][Math.floor(Math.random()*10)]
      };
    }

    // 自定义字段
    let customFields = [];

    function escapeHtml(s){ return String(s || '').replace(/[&<>\