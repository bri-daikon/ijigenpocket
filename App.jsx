import React, { useState, useRef, useEffect } from 'react';
import { Camera, Type, Image as ImageIcon, Download, Trash2, Layers, Monitor, Palette, Star, UserCircle, Layout, Move, Activity, ClipboardList, RefreshCw, AlertCircle, Sparkles, Settings2, ImagePlus, Maximize2, Type as TypeIcon, Info, Smile, Plus, X } from 'lucide-react';

const App = () => {
  // システム設定 (6th, 7th, other)
  const [edition, setEdition] = useState('7th'); 

  // 画像状態
  const [charImage, setCharImage] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);
  const [faceImages, setFaceImages] = useState([null, null, null]);
  
  // テキスト状態
  const [mainText, setMainText] = useState('CHARACTER NAME');
  const [subText, setSubText] = useState('HAND OUT');
  const [systemName, setSystemName] = useState('SYSTEM NAME');
  const [scenarioTitle, setScenarioTitle] = useState('SINARIO TITLE');
  
  // スタイル状態
  const [mainColor, setMainColor] = useState('#ffffff');
  const [subColor, setSubColor] = useState('#94a3b8');
  const [systemColor, setSystemColor] = useState('#fbbf24');
  const [scenarioColor, setScenarioColor] = useState('#ffffff');
  const [outlineColor, setOutlineColor] = useState('#000000');
  const [outlineWidth, setOutlineWidth] = useState(6);
  const [isSerif, setIsSerif] = useState(false);

  // フォントサイズ設定
  const [mainFontSize, setMainFontSize] = useState(80);
  const [subFontSize, setSubFontSize] = useState(30);
  const [systemFontSize, setSystemFontSize] = useState(30);
  const [scenarioFontSize, setScenarioFontSize] = useState(60);

  // ステータス・インポート状態
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState(null);
  const [stats, setStats] = useState({
    'STR': 50, 'CON': 50, 'POW': 50, 'DEX': 50, 'APP': 50, 'SIZ': 50
  });
  const [newStatName, setNewStatName] = useState('');

  // レーダーチャート状態
  const [showChart, setShowChart] = useState(true);
  const [chartColor, setChartColor] = useState('#6366f1');
  const [chartBgOpacity, setChartBgOpacity] = useState(0.4);
  const [chartPos, setChartPos] = useState({ x: 80, y: 45 });
  const [chartScale, setChartScale] = useState(1.0);

  // 配置・スケール管理
  const [imgPosition, setImgPosition] = useState({ x: 25, y: 45 });
  const [imgScale, setImgScale] = useState(0.75);
  const [bgScale, setBgScale] = useState(1.0); 
  const [logoPos, setLogoPos] = useState({ x: 75, y: 15 });
  const [logoScale, setLogoScale] = useState(1.0);
  const [systemPos, setSystemPos] = useState({ x: 75, y: 10 });
  const [scenarioPos, setScenarioPos] = useState({ x: 75, y: 22 });
  const [mainTextPos, setMainTextPos] = useState({ x: 75, y: 80 });
  const [subTextPos, setSubTextPos] = useState({ x: 75, y: 70 });
  const [faceConfigs, setFaceConfigs] = useState([
    { x: 55, y: 45, scale: 0.4 },
    { x: 75, y: 45, scale: 0.4 },
    { x: 95, y: 45, scale: 0.4 }
  ]);

  // ドラッグ操作用の状態
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState(null); 
  const canvasRef = useRef(null);
  const imgCache = useRef({});

  const EXCLUDED_PARAMS = ['HP', 'MP', 'SAN', 'ＨＰ', 'ＭＰ', 'サン', '正気度', '耐久力', 'マジックポイント', '移動', 'MOV', 'DB', 'ビルド'];

  const handleCcfoliaImport = () => {
    setImportError(null);
    if (!importText.trim()) return;
    try {
      let data = {};
      let name = "";
      let maxValueFound = 0;
      const isExcluded = (label) => EXCLUDED_PARAMS.some(excluded => label.toUpperCase() === excluded.toUpperCase());
      
      if (importText.trim().startsWith('{')) {
        const json = JSON.parse(importText);
        const charData = json.data || json;
        name = charData.name || "";
        if (charData.status) {
          charData.status.forEach(s => {
            if (s.label && s.value !== undefined && !isExcluded(s.label)) {
              const val = Number(s.value);
              data[s.label] = val;
              if (val > maxValueFound) maxValueFound = val;
            }
          });
        }
        if (charData.params) {
          charData.params.forEach(p => {
            if (p.label && p.value !== undefined && !isExcluded(p.label)) {
              const val = Number(p.value);
              data[p.label] = val;
              if (val > maxValueFound) maxValueFound = val;
            }
          });
        }
      } else {
        const lines = importText.split(/[\n\s,]/);
        lines.forEach(line => {
          const match = line.match(/([^\d\s:：/]+)[:：\s]*(\d+)/);
          if (match) {
            const label = match[1];
            if (!isExcluded(label)) {
              const val = Number(match[2]);
              data[label] = val;
              if (val > maxValueFound) maxValueFound = val;
            }
          }
        });
        const firstLine = importText.split('\n')[0];
        if (!firstLine.includes(':') && firstLine.length < 20) name = firstLine;
      }
      
      if (Object.keys(data).length > 0) {
        setStats(data);
        if (name) setMainText(name);
        // CoC自動判別
        if (edition !== 'other') {
          setEdition(maxValueFound > 25 ? '7th' : '6th');
        }
        setImportText(''); 
      } else throw new Error("数値データが見つかりませんでした。");
    } catch (e) {
      setImportError("解析に失敗しました。形式を確認してください。");
    }
  };

  const addStat = () => {
    if (!newStatName.trim()) return;
    if (stats[newStatName]) return;
    setStats({ ...stats, [newStatName]: 0 });
    setNewStatName('');
  };

  const removeStat = (key) => {
    const newStats = { ...stats };
    delete newStats[key];
    setStats(newStats);
  };

  const updateStat = (key, val) => {
    setStats({ ...stats, [key]: parseInt(val) || 0 });
  };

  const applyLayout = (type) => {
    switch(type) {
      case 'standard':
        setImgPosition({ x: 25, y: 45 }); setImgScale(0.75);
        setLogoPos({ x: 75, y: 15 }); setLogoScale(1.0);
        setSystemPos({ x: 75, y: 10 }); setScenarioPos({ x: 75, y: 22 });
        setMainTextPos({ x: 75, y: 80 }); setSubTextPos({ x: 75, y: 70 });
        setChartPos({ x: 80, y: 43 });
        setFaceConfigs([{ x: 55, y: 45, scale: 0.4 }, { x: 75, y: 45, scale: 0.4 }, { x: 95, y: 45, scale: 0.4 }]);
        break;
      case 'hero':
        setImgPosition({ x: 50, y: 50 }); setImgScale(1.1);
        setLogoPos({ x: 50, y: 15 }); setLogoScale(1.0);
        setSystemPos({ x: 50, y: 7 }); setScenarioPos({ x: 50, y: 20 });
        setMainTextPos({ x: 50, y: 85 }); setSubTextPos({ x: 50, y: 77 });
        setChartPos({ x: 15, y: 15 });
        setFaceConfigs([{ x: 10, y: 85, scale: 0.2 }, { x: 25, y: 85, scale: 0.2 }, { x: 40, y: 85, scale: 0.2 }]);
        break;
      default: break;
    }
  };

  const handleUpload = (e, setter, key) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setter(event.target.result);
        delete imgCache.current[key];
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaceUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newFaces = [...faceImages];
        newFaces[index] = event.target.result;
        setFaceImages(newFaces);
        delete imgCache.current[`face${index}`];
      };
      reader.readAsDataURL(file);
    }
  };

  const loadImage = (key, src) => {
    if (imgCache.current[key] && imgCache.current[key].src === src) return Promise.resolve(imgCache.current[key].img);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        imgCache.current[key] = { img, src };
        resolve(img);
      };
      img.src = src;
    });
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    let hit = null;
    if (Math.abs(x - mainTextPos.x) < 20 && Math.abs(y - mainTextPos.y) < 5) hit = 'mainText';
    else if (Math.abs(x - subTextPos.x) < 15 && Math.abs(y - subTextPos.y) < 3) hit = 'subText';
    else if (Math.abs(x - systemPos.x) < 15 && Math.abs(y - systemPos.y) < 3) hit = 'systemText';
    else if (Math.abs(x - scenarioPos.x) < 20 && Math.abs(y - scenarioPos.y) < 5) hit = 'scenarioText';
    else if (showChart && Math.abs(x - chartPos.x) < 15 && Math.abs(y - chartPos.y) < 15) hit = 'chart';
    else {
      faceConfigs.forEach((f, i) => { if (Math.abs(x - f.x) < 8 && Math.abs(y - f.y) < 8) hit = `face${i}`; });
    }
    if (!hit && Math.abs(x - logoPos.x) < 15 && Math.abs(y - logoPos.y) < 10) hit = 'logo';
    if (!hit && Math.abs(x - imgPosition.x) < 15 && Math.abs(y - imgPosition.y) < 30) hit = 'char';
    if (hit) { setIsDragging(true); setDragTarget(hit); }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragTarget) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    if (dragTarget === 'char') setImgPosition({ x, y });
    else if (dragTarget === 'logo') setLogoPos({ x, y });
    else if (dragTarget === 'systemText') setSystemPos({ x, y });
    else if (dragTarget === 'scenarioText') setScenarioPos({ x, y });
    else if (dragTarget === 'mainText') setMainTextPos({ x, y });
    else if (dragTarget === 'subText') setSubTextPos({ x, y });
    else if (dragTarget === 'chart') setChartPos({ x, y });
    else if (dragTarget.startsWith('face')) {
      const index = parseInt(dragTarget.replace('face', ''));
      const newConfigs = [...faceConfigs];
      newConfigs[index] = { ...newConfigs[index], x, y };
      setFaceConfigs(newConfigs);
    }
  };

  const handleMouseUp = () => { setIsDragging(false); setDragTarget(null); };

  const drawRadarChart = (ctx, centerX, centerY, radius, data, color, bgOpacity) => {
    const keys = Object.keys(data);
    if (keys.length < 3) return;
    const numPoints = keys.length;
    const angleStep = (Math.PI * 2) / numPoints;
    
    // スケールの決定
    let maxValue = 100;
    if (edition === '6th') maxValue = 25;
    else if (edition === '7th') maxValue = 110;
    else {
      // Otherの場合、データ内の最大値に基づいて動的に決定
      const currentMax = Math.max(...Object.values(data), 5);
      maxValue = Math.ceil(currentMax / 5) * 5;
    }

    // Background circle/polygon
    ctx.beginPath();
    for (let j = 0; j < numPoints; j++) {
      const x = centerX + radius * Math.cos(j * angleStep - Math.PI / 2);
      const y = centerY + radius * Math.sin(j * angleStep - Math.PI / 2);
      if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(0, 0, 0, ${bgOpacity})`;
    ctx.fill();

    // Grid lines
    ctx.beginPath();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const r = (radius / 4) * i;
      for (let j = 0; j < numPoints; j++) {
        const x = centerX + r * Math.cos(j * angleStep - Math.PI / 2);
        const y = centerY + r * Math.sin(j * angleStep - Math.PI / 2);
        if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Labels
    ctx.font = 'bold 12px sans-serif';
    ctx.fillStyle = '#cbd5e1';
    ctx.textAlign = 'center';
    keys.forEach((key, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      const labelX = centerX + (radius + 20) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      ctx.fillText(`${key} (${data[key]})`, labelX, labelY);
    });

    // Data polygon
    ctx.beginPath();
    keys.forEach((key, i) => {
      const val = Math.min(maxValue, Math.max(0, data[key])) / maxValue;
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * val * Math.cos(angle);
      const y = centerY + radius * val * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = color + '66';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const draw = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;

    if (bgImage) {
      try {
        const bgImg = await loadImage('bg', bgImage);
        const baseScale = Math.max(width / bgImg.width, height / bgImg.height);
        const finalScale = baseScale * bgScale;
        ctx.drawImage(bgImg, (width - bgImg.width * finalScale) / 2, (height - bgImg.height * finalScale) / 2, bgImg.width * finalScale, bgImg.height * finalScale);
      } catch (e) {}
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1e293b'); grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    if (charImage) {
      try {
        const img = await loadImage('char', charImage);
        const iw = img.width * imgScale;
        const ih = img.height * imgScale;
        ctx.drawImage(img, (width * imgPosition.x / 100) - iw / 2, (height * imgPosition.y / 100) - ih / 2, iw, ih);
      } catch (e) {}
    }

    for (let i = 0; i < faceImages.length; i++) {
      if (faceImages[i]) {
        try {
          const fImg = await loadImage(`face${i}`, faceImages[i]);
          const config = faceConfigs[i];
          const fw = fImg.width * config.scale;
          const fh = fImg.height * config.scale;
          ctx.drawImage(fImg, (width * config.x / 100) - fw / 2, (height * config.y / 100) - fh / 2, fw, fh);
        } catch (e) {}
      }
    }

    if (showChart) drawRadarChart(ctx, width * chartPos.x / 100, height * chartPos.y / 100, 100 * chartScale, stats, chartColor, chartBgOpacity);

    const fontStack = isSerif ? 'serif' : 'sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.strokeStyle = outlineColor; ctx.lineWidth = outlineWidth;

    if (logoImage) {
      try {
        const lImg = await loadImage('logo', logoImage);
        const lw = lImg.width * logoScale;
        const lh = lImg.height * logoScale;
        ctx.drawImage(lImg, (width * logoPos.x / 100) - lw / 2, (height * logoPos.y / 100) - lh / 2, lw, lh);
      } catch (e) {}
    } else {
      if (systemName) {
        ctx.font = `bold ${systemFontSize * logoScale}px ${fontStack}`;
        const sx = width * systemPos.x / 100;
        const sy = height * systemPos.y / 100;
        if (outlineWidth > 0) ctx.strokeText(systemName, sx, sy);
        ctx.fillStyle = systemColor; ctx.fillText(systemName, sx, sy);
      }
      if (scenarioTitle) {
        ctx.font = `bold ${scenarioFontSize * logoScale}px ${fontStack}`;
        const scx = width * scenarioPos.x / 100;
        const scy = height * scenarioPos.y / 100;
        if (outlineWidth > 0) ctx.strokeText(scenarioTitle, scx, scy);
        ctx.fillStyle = scenarioColor; ctx.fillText(scenarioTitle, scx, scy);
      }
    }

    ctx.font = `italic ${subFontSize}px ${fontStack}`;
    if (outlineWidth > 0) ctx.strokeText(subText, width * subTextPos.x / 100, height * subTextPos.y / 100);
    ctx.fillStyle = subColor; ctx.fillText(subText, width * subTextPos.x / 100, height * subTextPos.y / 100);

    ctx.font = `bold ${mainFontSize}px ${fontStack}`;
    if (outlineWidth > 0) ctx.strokeText(mainText, width * mainTextPos.x / 100, height * mainTextPos.y / 100);
    ctx.fillStyle = mainColor; ctx.fillText(mainText, width * mainTextPos.x / 100, height * mainTextPos.y / 100);
  };

  useEffect(() => {
    draw();
  }, [charImage, bgImage, bgScale, logoImage, faceImages, mainText, subText, systemName, scenarioTitle, mainTextPos, subTextPos, systemPos, scenarioPos, logoPos, imgPosition, imgScale, logoScale, faceConfigs, isSerif, mainColor, subColor, systemColor, scenarioColor, outlineColor, outlineWidth, stats, showChart, chartPos, chartScale, chartColor, chartBgOpacity, edition, mainFontSize, subFontSize, systemFontSize, scenarioFontSize]);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-sans select-none" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* 左側：プレビュー領域 */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex bg-slate-900 p-2 rounded-xl border border-white/5 gap-2 overflow-x-auto">
            {['standard', 'hero'].map(id => (
              <button key={id} onClick={() => applyLayout(id)} className="flex-1 min-w-[120px] bg-slate-800 hover:bg-indigo-900/40 p-3 rounded-lg border border-white/5 transition flex flex-col items-center gap-1 active:scale-95 capitalize">
                <Layout size={18} className="text-indigo-400" />
                <span className="text-xs font-bold">{id} Layout</span>
              </button>
            ))}
          </div>

          <div className={`bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-white/5 aspect-video flex items-center justify-center relative ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}>
            <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} className="max-w-full max-h-full object-contain" />
          </div>
          
          <button onClick={() => {
            const link = document.createElement('a');
            link.download = 'character-banner.png';
            link.href = canvasRef.current.toDataURL('image/png');
            link.click();
          }} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 py-4 rounded-xl flex items-center justify-center gap-2 font-bold hover:brightness-110 shadow-xl text-lg transition-all active:scale-[0.98]">
            <Download size={24} /> バナーを保存
          </button>
        </div>

        {/* 右側：コントロールパネル */}
        <div className="xl:col-span-4 space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-white/5 h-fit overflow-y-auto max-h-[90vh] custom-scrollbar">
          
          {/* システム設定 */}
          <section className="space-y-4">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <Settings2 size={14} /> System Setting
            </h3>
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button onClick={() => setEdition('6th')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${edition === '6th' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>CoC 6th</button>
              <button onClick={() => setEdition('7th')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${edition === '7th' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>CoC 7th</button>
              <button onClick={() => setEdition('other')} className={`flex-1 py-2 text-xs font-bold rounded-md transition ${edition === 'other' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Other</button>
            </div>
          </section>

          {/* テキスト編集セクション */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} /> Text Info
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2 bg-slate-950/40 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-emerald-500 font-bold uppercase block">Character Name</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{mainFontSize}px</span>
                    <input type="color" value={mainColor} onChange={(e) => setMainColor(e.target.value)} className="h-5 w-8 bg-transparent cursor-pointer rounded overflow-hidden" />
                  </div>
                </div>
                <input value={mainText} onChange={(e) => setMainText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-emerald-500 transition-colors" />
                <input type="range" min="20" max="200" value={mainFontSize} onChange={(e) => setMainFontSize(parseInt(e.target.value))} className="w-full accent-emerald-500" />
              </div>

              <div className="space-y-2 bg-slate-950/40 p-3 rounded-lg border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block">Role / Title</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{subFontSize}px</span>
                    <input type="color" value={subColor} onChange={(e) => setSubColor(e.target.value)} className="h-5 w-8 bg-transparent cursor-pointer rounded overflow-hidden" />
                  </div>
                </div>
                <input value={subText} onChange={(e) => setSubText(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-emerald-500 transition-colors" />
                <input type="range" min="10" max="100" value={subFontSize} onChange={(e) => setSubFontSize(parseInt(e.target.value))} className="w-full accent-slate-500" />
              </div>

              {!logoImage && (
                <>
                  <div className="space-y-2 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-amber-500 font-bold uppercase block">System Name</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{systemFontSize}px</span>
                        <input type="color" value={systemColor} onChange={(e) => setSystemColor(e.target.value)} className="h-5 w-8 bg-transparent cursor-pointer rounded overflow-hidden" />
                      </div>
                    </div>
                    <input value={systemName} onChange={(e) => setSystemName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-amber-500 transition-colors" />
                    <input type="range" min="10" max="100" value={systemFontSize} onChange={(e) => setSystemFontSize(parseInt(e.target.value))} className="w-full accent-amber-500" />
                  </div>
                  
                  <div className="space-y-2 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-blue-400 font-bold uppercase block">Scenario Title</label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">{scenarioFontSize}px</span>
                        <input type="color" value={scenarioColor} onChange={(e) => setScenarioColor(e.target.value)} className="h-5 w-8 bg-transparent cursor-pointer rounded overflow-hidden" />
                      </div>
                    </div>
                    <input value={scenarioTitle} onChange={(e) => setScenarioTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs outline-none focus:border-blue-500 transition-colors" />
                    <input type="range" min="10" max="150" value={scenarioFontSize} onChange={(e) => setScenarioFontSize(parseInt(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setIsSerif(!isSerif)} className={`flex-1 py-2 rounded text-[10px] font-bold border transition ${isSerif ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                {isSerif ? 'フォント：明朝体' : 'フォント：ゴシック体'}
              </button>
              <div className="flex-1 flex items-center bg-slate-800 px-2 rounded border border-slate-700">
                <span className="text-[10px] font-bold text-slate-500 mr-2">縁</span>
                <input type="range" min="0" max="15" value={outlineWidth} onChange={(e) => setOutlineWidth(parseInt(e.target.value))} className="flex-1 accent-indigo-500" />
              </div>
            </div>
          </section>

          {/* 画像アップロード & 表情差分 */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Camera size={14} /> Images & Size
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col items-center py-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition border border-white/5">
                <UserCircle size={20} className="mb-1 text-indigo-400" />
                <span className="text-[10px] font-bold">全身立ち絵</span>
                <input type='file' className="hidden" onChange={(e) => handleUpload(e, setCharImage, 'char')} accept="image/*" />
              </label>
              <label className="flex flex-col items-center py-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition border border-white/5">
                <ImagePlus size={20} className="mb-1 text-sky-400" />
                <span className="text-[10px] font-bold">背景画像</span>
                <input type='file' className="hidden" onChange={(e) => handleUpload(e, setBgImage, 'bg')} accept="image/*" />
              </label>
              <label className="flex flex-col items-center py-3 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition border border-white/5">
                <Star size={20} className="mb-1 text-amber-400" />
                <span className="text-[10px] font-bold">ロゴ画像</span>
                <input type='file' className="hidden" onChange={(e) => handleUpload(e, setLogoImage, 'logo')} accept="image/*" />
              </label>
              <button onClick={() => {setLogoImage(null);}} className="flex flex-col items-center py-3 bg-slate-800 rounded-lg hover:bg-red-900/20 transition border border-white/5 group">
                <Trash2 size={20} className="mb-1 text-slate-500 group-hover:text-red-400" />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-300">ロゴ解除</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <Smile size={14} className="text-pink-400" />
                <span className="text-[10px] font-black uppercase text-pink-400 tracking-tighter">Face Variants</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map(i => (
                  <label key={i} className={`flex flex-col items-center justify-center aspect-square rounded-lg cursor-pointer transition border-2 border-dashed ${faceImages[i] ? 'bg-pink-500/10 border-pink-500/40' : 'bg-slate-900 border-slate-800 hover:border-pink-500/50'}`}>
                    {faceImages[i] ? (
                      <div className="relative w-full h-full p-1">
                         <img src={faceImages[i]} className="w-full h-full object-cover rounded" alt={`Face ${i}`} />
                         <button onClick={(e) => {
                           e.preventDefault();
                           const newFaces = [...faceImages];
                           newFaces[i] = null;
                           setFaceImages(newFaces);
                         }} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 shadow-lg">
                           <Trash2 size={10} />
                         </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon size={16} className="text-slate-600" />
                        <span className="text-[8px] font-bold text-slate-600 mt-1">Slot {i+1}</span>
                      </div>
                    )}
                    <input type='file' className="hidden" onChange={(e) => handleFaceUpload(e, i)} accept="image/*" />
                  </label>
                ))}
              </div>
              <div className="space-y-1 mt-2">
                <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase"><span>Face Scale</span><span>{(faceConfigs[0].scale * 100).toFixed(0)}%</span></div>
                <input type="range" min="0.1" max="1.5" step="0.01" value={faceConfigs[0].scale} onChange={(e) => {
                  const s = parseFloat(e.target.value);
                  setFaceConfigs(faceConfigs.map(f => ({...f, scale: s})));
                }} className="w-full h-1 accent-pink-500" />
              </div>
            </div>
            
            <div className="space-y-3 mt-2 bg-slate-950/50 p-3 rounded-xl border border-white/5">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-indigo-300 font-bold uppercase"><span>Character Scale</span><span>{(imgScale * 100).toFixed(0)}%</span></div>
                <input type="range" min="0.1" max="2.0" step="0.01" value={imgScale} onChange={(e) => setImgScale(parseFloat(e.target.value))} className="w-full accent-indigo-500" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-sky-300 font-bold uppercase"><span>Background Scale</span><span>{(bgScale * 100).toFixed(0)}%</span></div>
                <input type="range" min="1.0" max="3.0" step="0.01" value={bgScale} onChange={(e) => setBgScale(parseFloat(e.target.value))} className="w-full accent-sky-500" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-amber-300 font-bold uppercase"><span>Logo Scale</span><span>{(logoScale * 100).toFixed(0)}%</span></div>
                <input type="range" min="0.1" max="2.0" step="0.01" value={logoScale} onChange={(e) => setLogoScale(parseFloat(e.target.value))} className="w-full accent-amber-500" />
              </div>
            </div>
          </section>

          {/* パラメータ編集セクション */}
          <section className="space-y-3 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList size={14} /> Stats & Parameters
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input 
                  value={newStatName} 
                  onChange={(e) => setNewStatName(e.target.value)} 
                  placeholder="項目名 (例: 幸運, 筋力)" 
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs outline-none focus:border-rose-500"
                  onKeyDown={(e) => e.key === 'Enter' && addStat()}
                />
                <button onClick={addStat} className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs transition border border-white/5">
                  <Plus size={14} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border-t border-white/5 pt-2">
                {Object.keys(stats).map(key => (
                  <div key={key} className="flex flex-col bg-slate-800 p-2 rounded relative group border border-white/5">
                    <button onClick={() => removeStat(key)} className="absolute -top-1 -right-1 bg-slate-900 text-slate-500 hover:text-red-400 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={10} />
                    </button>
                    <span className="text-[10px] text-slate-500 truncate pr-1 mb-1">{key}</span>
                    <input type="number" value={stats[key]} onChange={(e) => updateStat(key, e.target.value)} className="bg-transparent text-xs font-bold outline-none border-b border-transparent focus:border-rose-500" />
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1"><Sparkles size={10} /> Quick Import</span>
                  <button onClick={() => setImportText('')} className="text-[10px] text-slate-600 hover:text-slate-400">Clear</button>
                </div>
                <div className="relative">
                  <textarea value={importText} placeholder="ココフォリアの駒データを貼り付け" onChange={(e) => setImportText(e.target.value)} className={`w-full h-20 bg-slate-950 border ${importError ? 'border-red-500' : 'border-slate-800'} rounded-lg p-3 text-[10px] focus:border-rose-500 outline-none transition-colors resize-none custom-scrollbar`} />
                  <button onClick={handleCcfoliaImport} className="absolute bottom-2 right-2 bg-rose-600 hover:bg-rose-500 px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-lg transition active:scale-95">
                    解析して反映
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* チャート設定セクション */}
          <section className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
              <Activity size={14} /> Chart Setting
            </h3>
            
            <div className="space-y-4 bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showChart} onChange={(e) => setShowChart(e.target.checked)} className="accent-blue-500" />
                  <span className="text-xs font-bold">表示する</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Color</span>
                  <input type="color" value={chartColor} onChange={(e) => setChartColor(e.target.value)} className="h-6 w-10 bg-transparent cursor-pointer rounded border border-white/10" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-blue-300 font-bold uppercase">
                  <span>Chart Size</span>
                  <span>{(chartScale * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0.5" max="2.5" step="0.05" value={chartScale} onChange={(e) => setChartScale(parseFloat(e.target.value))} className="w-full accent-blue-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                  <span>Bg Opacity</span>
                  <span>{(chartBgOpacity * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min="0.0" max="1.0" step="0.05" value={chartBgOpacity} onChange={(e) => setChartBgOpacity(parseFloat(e.target.value))} className="w-full accent-slate-600" />
              </div>
            </div>
          </section>

          <button onClick={() => {if(window.confirm('すべてリセットされます。よろしいですか？')) window.location.reload();}} className="w-full py-4 text-slate-600 hover:text-red-400 text-[10px] font-black uppercase flex items-center justify-center gap-1 transition tracking-widest border border-white/5 rounded-lg active:bg-red-950/20">
            <Trash2 size={12} /> Canvas をリセット
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
