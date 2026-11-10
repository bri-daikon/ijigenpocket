(function(root){
  const abilityNames=['身体','精神','感覚','知性'];
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  function skillAbility(skill,schema){
    for(const [ability,skills] of Object.entries(schema.tags||{}))if(skills.includes(skill))return ability;
    return '';
  }
  function skillFromCheck(value){return String(value||'').split(/VS|vs|対/)[0].trim();}
  function commandForSkill(skill,label,data,schema,extra=''){
    const ability=skillAbility(skill,schema);if(!ability)return '';
    const dice=(data.tags||[]).includes(skill)?'SBS':'SB';
    return `${dice}<={${ability}}*5　【${label}】${skill}${extra}`;
  }
  function buildCommands(data,result,schema){
    const battle=['ーーーー戦闘用ーーーーー'];
    for(const [row,kind] of [...(data.equipment||[]).map(row=>[row,'equipment']),...(data.magic||[]).map(row=>[row,'magic'])]){
      const columns=kind==='equipment'?{check:'G',f:'H',critical:'I',power:'J'}:{check:'H',f:'I',critical:'J',power:'K'};
      const skill=skillFromCheck(row[columns.check]),ability=skillAbility(skill,schema);
      const f=row[columns.f]??'',critical=row[columns.critical]??'';
      if(!row.B||!skill||!ability||String(f).trim()===''||String(critical).trim()==='')continue;
      const index=abilityNames.indexOf(ability),rate=result.abilities[index].rate,dice=(data.tags||[]).includes(skill)?'SBS':'SB';
      const roll=`${dice}#${f}@${critical}<=${rate}`;
      battle.push(`${roll}　【${row.B}攻撃】AP${row.D||0}/威力:${row[columns.power]||'－'}　${skill}`);
    }
    battle.push(commandForSkill('回避','防御:物理',data,schema,'　AP1-5/能動側成功値以下で成功'));
    battle.push(commandForSkill('機知','防御:真法',data,schema,'　AP1-5/能動側成功値以下で成功'));
    const normal=['ーーー通常用ーーー'];
    for(const row of data.career||[]){
      const skill=String(row.L||'').trim();if(!row.E||!skill||['なし','自動成功'].includes(skill))continue;
      const line=commandForSkill(skill,row.E,data,schema,row.H?`　${row.H}`:'');if(line)normal.push(line);
    }
    abilityNames.forEach(name=>{
      const skills=schema.tags?.[name]||[],trained=skills.filter(skill=>(data.tags||[]).includes(skill)),untrained=skills.filter(skill=>!trained.includes(skill));
      normal.push(`SB<={${name}}*5　${name}の判定【${untrained.join('・')}】`);
      normal.push(`SBS<={${name}}*5　習熟あり${name}の判定【${trained.join('・')}】`);
    });
    return [...battle.filter(Boolean),...normal.filter(Boolean)].join('\n');
  }
  function build(data,result,schema,commands){
    const memo=[data.earthName&&`地球での氏名：${data.earthName}`,data.race&&`種族：${data.race}`,data.occupation&&`職業：${data.occupation}`,data.feature&&`特徴：${data.feature}`,data.trait&&`特性スキル：${data.trait}`,data.profileMemo&&`メモ：\n${data.profileMemo}`].filter(Boolean).join('\n');
    const color=/^#[0-9a-f]{6}$/i.test(data.characterColor||'')?data.characterColor:'#172e3c';
    return {kind:'character',data:{name:data.name||'新しいキャラクター',memo,initiative:result.ap,externalUrl:typeof location!=='undefined'?location.href:'',status:[{label:'HP',value:result.hp,max:result.hp},{label:'AP',value:result.ap,max:result.ap},{label:'装甲値',value:result.armor,max:result.armor}],params:[...abilityNames.map((label,i)=>({label,value:String(result.abilities[i].base)})),{label:'限界強度',value:String(result.intensity)},{label:'潜在カルマ',value:String(result.potential)},{label:'限界重量',value:String(result.limit)}],color,commands:commands??buildCommands(data,result,schema)}};
  }
  root.SamsaraCcfolia={buildCommands,build};if(typeof module!=='undefined')module.exports={buildCommands,build};
})(typeof window!=='undefined'?window:globalThis);
