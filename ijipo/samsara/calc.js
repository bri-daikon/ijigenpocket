(function(root){
  const n = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  function calculate(d){
    const sum=(key,col)=>(d[key]||[]).reduce((a,r)=>a+n(r[col]),0);
    const a=(d.abilities||[]).map(r=>({base:n(r.race)+n(r.growth)+n(r.mod),test:n(r.race)+n(r.growth)+n(r.mod)+n(r.check),race:n(r.race),growth:n(r.growth)}));
    while(a.length<4)a.push({base:0,test:0,race:0,growth:0});
    a.forEach(r=>{r.rate=r.base*5>=100?99:r.base*5;r.testRate=r.test*5>=100?99:r.base*5;});
    const used=a.reduce((t,r)=>t+r.race+r.growth,0)+sum('career','G')+sum('cheats','karma')+sum('magic','E');
    const potential=n(d.karma)-used,weight=sum('equipment','L')+sum('items','D'),limit=a[0].base*2+n(d.weightMod),penalty=Math.max(0,weight-limit);
    return {abilities:a,used,potential,intensity:Math.sign(potential)*Math.ceil(Math.abs(potential)/5),hp:(a[0].race+a[0].growth+a[1].base)*3+n(d.hpMod),armor:sum('equipment','K'),troops:sum('followers','D'),weight,limit,penalty,ap:a[2].base+a[3].base+n(d.apMod)-penalty};
  }
  root.SamsaraCalc={calculate}; if(typeof module!=='undefined')module.exports={calculate};
})(typeof window!=='undefined'?window:globalThis);
