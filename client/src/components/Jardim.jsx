import { useState, useEffect } from 'react';
import axios from 'axios';

const Jardim = ({ user }) => {
  const [humor, setHumor] = useState('');
  const [nota, setNota] = useState('');
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  // Opções de Humor
  const humores = [
    { id: 'feliz', icon: '✨', label: 'Feliz', color: 'bg-yellow-500' },
    { id: 'triste', icon: '💧', label: 'Triste', color: 'bg-blue-500' },
    { id: 'ansiosa', icon: '🌪️', label: 'Ansiosa', color: 'bg-purple-500' },
    { id: 'raiva', icon: '🔥', label: 'Raiva', color: 'bg-red-500' },
    { id: 'doente', icon: '🩹', label: 'Doente', color: 'bg-green-500' },
  ];

  // 1. Função de carregar (definida antes de usar)
  const carregarJardim = async () => {
    try {
      // CORREÇÃO:
      // 1. Removemos o localhost (usa o proxy agora)
      // 2. Mudamos para '/api/jardim' (que é a rota correta de leitura no seu backend)
      const res = await axios.get('/api/jardim');
      if (res.data.success) setHistorico(res.data.data);
    } catch (error) {
      console.error("Erro ao carregar jardim:", error);
    }
  };

  // 2. useEffect chama a função
  useEffect(() => {
    carregarJardim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plantar = async () => {
    if (!humor) return alert('Escolha como se sente!');
    setLoading(true);
    try {
      // CORREÇÃO: Caminho relativo para salvar (/api/diario está correto para POST)
      await axios.post('/api/diario', {
        usuario_id: user.id,
        humor,
        nota
      });
      // Limpa e recarrega
      setHumor('');
      setNota('');
      carregarJardim();
    } catch (error) {
      console.error("Erro ao plantar:", error);
      alert('Erro ao plantar :/');
    }
    setLoading(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in">
      <h2 className="text-kawaii-pink text-center font-pixel text-lg mb-6">Jardim dos Sentimentos</h2>

      {/* ÁREA DE PLANTIO */}
      <div className="bg-yami-gray/50 p-4 rounded-xl border border-white/10 mb-6">
        <p className="text-gray-400 text-xs text-center mb-4">Como está seu coração hoje?</p>
        
        {/* Botões de Humor */}
        <div className="flex justify-between mb-4">
          {humores.map((h) => (
            <button
              key={h.id}
              onClick={() => setHumor(h.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                humor === h.id ? 'scale-110 opacity-100' : 'opacity-50 hover:opacity-80'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg ${h.color} ${humor === h.id ? 'ring-2 ring-white' : ''}`}>
                {h.icon}
              </div>
              <span className="text-[9px] uppercase tracking-wider">{h.label}</span>
            </button>
          ))}
        </div>

        {/* Campo de Texto */}
        <textarea
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          placeholder="Quer desabafar algo? (Opcional)"
          className="w-full bg-black/30 text-white text-sm rounded-lg p-3 border border-white/5 focus:border-kawaii-pink outline-none resize-none h-20"
        />

        {/* Botão Plantar */}
        <button
          onClick={plantar}
          disabled={loading}
          className="w-full mt-3 bg-kawaii-pink/20 hover:bg-kawaii-pink/40 text-kawaii-pink border border-kawaii-pink rounded-lg py-2 text-xs font-bold uppercase tracking-widest transition"
        >
          {loading ? 'Plantando...' : 'Plantar Sentimento 🌿'}
        </button>
      </div>

      {/* HISTÓRICO (CANTEIRO) */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-3 text-center">Últimas Flores</h3>
        <div className="space-y-2">
          {historico.map((item) => (
            <div key={item.id} className="bg-black/20 p-3 rounded-lg flex items-center gap-3 border-l-2 border-white/10 hover:bg-black/30 transition">
              <div className="text-2xl">
                {humores.find(h => h.id === item.humor)?.icon || '❓'}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-300 capitalize">{item.humor}</span>
                    <span className="text-[9px] text-gray-600">
                        {new Date(item.data_registro).toLocaleDateString('pt-BR')}
                    </span>
                </div>
                {item.nota && <p className="text-[10px] text-gray-500 mt-1 italic">"{item.nota}"</p>}
              </div>
            </div>
          ))}
          {historico.length === 0 && (
            <p className="text-center text-xs text-gray-600 italic py-4">Seu jardim ainda está vazio...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jardim;