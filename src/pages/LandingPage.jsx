import { useState, useEffect, useRef } from 'react';
import GradientWaves from '../components/ui/GradientWaves';
import LiveOrb from '../components/ui/LiveOrb';
import AnimatedHat from '../components/ui/AnimatedHat';
import { Sparkles, FileText, Zap, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup } from '../firebase';
// 1. Importamos la nueva función del backend
import { chatWithNova } from '../services/bedrockService';

export default function LandingPage({ user }) {
  const navigate = useNavigate();
  const words = ["Startups", "Emprendedores", "Inversores", "Visionarios"];
  const [currentWord, setCurrentWord] = useState(0);
  
  // Añadimos el estado "thinking" para cuando AWS procesa la respuesta
  const [orbState, setOrbState] = useState('asleep'); // asleep | greeting | idle | listening | thinking | speaking
  
  // Referencia para la API de reconocimiento de voz
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Inicializar Speech Recognition (Soporte para Chrome/Edge)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false; // Se detiene automáticamente al terminar de hablar
      recognition.interimResults = false;
      recognitionRef.current = recognition;
    }

    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [words.length]);

  const handleStartCreation = async () => {
    if (user) {
      navigate('/editor');
    } else {
      try {
        await signInWithPopup(auth, googleProvider);
        navigate('/editor');
      } catch (error) {
        console.error("Error al autenticar para crear el deck:", error);
      }
    }
  };

  const wakeUpOrb = () => {
    setOrbState('greeting');
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(
      "Hola. Soy Nova, tu agente de inteligencia artificial. Dime, ¿de qué trata tu proyecto?"
    );
    utterance.lang = "es-ES";
    utterance.pitch = 1.2;
    utterance.rate = 1.05;
    
    utterance.onend = () => setOrbState('idle');
    window.speechSynthesis.speak(utterance);
  };

  const toggleMicrophone = () => {
    const recognition = recognitionRef.current;
    
    if (!recognition) {
      alert("Tu navegador no soporta el reconocimiento de voz nativo. Por favor usa Google Chrome o Edge.");
      return;
    }

    if (orbState === 'idle') {
      setOrbState('listening');
      recognition.start();

      // LÓGICA DE CAPTURA DE VOZ
      recognition.onresult = async (event) => {
        const userVoiceText = event.results[0][0].transcript;
        console.log("Detectado:", userVoiceText); // Puedes ver tu voz en la consola
        
        setOrbState('thinking'); // AWS está procesando...
        
        try {
          // Enviamos tu voz transcrita a Amazon Nova Pro
          const novaResponse = await chatWithNova(userVoiceText);
          
          // Reproducimos la respuesta real de la IA
          setOrbState('speaking');
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(novaResponse);
          utterance.lang = "es-ES";
          utterance.pitch = 1.2;
          utterance.rate = 1.05;
          utterance.onend = () => setOrbState('idle');
          window.speechSynthesis.speak(utterance);

        } catch (e) {
          console.error(e);
          setOrbState('idle');
        }
      };

      recognition.onerror = (e) => {
        console.error("Error en micrófono:", e);
        setOrbState('idle');
      };
      
    } else if (orbState === 'listening') {
      recognition.stop();
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] text-white overflow-hidden flex flex-col justify-center">
      
      <div className="absolute inset-0 z-0 opacity-60">
        <GradientWaves horizonColor="#0A0A0C" waveColor="#5227FF" crestColor="#FF9FFC" opacity={0.8} />
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0A0A0C]/80 via-[#0A0A0C]/40 to-[#0A0A0C]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
        
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300">
            <Sparkles className="w-3 h-3" /> Agente Nova 2 Sonic Integrado
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tighter">
            Tu idea convertida <br />
            en un pitch deck <br />
            para <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-500 transition-all duration-500">
              {words[currentWord]}
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-lg leading-relaxed font-light">
            Describe tu problema, solución y mercado. Nuestro Agente IA analiza la complejidad de tu proyecto y redacta un guion estructurado con el formato estricto que exigen los fondos de capital.
          </p>

          <div className="flex gap-4">
            <button onClick={handleStartCreation} className="bg-fuchsia-500 hover:bg-fuchsia-400 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_30px_-5px_rgba(217,70,239,0.5)] flex items-center gap-2 cursor-pointer">
              <Zap className="w-5 h-5" /> Crear mi pitch deck
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer">
              <FileText className="w-5 h-5" /> Ver un ejemplo
            </button>
          </div>
        </div>

        <div className="hidden lg:flex flex-col relative items-center justify-center perspective-1000 mt-10">
          <div className="absolute w-80 h-80 bg-fuchsia-500/30 blur-[100px] rounded-full pointer-events-none -z-10"></div>
          
          <div className={`relative transform transition-transform duration-700 ${orbState === 'speaking' || orbState === 'greeting' ? 'scale-110' : 'hover:scale-105'}`}>
            <AnimatedHat />
            
            <LiveOrb
              size={400}
              variant="webgl"
              colors={["#7C5CFF", "#FF9FFC", "#5227FF"]} 
              isAsleep={orbState === 'asleep'}
              isSpeaking={orbState === 'greeting' || orbState === 'speaking'}
            />
          </div>

          <div className="mt-8 bg-black/60 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full flex items-center gap-6 shadow-2xl">
            
            {orbState === 'asleep' && (
              <button onClick={wakeUpOrb} className="flex items-center gap-3 text-fuchsia-400 font-bold hover:text-white transition-colors cursor-pointer">
                <Volume2 className="w-5 h-5 animate-pulse" /> Despertar Agente Nova
              </button>
            )}

            {(orbState === 'greeting' || orbState === 'speaking') && (
              <div className="flex items-center gap-3 text-fuchsia-400 font-bold">
                <div className="flex gap-1 h-5 items-end">
                  <div className="w-1 bg-fuchsia-400 rounded-full animate-[bounce_1s_infinite_0ms] h-full"></div>
                  <div className="w-1 bg-fuchsia-400 rounded-full animate-[bounce_1s_infinite_200ms] h-3"></div>
                  <div className="w-1 bg-fuchsia-400 rounded-full animate-[bounce_1s_infinite_400ms] h-4"></div>
                </div>
                Nova está hablando...
              </div>
            )}

            {orbState === 'thinking' && (
              <div className="flex items-center gap-3 text-purple-400 font-bold">
                <Loader2 className="w-5 h-5 animate-spin" />
                Nova está pensando...
              </div>
            )}

            {orbState === 'idle' && (
              <button onClick={toggleMicrophone} className="flex items-center gap-3 text-white font-bold hover:text-fuchsia-400 transition-colors cursor-pointer">
                <Mic className="w-5 h-5" /> Hablar con Nova
              </button>
            )}

            {orbState === 'listening' && (
              <button onClick={toggleMicrophone} className="flex items-center gap-3 text-red-500 font-bold hover:text-red-400 transition-colors cursor-pointer">
                <MicOff className="w-5 h-5 animate-pulse" /> Escuchando... (habla ahora)
              </button>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}