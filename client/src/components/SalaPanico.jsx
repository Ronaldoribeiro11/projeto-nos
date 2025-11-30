import { useState, useEffect, useRef } from 'react';

const SalaPanico = () => {
  const [respirando, setRespirando] = useState(false);
  const [fase, setFase] = useState('');
  const [audioAtual, setAudioAtual] = useState(null);
  const audioRef = useRef(null);

  // --- CONFIGURAÇÃO ---
  const SEU_NUMERO = "5512996716119"; 
  const MENSAGEM_SOS = "Amor, preciso de ajuda! Estou tendo uma crise. 🆘";

  // Lista de Áudios (Agora em .ogg)
  const audios = [
    { id: 1, titulo: "Estou aqui com você", arquivo: "/audios/audio1.ogg", tempo: "0:30" },
    { id: 2, titulo: "Vai passar, confia", arquivo: "/audios/audio2.ogg", tempo: "1:15" },
    
  ];

  // Função para Tocar/Pausar
  const tocarAudio = (caminho) => {
    if (audioRef.current) {
      audioRef.current.pause();
      const estavaTocando = audioAtual === caminho;
      audioRef.current = null;
      setAudioAtual(null);
      
      if (estavaTocando) return;
    }

    const novoAudio = new Audio(caminho);
    novoAudio.play().catch(e => console.error("Erro ao tocar áudio:", e));
    novoAudio.onended = () => setAudioAtual(null);
    audioRef.current = novoAudio;
    setAudioAtual(caminho);
  };

  // Parar áudio se sair da tela
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // Lógica da Respiração
  useEffect(() => {
    let intervalo;
    if (respirando) {
      setFase('Inspire (4s)');
      let contador = 0;
      intervalo = setInterval(() => {
        contador++;
        const tempo = contador % 19;
        if (tempo < 4) setFase('Inspire (4s)');
        else if (tempo < 11) setFase('Segure (7s)');
        else setFase('Expire (8s)');
      }, 1000);
    } else {
      setFase('');
    }
    return () => clearInterval(intervalo);
  }, [respirando]);

  const pedirAjuda = () => {
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    const link = `https://wa.me/${12996716119}?text=${encodeURIComponent(MENSAGEM_SOS)}`;
    window.open(link, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col p-6 animate-fade-in bg-black text-white overflow-hidden relative font-body">
      
      <h2 className="text-gray-600 text-center font-pixel text-xs tracking-[0.5em] mb-6 uppercase opacity-50">
        Zona de Segurança
      </h2>

      {/* 1. RESPIRAÇÃO */}
      <div className="flex-1 flex flex-col items-center justify-center relative mb-6">
        <div 
            className={`w-40 h-40 rounded-full border-2 flex items-center justify-center transition-all duration-[4000ms] ease-in-out relative
            ${!respirando ? 'border-gray-800 scale-100' : ''}
            ${fase.includes('Inspire') ? 'border-kawaii-cyan scale-125 bg-kawaii-cyan/10' : ''}
            ${fase.includes('Segure') ? 'border-white scale-125 bg-white/10' : ''}
            ${fase.includes('Expire') ? 'border-kawaii-purple scale-75 bg-kawaii-purple/10' : ''}
            `}
        >
            <span className={`text-sm font-bold tracking-widest uppercase transition-colors duration-500
                ${fase.includes('Inspire') ? 'text-kawaii-cyan' : ''}
                ${fase.includes('Segure') ? 'text-white' : ''}
                ${fase.includes('Expire') ? 'text-kawaii-purple' : ''}
                ${!respirando ? 'text-gray-600' : ''}
            `}>
                {respirando ? fase : "Respirar"}
            </span>
        </div>
        
        <button 
            onClick={() => setRespirando(!respirando)}
            className="mt-8 text-[10px] text-gray-500 border border-gray-800 px-6 py-2 rounded-full hover:bg-white/5 transition uppercase tracking-widest"
        >
            {respirando ? "Parar" : "Iniciar Acalmamento"}
        </button>
      </div>

      {/* 2. PLAYER DE ÁUDIO */}
      <div className="mb-6 w-full">
        <h3 className="text-gray-600 text-[10px] uppercase tracking-widest mb-3 text-center">Voz de Segurança</h3>
        <div className="grid grid-cols-2 gap-2">
            {audios.map((audio) => (
                <BtnAudio 
                    key={audio.id} 
                    titulo={audio.titulo} 
                    tempo={audio.tempo} 
                    tocando={audioAtual === audio.arquivo}
                    onClick={() => tocarAudio(audio.arquivo)} 
                />
            ))}
        </div>
      </div>

      {/* 3. SOS */}
      <button 
        onClick={pedirAjuda}
        className="w-full bg-red-900/20 border border-red-900/50 hover:bg-red-600 hover:border-red-600 hover:text-white text-red-500 font-bold py-4 rounded-xl uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(153,27,27,0.1)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)]"
      >
        <span className="text-2xl animate-pulse">🚨</span>
        <span className="text-xs">Chamar Amor Agora</span>
      </button>

    </div>
  );
};

// Componente corrigido para receber cliques e estado
const BtnAudio = ({ titulo, tempo, tocando, onClick }) => (
    <button 
        onClick={onClick}
        className={`p-3 rounded-lg flex flex-col items-center justify-center transition border group active:scale-95
            ${tocando 
                ? 'bg-kawaii-purple/20 border-kawaii-purple text-white' 
                : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-kawaii-cyan/30 hover:bg-kawaii-cyan/5'}
        `}
    >
        <span className={`text-xl mb-1 transition ${tocando ? 'text-white' : 'text-gray-600 group-hover:text-kawaii-cyan'}`}>
            {tocando ? '⏸️' : '▶'}
        </span>
        <span className="text-[10px] font-medium uppercase">{titulo}</span>
        <span className="text-[9px] opacity-60 mt-1">{tempo}</span>
    </button>
);

export default SalaPanico;