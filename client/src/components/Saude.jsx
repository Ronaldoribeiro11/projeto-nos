import { useState } from 'react';
import axios from 'axios';

const Saude = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const [parteSelecionada, setParteSelecionada] = useState(null);

  // --- FARMÁCIA ---
  const farmacia = [
    { nome: "Buscopan/Atroveran", dose: "Cólica Intensa" },
    { nome: "Ibuprofeno", dose: "600mg - Dor Geral" },
    { nome: "Vonau/Plasil", dose: "Enjoo/Estômago" },
    { nome: "Neosaldina", dose: "Dor de Cabeça" },
    { nome: "Bolsa Térmica", dose: "Alívio Local" },
    { nome: "Clonazepam", dose: "SOS - Ansiedade", especial: true },
  ];

  const registrar = async (tipo, detalhe, intensidade = 0) => {
    if (loading) return;
    setLoading(true);
    if (tipo === 'sintoma') setParteSelecionada(detalhe);
    
    try {
      await axios.post('https://projeto-nos-api.onrender.com/api/saude', {
        usuario_id: user.id,
        tipo, detalhe, intensidade
      });
      setMensagem(`Anotado: ${detalhe}`);
      setTimeout(() => {
        setMensagem('');
        setParteSelecionada(null);
      }, 3000);
    } catch (error) {
      console.error(error);
      alert('Erro ao registrar :/');
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in overflow-y-auto custom-scrollbar relative font-body">
      <h2 className="text-medical-red text-center font-pixel text-lg mb-2 tracking-widest">Enfermaria</h2>
      <p className="text-center text-xs text-gray-500 mb-4">Toque na região do corpo.</p>

      {/* FEEDBACK FLUTUANTE */}
      {mensagem && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-medical-red/90 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-bold shadow-2xl z-50 animate-bounce whitespace-nowrap border-2 border-white/20 flex items-center gap-2">
          💉 {mensagem}
        </div>
      )}

      {/* --- ÍCONE CORPORAL SUPER COMPACTO --- */}
      <div className="flex flex-col items-center mb-6 relative">
        <div className={`relative w-full max-w-[300px] h-64 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            
            {/* ViewBox bem menor na altura (260) para compactar tudo */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260" className="w-full h-full">
                
                {/* 1. BASE SÓLIDA CINZA (Coordenadas Y muito reduzidas) */}
                <g fill="#3f3f46"> 
                    {/* Cabeça */}
                    <circle cx="100" cy="35" r="25" />

                    {/* Braços (Mais curtos) */}
                    <path d="M 75 70 L 55 150" stroke="#3f3f46" strokeWidth="12" strokeLinecap="round" /> {/* Esq */}
                    <path d="M 125 70 L 145 150" stroke="#3f3f46" strokeWidth="12" strokeLinecap="round" /> {/* Dir */}
                    
                    {/* Corpo (Triângulo bem mais baixo) */}
                    {/* Topo: y=55, Base: y=180 */}
                    <path d="M 100 55 L 160 180 L 40 180 Z" />
                    
                    {/* Pernas (Curtinhas) */}
                    <rect x="85" y="180" width="12" height="60" />
                    <rect x="103" y="180" width="12" height="60" />
                </g>

                {/* 2. ÁREAS CLICÁVEIS (Tudo mais junto) */}
                
                {/* CABEÇA */}
                <g className="group cursor-pointer" onClick={() => registrar('sintoma', 'Enxaqueca/Cabeça', 8)}>
                    <circle cx="100" cy="35" r="30" fill="transparent" className={`group-hover:fill-medical-red/30 transition-all ${parteSelecionada?.includes('Cabeça') ? 'fill-medical-red/50 animate-pulse' : ''}`} />
                    <text x="100" y="45" textAnchor="middle" className="text-2xl filter drop-shadow-md opacity-80 group-hover:opacity-100 transition">⚡</text>
                </g>

                {/* PEITO (Subiu muito) */}
                <g className="group cursor-pointer" onClick={() => registrar('sintoma', 'Ansiedade/Peito', 7)}>
                    <circle cx="100" cy="90" r="25" fill="transparent" className={`group-hover:fill-kawaii-purple/30 transition-all ${parteSelecionada?.includes('Ansiedade') ? 'fill-kawaii-purple/50 animate-pulse' : ''}`} />
                    <text x="100" y="100" textAnchor="middle" className="text-2xl filter drop-shadow-md opacity-80 group-hover:opacity-100 transition">🫀</text>
                </g>

                {/* ESTÔMAGO */}
                <g className="group cursor-pointer" onClick={() => registrar('sintoma', 'Dor de Estômago', 9)}>
                    <circle cx="100" cy="130" r="22" fill="transparent" className={`group-hover:fill-orange-500/30 transition-all ${parteSelecionada?.includes('Estômago') ? 'fill-orange-500/50 animate-pulse' : ''}`} />
                    <text x="100" y="140" textAnchor="middle" className="text-2xl filter drop-shadow-md opacity-80 group-hover:opacity-100 transition">🔥</text>
                </g>

                {/* PÉLVIS / CÓLICA */}
                <g className="group cursor-pointer" onClick={() => registrar('sintoma', 'Cólica/Sangramento', 10)}>
                     <path d="M 70 150 L 130 150 L 150 180 L 50 180 Z" fill="transparent" className={`group-hover:fill-red-600/30 transition-all ${parteSelecionada?.includes('Cólica') ? 'fill-red-600/50 animate-pulse' : ''}`} />
                    <text x="100" y="175" textAnchor="middle" className="text-2xl filter drop-shadow-md opacity-80 group-hover:opacity-100 transition">🩸</text>
                </g>

                {/* 3. LEGENDAS (Ajustadas para a nova altura) */}
                <g className="font-pixel text-[9px] uppercase tracking-widest" fill="#71717a" style={{ fontSize: '10px' }}>
                    <text x="170" y="40" alignmentBaseline="middle">Cabeça</text>
                    <text x="170" y="95" alignmentBaseline="middle">Peito</text>
                    <text x="170" y="135" alignmentBaseline="middle">Estômago</text>
                    <text x="170" y="175" alignmentBaseline="middle" fill="#ff5c5c">Cólica</text>
                    
                    {/* Linhas guia */}
                    <line x1="135" y1="40" x2="165" y2="40" stroke="#333" strokeWidth="1" />
                    <line x1="135" y1="95" x2="165" y2="95" stroke="#333" strokeWidth="1" />
                    <line x1="145" y1="135" x2="165" y2="135" stroke="#333" strokeWidth="1" />
                    <line x1="155" y1="175" x2="165" y2="175" stroke="#ff5c5c" strokeWidth="1" opacity="0.5" />
                </g>

            </svg>
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

      {/* --- FARMÁCIA --- */}
      <div className="mb-20 relative">
        <h3 className="text-gray-500 text-[10px] uppercase tracking-widest mb-4 text-center">Farmácia Particular</h3>
        <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {farmacia.map((rem, index) => (
                <BtnRemedio 
                    key={index}
                    nome={rem.nome} 
                    dose={rem.dose} 
                    onClick={() => registrar('remedio', rem.nome)} 
                    disabled={loading}
                    cor={rem.especial ? "border-kawaii-purple text-kawaii-purple bg-kawaii-purple/10 hover:bg-kawaii-purple/20 shadow-[0_0_10px_rgba(190,147,253,0.2)]" : undefined}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

const BtnRemedio = ({ nome, dose, onClick, cor = "border-white/10 text-gray-300 hover:border-medical-red/50 hover:text-medical-red hover:bg-white/5", disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center justify-center p-3 rounded-xl border bg-black/30 backdrop-blur-sm active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${cor}`}
    >
        <span className="font-bold text-sm tracking-wide">{nome}</span>
        <span className="text-[8px] opacity-60 mt-1 font-light">{dose}</span>
    </button>
);

export default Saude;