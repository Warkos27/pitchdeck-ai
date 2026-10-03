import { useState, useRef, useEffect } from 'react';
import { Download, FileText, LayoutTemplate, Sparkles } from 'lucide-react';
// IMPORTAMOS EL SERVICIO DE IA REAL DE AWS BEDROCK
import { generatePitchDeckWithNova } from '../services/bedrockService';

const THEME_DATA = {
  fuchsia: {
    name: "Neón Púrpura", persona: "Disruptivo",
    bg: "bg-[#0A0A0C]", panel: "bg-[#15151A]", accent: "from-fuchsia-500 to-purple-600", textAccent: "text-fuchsia-400", border: "border-fuchsia-500/20"
  },
  ocean: {
    name: "Océano Profundo", persona: "Corporativo",
    bg: "bg-slate-950", panel: "bg-slate-900", accent: "from-blue-400 to-cyan-400", textAccent: "text-cyan-400", border: "border-cyan-500/20"
  },
  emerald: {
    name: "Eco Tech", persona: "Sustentable",
    bg: "bg-zinc-950", panel: "bg-zinc-900", accent: "from-emerald-400 to-teal-500", textAccent: "text-emerald-400", border: "border-emerald-500/20"
  }
};

const DynamicSVG = ({ themeId, seed = 1 }) => {
  const r1 = Math.abs(Math.sin(seed)) * 50 + 20;
  const r2 = Math.abs(Math.cos(seed)) * 50 + 20;
  const y1 = Math.abs(Math.sin(seed * 2)) * 100;
  const y2 = Math.abs(Math.cos(seed * 2)) * 100;

  if (themeId === 'fuchsia') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={`M0,${y1} Q${r1},${y2} 50,50 T100,${100 - y1}`} fill="none" stroke="#d946ef" strokeWidth="1.5" />
        <path d={`M0,${100 - y2} Q${r2},${y1} 50,50 T100,${y2}`} fill="none" stroke="#9333ea" strokeWidth="0.5" strokeDasharray="2 2" />
        <circle cx={r1} cy={y1} r="2" fill="#d946ef" />
      </svg>
    );
  }

  if (themeId === 'ocean') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={`M0,100 L0,${y1} Q${r1},${y2} 50,60 T100,${r2} L100,100 Z`} fill="#0ea5e9" opacity="0.2" />
        <path d={`M0,${y1 + 10} Q${r1},${y2 + 10} 50,70 T100,${r2 + 10}`} fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.5" />
      </svg>
    );
  }

  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-50" viewBox="0 0 100 100" preserveAspectRatio="none">
      <circle cx={r1} cy={y1} r={r2} fill="#34d399" opacity="0.2" />
      <circle cx={100 - r1} cy={100 - y1} r={r1 / 1.5} fill="none" stroke="#34d399" strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
};

export default function PitchForm() {
  const [formData, setFormData] = useState({ problem: '', solution: '', target: '' });
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([]);
  const [scriptText, setScriptText] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTheme, setActiveTheme] = useState('fuchsia');

  const theme = THEME_DATA[activeTheme];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (slides.length > 0) {
        if (e.key === 'ArrowRight') setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
        else if (e.key === 'ArrowLeft') setCurrentSlide((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides]);

  // SISTEMA DE EXPORTACIÓN PDF NATIVO (Sin librerías que colapsen)
  const exportToPDF = () => {
    window.print();
  };

  // DESCARGA DEL GUIÓN GENERADO POR LA IA
  const downloadScriptWord = () => {
    try {
      const scriptHTML = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Guión Pitch Deck</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; line-height: 1.8;">
          <h1 style="color: #333; text-align: center;">Guión Estratégico de Presentación</h1>
          <hr/>
          <h2>Análisis de Audiencia: ${formData.target}</h2>
          <div style="margin-top: 20px; font-size: 14pt;">
            ${scriptText.replace(/\n/g, '<br/>')}
          </div>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff', scriptHTML], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Guion_${theme.name.replace(/\s+/g, '')}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert("Error al descargar el archivo Word.");
    }
  };

  // CONEXIÓN REAL CON AWS BEDROCK (Amazon Nova Pro)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSlides([]);
    setScriptText('');
    
    try {
      // Llamada al LLM
      const aiResponse = await generatePitchDeckWithNova(formData);
      
      if (aiResponse && aiResponse.slides) {
        setSlides(aiResponse.slides);
        setScriptText(aiResponse.script || "Guión no generado. Por favor revisa los inputs.");
        setCurrentSlide(0);
      } else {
        throw new Error("El formato devuelto por la IA no es válido.");
      }
    } catch (error) {
      console.error("Error AI:", error);
      alert("Hubo un problema comunicándose con Amazon Nova Pro. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const renderSlideContent = (slide) => {
    if (!slide) return null;
    // Manejo de seguridad en caso de que la IA omita el array
    const points = slide.points || [];

    switch (slide.layout) {
      case 'center-hero':
        return (
          <div className="flex flex-col h-full items-center justify-center text-center relative px-8 py-12">
            <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30"><DynamicSVG themeId={activeTheme} seed={slide.seed} /></div>
            <div className="z-10 bg-black/80 p-12 rounded-3xl border border-white/10 w-full max-w-4xl shadow-2xl">
              <h2 className={`text-4xl md:text-6xl font-black bg-gradient-to-br ${theme.accent} bg-clip-text text-transparent mb-6 tracking-tighter leading-tight`}>
                {slide.title}
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 font-light mx-auto leading-relaxed">"{slide.subtitle}"</p>
            </div>
          </div>
        );

      case 'large-text':
        return (
          <div className="flex flex-col h-full justify-center relative px-10 py-10">
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none"><DynamicSVG themeId={activeTheme} seed={slide.seed} /></div>
            <h2 className={`text-4xl md:text-5xl font-black text-white mb-8 tracking-tight`}>{slide.title}</h2>
            <div className={`pl-6 border-l-4 ${theme.border} border-l-[color:var(--tw-gradient-from)] mb-10`}>
              <p className="text-2xl md:text-3xl text-gray-200 font-medium leading-relaxed">"{slide.subtitle}"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 z-10">
              {points.map((p, i) => (
                <div key={i} className="bg-black/60 p-6 rounded-xl border border-white/10 text-gray-300 leading-relaxed shadow-lg h-auto">
                  {p}
                </div>
              ))}
            </div>
          </div>
        );

      case 'split':
        return (
          <div className="flex flex-col md:flex-row gap-8 h-full items-center px-6 py-10">
            <div className="w-full md:w-[55%] z-10">
              <h2 className={`text-4xl md:text-5xl font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent leading-tight mb-6 tracking-tight`}>
                {slide.title}
              </h2>
              <p className="text-xl text-gray-300 font-light mb-8 italic leading-relaxed">"{slide.subtitle}"</p>
              <ul className="space-y-4">
                {points.map((p, i) => (
                  <li key={i} className="flex items-start gap-4 text-gray-300 leading-relaxed bg-black/40 p-5 rounded-xl border border-white/10 shadow-md">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 bg-gradient-to-r ${theme.accent}`}></div>
                    <span className="flex-1">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`w-full md:w-[45%] h-64 md:h-[90%] rounded-3xl overflow-hidden relative shadow-2xl border border-white/10 bg-[#111] flex items-center justify-center`}>
              <DynamicSVG themeId={activeTheme} seed={slide.seed} />
            </div>
          </div>
        );
      
      case 'grid':
        return (
          <div className="flex flex-col h-full justify-center px-8 py-10 relative">
             <div className="absolute bottom-0 left-0 w-64 h-64 opacity-20 pointer-events-none rotate-180"><DynamicSVG themeId={activeTheme} seed={slide.seed} /></div>
             <h2 className={`text-4xl md:text-5xl font-black text-white mb-4 tracking-tight z-10`}>{slide.title}</h2>
             <p className="text-xl text-gray-400 mb-8 italic z-10">"{slide.subtitle}"</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 z-10 w-full">
               {points.map((p, i) => (
                 <div key={i} className={`p-6 md:p-8 rounded-2xl border border-white/10 bg-black/60 shadow-xl h-auto flex flex-col`}>
                   <div className="flex items-center gap-4 mb-3">
                     <span className={`text-3xl font-black ${theme.textAccent} opacity-50 block`}>0{i+1}</span>
                     <div className={`h-1 flex-1 bg-gradient-to-r ${theme.accent} opacity-20 rounded-full`}></div>
                   </div>
                   <p className="text-base text-gray-200 leading-relaxed">{p}</p>
                 </div>
               ))}
             </div>
          </div>
        );

      case 'big-stat':
        return (
          <div className="flex flex-col h-full justify-center text-center px-10 py-10 relative">
             <div className="absolute inset-0 z-0 opacity-10 flex justify-center"><DynamicSVG themeId={activeTheme} seed={slide.seed} /></div>
             <div className="z-10 bg-black/60 p-10 md:p-12 rounded-3xl border border-white/10 inline-block w-full max-w-4xl mx-auto">
               <h2 className={`text-3xl md:text-4xl font-black text-white mb-4`}>{slide.title}</h2>
               <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">"{slide.subtitle}"</p>
               <div className="mb-10">
                 <div className={`text-[80px] md:text-[120px] leading-none font-black bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent tracking-tighter`}>
                   {slide.stat || "X%"}
                 </div>
                 <p className={`text-base tracking-widest uppercase mt-4 font-bold ${theme.textAccent}`}>{slide.statSubtitle}</p>
               </div>
               <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-10">
                 {points.map((p, i) => (
                   <div key={i} className="w-full md:w-1/2 text-sm md:text-base text-gray-300 border-t border-white/20 pt-6 font-medium leading-relaxed">{p}</div>
                 ))}
               </div>
             </div>
          </div>
        );

      case 'cards':
      default:
        return (
          <div className="flex flex-col h-full justify-center px-10 py-10 relative">
            <h2 className={`text-4xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight z-10`}>{slide.title}</h2>
            <p className="text-xl text-gray-400 mb-8 italic z-10">"{slide.subtitle}"</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 z-10">
              {points.map((point, idx) => (
                <div key={idx} className={`bg-black/60 border border-white/10 p-6 md:p-8 rounded-2xl h-auto flex flex-col shadow-lg`}>
                  <div className={`w-10 h-1.5 rounded-full bg-gradient-to-r ${theme.accent} mb-6 opacity-80`}></div>
                  <p className="text-base text-gray-300 leading-relaxed flex-1">{point}</p>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #slide-deck-container, #slide-deck-container * { visibility: visible; }
          #slide-deck-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
            height: 100vh;
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 2rem;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className={`min-h-[calc(100vh-72px)] ${theme.bg} text-white font-sans transition-colors duration-500 flex flex-col lg:flex-row overflow-hidden`}>
        
        {/* PANEL IZQUIERDO */}
        <div className="no-print w-full lg:w-[420px] flex flex-col border-r border-white/5 bg-black/20 z-20 h-auto lg:h-[calc(100vh-72px)] shadow-2xl shrink-0">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-4 flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4" /> Temática Visual
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(THEME_DATA).map(key => (
                <button key={key} type="button" onClick={() => setActiveTheme(key)}
                  className={`py-4 px-2 rounded-xl text-[11px] font-bold border transition-all flex flex-col items-center gap-3
                    ${activeTheme === key ? `border-white/20 bg-white/10 ${THEME_DATA[key].textAccent} shadow-lg scale-105` : 'border-transparent text-gray-500 hover:bg-white/5 hover:scale-105'}`}>
                  <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${THEME_DATA[key].accent} shadow-inner`}></div>
                  <span className="truncate w-full text-center leading-tight">{THEME_DATA[key].name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Problema Central</label>
                <textarea required rows="3" className={`w-full p-4 ${theme.panel} border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/20 resize-none`}
                  onChange={(e) => setFormData({...formData, problem: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Tu Solución</label>
                <textarea required rows="3" className={`w-full p-4 ${theme.panel} border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/20 resize-none`}
                  onChange={(e) => setFormData({...formData, solution: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">¿Quién es tu Mercado?</label>
                <input type="text" required className={`w-full p-4 ${theme.panel} border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/20`}
                  onChange={(e) => setFormData({...formData, target: e.target.value})} />
              </div>
              
              <button type="submit" disabled={loading} className={`w-full p-5 mt-2 rounded-xl font-bold text-sm bg-gradient-to-r ${theme.accent} hover:opacity-90 disabled:opacity-50 text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}>
                <Sparkles className="w-5 h-5" />
                {loading ? "Amazon Nova Analizando..." : "Generar Deck con IA"}
              </button>
            </form>
          </div>
        </div>

        {/* PANEL DERECHO */}
        <div className="flex-1 p-4 lg:p-10 flex flex-col items-center justify-start lg:justify-center bg-black/30 relative overflow-y-auto overflow-x-hidden">
          
          {!slides.length && !loading && (
            <div className="no-print text-center text-gray-500 z-10 flex flex-col items-center mt-20 lg:mt-0">
              <div className={`w-24 h-24 rounded-full border-4 border-dashed border-white/10 flex items-center justify-center mb-6`}>
                 <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.accent} opacity-50 blur-md`}></div>
              </div>
              <p className="text-2xl font-bold text-gray-300">Motor de Inteligencia Activo</p>
              <p className="text-base mt-4 text-gray-500 max-w-md mx-auto leading-relaxed">Conectado a AWS Bedrock (Amazon Nova Pro). Completa el formulario para estructurar tu negocio.</p>
            </div>
          )}

          {loading && (
            <div className="no-print flex flex-col items-center gap-8 z-10 mt-20 lg:mt-0">
               <div className={`w-16 h-16 border-4 ${theme.border} border-t-white rounded-full animate-spin`}></div>
               <div className="text-center">
                 <p className={`text-xl font-black tracking-widest uppercase ${theme.textAccent}`}>Llamando a Amazon Nova</p>
                 <p className="text-sm text-gray-400 mt-2">Razonando y estructurando en JSON...</p>
               </div>
            </div>
          )}

          {slides.length > 0 && !loading && (
            <div className="w-full max-w-6xl flex flex-col items-center mt-4">
              
              <div className="no-print w-full flex flex-col sm:flex-row justify-end gap-4 mb-6 z-40">
                <button type="button" onClick={downloadScriptWord} className="flex items-center justify-center gap-2 text-sm font-bold bg-[#1A1A24] border border-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/10 transition-colors shadow-lg cursor-pointer">
                  <FileText className="w-4 h-4" /> Descargar Guión IA
                </button>
                <button type="button" onClick={exportToPDF} className="flex items-center justify-center gap-2 text-sm font-bold bg-white text-black px-6 py-3 rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer">
                  <Download className="w-4 h-4" /> Imprimir / Guardar PDF
                </button>
              </div>

              <div id="slide-deck-container" className={`w-full min-h-[600px] lg:aspect-[16/9] ${theme.panel} rounded-2xl shadow-[0_0_60px_rgba(0,0,0,0.6)] border border-white/10 flex flex-col p-6 lg:p-14 relative overflow-hidden transition-colors`}>
                <div className="flex justify-between items-start relative z-20 shrink-0 mb-4 lg:mb-2">
                  <span className={`text-xs lg:text-sm tracking-widest uppercase font-black ${theme.textAccent}`}>{theme.name} | Deck Comercial</span>
                  <span className="text-5xl lg:text-7xl font-black text-white/5 tracking-tighter">0{currentSlide + 1}/0{slides.length}</span>
                </div>
                <div className="flex-1 relative z-10">
                  {renderSlideContent(slides[currentSlide])}
                </div>
              </div>

              <div className="no-print flex justify-between items-center w-full mt-8 z-50 px-2 lg:px-4 pb-10">
                <button type="button" onClick={() => setCurrentSlide(prev => Math.max(prev - 1, 0))} disabled={currentSlide === 0}
                  className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition cursor-pointer border border-white/10 shadow-lg text-xl lg:text-2xl">
                  ←
                </button>
                <div className="flex gap-2 lg:gap-4 bg-black/40 px-6 py-3 lg:px-8 lg:py-4 rounded-full border border-white/5 shadow-inner">
                  {slides.map((_, idx) => (
                    <div key={idx} className={`h-2 lg:h-2.5 rounded-full transition-all duration-500 ${idx === currentSlide ? `w-10 lg:w-14 bg-gradient-to-r ${theme.accent}` : 'w-2 lg:w-3 bg-white/20'}`} />
                  ))}
                </div>
                <button type="button" onClick={() => setCurrentSlide(prev => Math.min(prev + 1, slides.length - 1))} disabled={currentSlide === slides.length - 1}
                  className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 transition cursor-pointer border border-white/10 shadow-lg text-xl lg:text-2xl">
                  →
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}