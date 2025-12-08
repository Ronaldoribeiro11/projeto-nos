import { useState, useEffect } from 'react';
import axios from 'axios';

const Cofre = ({ user }) => {
  const [saldo, setSaldo] = useState(0);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // META DO CASAL (Pode ser editada no código ou futuramente no banco)
  const META = 5000; 

  useEffect(() => {
    carregarCofre();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarCofre = async () => {
    try {
      // CORREÇÃO: Caminho relativo /api
      const res = await axios.get('/api/cofre');
      if (res.data.success) {
        setSaldo(parseFloat(res.data.saldo));
        setHistorico(res.data.historico);
      }
    } catch (error) { console.error(error); }
  };

  const depositar = async (valor, desc) => {
    setLoading(true);
    try {
      // CORREÇÃO: Caminho relativo /api
      await axios.post('/api/cofre', {
        usuario_id: user.id,
        valor: valor,
        descricao: desc
      });
      // Toca um som de moeda (opcional, visualmente usamos emoji)
      alert(`💰 Adicionado: R$ ${valor},00`);
      carregarCofre();
    } catch (error) {
      console.error(error);
      alert('Erro ao depositar.');
    }
    setLoading(false);
  };

  // Lógica de Evolução do Porquinho
  const porcentagem = Math.min((saldo / META) * 100, 100);
  
  const getPorquinho = () => {
    if (porcentagem < 10) return { icon: '🐖', nivel: 'Porquinho Bebê', cor: 'text-pink-300' };
    if (porcentagem < 30) return { icon: '🐷', nivel: 'Porquinho Jovem', cor: 'text-pink-500' };
    if (porcentagem < 60) return { icon: '🐽', nivel: 'Porquinho Adulto', cor: 'text-red-400' };
    if (porcentagem < 90) return { icon: '🐗', nivel: 'Javali Investidor', cor: 'text-orange-700' };
    return { icon: '👑', nivel: 'Rei do Dinheiro', cor: 'text-yellow-400 animate-bounce' };
  };

  const avatar = getPorquinho();

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in font-body overflow-y-auto custom-scrollbar">
      <h2 className="text-yellow-400 text-center font-pixel text-lg mb-2 tracking-widest">
        O Cofre
      </h2>
      <p className="text-center text-xs text-gray-500 mb-6">Meta: R$ {META.toLocaleString('pt-BR')}</p>

      {/* ÁREA DO PORQUINHO */}
      <div className="flex flex-col items-center justify-center mb-8 relative">
        {/* Círculo de Fundo */}
        <div className={`w-40 h-40 rounded-full border-4 border-dashed flex items-center justify-center bg-black/30 transition-all duration-1000 ${porcentagem >= 100 ? 'border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.5)]' : 'border-gray-700'}`}>
            <span className={`text-6xl filter drop-shadow-lg transition-transform hover:scale-110 cursor-pointer ${avatar.cor}`}>
                {avatar.icon}
            </span>
        </div>
        
        {/* Nível Atual */}
        <div className="mt-4 bg-gray-800/50 px-4 py-1 rounded-full border border-gray-700">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">{avatar.nivel}</span>
        </div>

        {/* Valor Gigante */}
        <h1 className="text-4xl font-bold text-white mt-4 font-mono tracking-tighter">
            <span className="text-sm text-gray-500 mr-1">R$</span>
            {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h1>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div className="w-full bg-gray-900 rounded-full h-4 mb-8 border border-gray-800 relative overflow-hidden">
        <div 
            className="bg-gradient-to-r from-yellow-600 to-yellow-300 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
            style={{ width: `${porcentagem}%` }}
        >
            {porcentagem > 10 && <span className="text-[9px] text-black font-bold">{Math.floor(porcentagem)}%</span>}
        </div>
      </div>

      {/* BOTÕES RÁPIDOS (ACTION PAD) */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <BtnDinheiro valor={10} onClick={() => depositar(10, 'Economia Rápida')} loading={loading} />
        <BtnDinheiro valor={20} onClick={() => depositar(20, 'Lanche que não comi')} loading={loading} />
        <BtnDinheiro valor={50} onClick={() => depositar(50, 'Extra')} loading={loading} />
        <BtnDinheiro valor={100} onClick={() => depositar(100, 'Investimento')} loading={loading} cor="border-yellow-500/50 text-yellow-400" />
      </div>

      {/* HISTÓRICO DE DEPÓSITOS */}
      <div className="flex-1 border-t border-white/10 pt-4">
        <h3 className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-4 text-center">Últimos Depósitos</h3>
        <div className="space-y-2 pb-20">
            {historico.length === 0 && <p className="text-center text-gray-600 text-xs">O cofre está vazio.</p>}
            
            {historico.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border-l-2 border-green-500">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-300">{item.descricao || 'Depósito'}</span>
                        <span className="text-[9px] text-gray-600">{new Date(item.data_transacao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="text-green-400 font-bold text-sm">+ R$ {parseFloat(item.valor).toFixed(2)}</span>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
};

const BtnDinheiro = ({ valor, onClick, loading, cor = "border-gray-700 text-gray-300 hover:border-green-500 hover:text-green-400" }) => (
    <button 
        onClick={onClick}
        disabled={loading}
        className={`flex items-center justify-center gap-2 p-3 rounded-xl border bg-black/30 active:scale-95 transition ${cor} disabled:opacity-50`}
    >
        <span className="text-lg">💰</span>
        <span className="font-bold">+ {valor}</span>
    </button>
);

export default Cofre;