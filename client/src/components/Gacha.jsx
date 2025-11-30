import { useState, useEffect } from 'react';
import axios from 'axios';

const Gacha = ({ user }) => {
  const [aba, setAba] = useState('maquina'); // maquina | bolsa
  const [moedas, setMoedas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animando, setAnimando] = useState(false);
  const [premioNovo, setPremioNovo] = useState(null);
  const [inventario, setInventario] = useState([]);

  // 1. DEFINIR A FUNÇÃO PRIMEIRO
  const atualizarDados = async () => {
    try {
      const resSaldo = await axios.get(`https://projeto-nos-api.onrender.com/api/usuario/${user.id}/saldo`);
      if (resSaldo.data.success) setMoedas(resSaldo.data.moedas);
      
      const resInv = await axios.get(`https://projeto-nos-api.onrender.com/api/gacha/inventario/${user.id}`);
      if (resInv.data.success) setInventario(resInv.data.data);
    } catch (error) { console.error(error); }
  };

  // 2. CHAMAR A FUNÇÃO DEPOIS
  useEffect(() => {
    atualizarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const girar = async () => {
    setLoading(true);
    try {
      const res = await axios.post('https://projeto-nos-api.onrender.com/api/gacha/girar', { usuario_id: user.id });
      
      if (!res.data.success) {
        alert(res.data.message);
        setLoading(false);
        return;
      }

      // Animação
      setAnimando(true);
      setTimeout(() => {
        setAnimando(false);
        setPremioNovo(res.data.premio);
        atualizarDados();
      }, 3000); // 3 segundos de suspense

    } catch (error) { 
      console.error(error); // <--- CORREÇÃO AQUI (Usando a variável error)
      alert('Erro ao girar'); 
    }
    setLoading(false);
  };

  const usarPremio = async (id) => {
    if(!window.confirm("Quer gastar esse vale agora? Ele vai sumir!")) return;
    try {
      await axios.put(`https://projeto-nos-api.onrender.com/api/gacha/usar/${id}`);
      alert("Vale resgatado! Mostre a tela pro seu amor.");
      atualizarDados();
    } catch (error) { 
      console.error(error); // <--- CORREÇÃO AQUI (Usando a variável error)
      alert('Erro ao usar'); 
    }
  };

  // Funções de Estilo (Cores e Ícones)
  const getEstilo = (tipo) => {
    if (tipo === 'safado') return 'bg-red-900/40 border-red-500 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.3)]'; 
    if (tipo === 'vale') return 'bg-yellow-900/20 border-yellow-600 text-yellow-200'; 
    return 'bg-pink-900/20 border-pink-500 text-pink-200'; 
  };

  const getIcone = (tipo) => {
    if (tipo === 'safado') return '🔥';
    if (tipo === 'vale') return '🎫';
    return '💖';
  };

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in font-body overflow-hidden">
      
      {/* HEADER MOEDAS */}
      <div className="flex justify-between items-center mb-6 bg-black/40 p-2 rounded-xl border border-yellow-500/30">
        <span className="text-yellow-400 font-bold ml-2 text-sm">💰 {moedas} Moedas</span>
        <div className="flex gap-2">
            <button onClick={() => setAba('maquina')} className={`px-3 py-1 rounded text-xs uppercase ${aba === 'maquina' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>Girar</button>
            <button onClick={() => setAba('bolsa')} className={`px-3 py-1 rounded text-xs uppercase ${aba === 'bolsa' ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>Bolsa</button>
        </div>
      </div>

      {aba === 'maquina' ? (
        <div className="flex flex-col items-center justify-center flex-1">
            {/* MÁQUINA VISUAL */}
            <div className={`w-56 h-56 rounded-full border-8 border-purple-500 bg-purple-900 flex items-center justify-center relative shadow-[0_0_50px_rgba(168,85,247,0.5)] ${animando ? 'animate-spin' : ''}`}>
                <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center text-6xl">
                    {animando ? '🌀' : '🎰'}
                </div>
            </div>

            <button 
                onClick={girar} 
                disabled={loading || animando}
                className="mt-10 bg-yellow-500 text-black font-black py-4 px-10 rounded-full text-lg uppercase tracking-widest shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale transition"
            >
                {animando ? 'Girando...' : 'GIRAR'}
            </button>
            <p className="mt-2 text-[10px] text-gray-500">1x Grátis por dia • Extras: 10 moedas</p>
        </div>
      ) : (
        // INVENTÁRIO
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
            <h3 className="text-center text-gray-500 text-xs mb-4 uppercase tracking-widest">Seus Vales</h3>
            <div className="grid grid-cols-1 gap-3">
                {inventario.map((item) => (
                    <div key={item.id} className={`p-4 rounded-xl border relative overflow-hidden group transition ${item.status === 'usado' ? 'opacity-40 grayscale border-gray-700' : getEstilo(item.tipo)}`}>
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-2xl mb-1 block">{getIcone(item.tipo)}</span>
                                <h4 className="font-bold text-sm">{item.nome}</h4>
                                <p className="text-[10px] opacity-70 mt-1">{new Date(item.data_ganho).toLocaleDateString('pt-BR')} • {item.status}</p>
                            </div>
                            {item.status === 'disponivel' && (
                                <button onClick={() => usarPremio(item.id)} className="bg-white/10 px-3 py-2 rounded text-xs hover:bg-white/20 border border-white/20">USAR</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* POPUP DE PRÊMIO */}
      {premioNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6" onClick={() => setPremioNovo(null)}>
            <div className={`p-10 rounded-2xl border-2 text-center animate-bounce shadow-2xl ${getEstilo(premioNovo.tipo)}`}>
                <span className="text-6xl mb-4 block">{getIcone(premioNovo.tipo)}</span>
                <h2 className="text-2xl font-bold mb-2">{premioNovo.nome}</h2>
                <p className="text-sm opacity-80 mt-4 font-bold uppercase tracking-widest">Guardado na sua bolsa!</p>
                <p className="text-[10px] mt-8 text-white/50">(Toque para fechar)</p>
            </div>
        </div>
      )}

    </div>
  );
};

export default Gacha;