import { useState, useEffect } from 'react';
import axios from 'axios';

const Metas = ({ user }) => {
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null); // Para o Admin mudar status

  // 1. DEFINIR A FUNÇÃO PRIMEIRO (Para evitar erro de ordem)
  const carregarMapa = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/metas');
      if (res.data.success) setMetas(res.data.data);
    } catch (error) { 
      console.error(error); // Usando a variável error
    }
    setLoading(false); // Usando a variável loading
  };

  // 2. CHAMAR A FUNÇÃO DEPOIS
  useEffect(() => {
    carregarMapa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mudarStatus = async (id, novoStatus) => {
    try {
      await axios.put(`http://localhost:3001/api/metas/${id}`, { status: novoStatus });
      setEditando(null);
      carregarMapa();
    } catch (error) { 
      console.error(error);
      alert('Erro ao atualizar fase'); 
    }
  };

  const novaMeta = async () => {
    const titulo = prompt("Nome da nova fase/meta:");
    if (!titulo) return;
    try {
      await axios.post('http://localhost:3001/api/metas', { 
        titulo, 
        ordem: metas.length + 1 
      });
      carregarMapa();
    } catch (error) { 
      console.error(error);
      alert('Erro ao criar fase'); 
    }
  };

  // Ícones por status
  const getIcone = (status) => {
    if (status === 'concluido') return '🚩'; // Bandeira
    if (status === 'andamento') return '🏃'; // Correndo
    return '🔒'; // Cadeado
  };

  // Cor por status
  const getCor = (status) => {
    if (status === 'concluido') return 'bg-green-500 border-green-300 text-white';
    if (status === 'andamento') return 'bg-yellow-500 border-yellow-300 text-black animate-bounce';
    return 'bg-gray-700 border-gray-600 text-gray-400 grayscale';
  };

  // 3. TELA DE CARREGAMENTO (Usa a variável loading)
  if (loading) {
    return (
        <div className="w-full h-full flex items-center justify-center text-blue-400 animate-pulse">
            Carregando mapa... 🗺️
        </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in font-body overflow-y-auto custom-scrollbar relative">
      <h2 className="text-blue-400 text-center font-pixel text-lg mb-2 tracking-widest">
        Mapa do Futuro
      </h2>
      <p className="text-center text-xs text-gray-500 mb-8">Nossa jornada, fase por fase.</p>

      {/* ADMIN: Botão de adicionar */}
      {user.papel === 'admin' && (
        <button onClick={novaMeta} className="absolute top-4 right-4 text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded border border-blue-500/50">
          + Fase
        </button>
      )}

      {/* O MAPA */}
      <div className="relative flex flex-col items-center w-full max-w-xs mx-auto pb-20">
        
        {/* Linha do Caminho (SVG no fundo) */}
        <svg className="absolute top-4 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {/* Desenha uma linha conectando os pontos */}
            <path 
                d="M 160 20 Q 250 80 160 140 Q 70 200 160 260 Q 250 320 160 380 Q 70 440 160 500" 
                fill="none" 
                stroke="#334155" 
                strokeWidth="4" 
                strokeDasharray="10, 10" 
            />
        </svg>

        {/* As Fases (Nodes) */}
        <div className="w-full flex flex-col gap-12 relative z-10 pt-4">
            {metas.map((meta, index) => {
                // Alterna lados (Zigue-Zague visual)
                const lado = index % 2 === 0 ? 'self-end mr-10' : 'self-start ml-10';
                
                return (
                    <div 
                        key={meta.id} 
                        onClick={() => user.papel === 'admin' && setEditando(meta)}
                        className={`flex flex-col items-center ${lado} cursor-pointer group`}
                    >
                        {/* Círculo da Fase */}
                        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl shadow-xl transition-all duration-300 relative ${getCor(meta.status)}`}>
                            {getIcone(meta.status)}
                            
                            {/* Número da Fase */}
                            <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border border-white">
                                {index + 1}
                            </span>
                        </div>

                        {/* Placa com Nome */}
                        <div className="mt-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 text-center">
                            <span className="text-xs font-bold text-gray-200">{meta.titulo}</span>
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* MODAL DE EDIÇÃO (ADMIN) */}
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-full max-w-sm text-center">
                <h3 className="text-white mb-4">Editar Fase: {editando.titulo}</h3>
                <div className="flex flex-col gap-2">
                    <button onClick={() => mudarStatus(editando.id, 'bloqueado')} className="p-3 bg-gray-800 rounded text-gray-400">🔒 Bloqueado (Futuro)</button>
                    <button onClick={() => mudarStatus(editando.id, 'andamento')} className="p-3 bg-yellow-900/30 text-yellow-400 border border-yellow-600">🏃 Em Andamento (Agora)</button>
                    <button onClick={() => mudarStatus(editando.id, 'concluido')} className="p-3 bg-green-900/30 text-green-400 border border-green-600">🚩 Concluído (Feito)</button>
                </div>
                <button onClick={() => setEditando(null)} className="mt-4 text-gray-500 text-sm underline">Cancelar</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default Metas;