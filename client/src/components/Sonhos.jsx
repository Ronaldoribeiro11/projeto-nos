import { useState, useEffect } from 'react';
import axios from 'axios';

const Sonhos = ({ user }) => {
  const [texto, setTexto] = useState('');
  const [bau, setBau] = useState([]);
  const [animacao, setAnimacao] = useState(''); // 'queimando' ou ''

  // Carregar o Baú de Sonhos Bons
  useEffect(() => {
    carregarBau();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarBau = async () => {
    try {
      // CORREÇÃO: Caminho relativo /api
      const res = await axios.get(`/api/sonhos/${user.id}`);
      if (res.data.success) setBau(res.data.data);
    } catch (error) { console.error(error); }
  };

  // Guardar Sonho Bom
  const guardarSonho = async () => {
    if (!texto) return;
    try {
      // CORREÇÃO: Caminho relativo /api
      await axios.post('/api/sonhos', {
        usuario_id: user.id,
        texto,
        tipo: 'bom'
      });
      setTexto('');
      carregarBau();
      alert('✨ Sonho guardado no baú!');
    } catch (error) { console.error(error); }
  };

  // Destruir Pesadelo
  const exorcizarPesadelo = async () => {
    if (!texto) return;
    
    // 1. Inicia animação visual
    setAnimacao('queimando');

    // 2. Salva no banco (para você saber que ela teve pesadelo), mas para ela "sumiu"
    try {
      // CORREÇÃO: Caminho relativo /api
      await axios.post('/api/sonhos', {
        usuario_id: user.id,
        texto,
        tipo: 'pesadelo'
      });
      
      // 3. Limpa depois da animação
      setTimeout(() => {
        setTexto('');
        setAnimacao('');
      }, 1500); // Tempo da animação
      
    } catch (error) { console.error(error); }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in font-body overflow-hidden">
      <h2 className="text-purple-300 text-center font-pixel text-lg mb-4 tracking-widest">
        Caça-Pesadelos
      </h2>

      {/* ÁREA DE ESCRITA */}
      <div className="relative mb-6">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Conte seu sonho aqui..."
          disabled={animacao === 'queimando'}
          className={`w-full h-40 bg-gray-900/50 text-gray-300 p-4 rounded-xl border border-gray-700 focus:border-purple-500 outline-none resize-none transition-all duration-1000
            ${animacao === 'queimando' ? 'scale-0 opacity-0 bg-red-900 rotate-12 blur-sm' : 'scale-100 opacity-100'}
          `}
        />
        
        {/* Efeito de Fogo (Texto Visual) quando queima */}
        {animacao === 'queimando' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-4xl animate-ping">🔥</span>
            </div>
        )}
      </div>

      {/* BOTÕES DE AÇÃO */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={exorcizarPesadelo}
          disabled={!texto || animacao}
          className="flex-1 bg-red-900/30 border border-red-800 text-red-400 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-red-900 hover:text-white transition active:scale-95 disabled:opacity-50"
        >
          🔥 Queimar (Ruim)
        </button>
        <button
          onClick={guardarSonho}
          disabled={!texto || animacao}
          className="flex-1 bg-purple-900/30 border border-purple-800 text-purple-300 py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-purple-900 hover:text-white transition active:scale-95 disabled:opacity-50"
        >
          ✨ Guardar (Bom)
        </button>
      </div>

      {/* BAÚ DE MEMÓRIAS (SONHOS BONS) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar border-t border-white/10 pt-4">
        <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-4 text-center flex items-center justify-center gap-2">
            <span>🗝️</span> Baú de Sonhos
        </h3>
        
        <div className="space-y-3 pb-20">
            {bau.length === 0 && (
                <p className="text-center text-gray-600 text-xs italic">O baú está vazio...</p>
            )}
            
            {bau.map((sonho) => (
                <div key={sonho.id} className="bg-black/20 p-3 rounded-lg border border-purple-500/10 hover:border-purple-500/30 transition">
                    <p className="text-gray-300 text-sm italic font-serif">"{sonho.texto}"</p>
                    <p className="text-[9px] text-gray-600 mt-2 text-right">
                        {new Date(sonho.data_criacao).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Sonhos;