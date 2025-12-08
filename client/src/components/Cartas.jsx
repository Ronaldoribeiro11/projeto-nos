import { useState, useEffect } from 'react';
import axios from 'axios';

const Cartas = ({ user }) => {
  const [cartas, setCartas] = useState([]);
  const [lendo, setLendo] = useState(null); // Carta que está aberta agora
  const [escrevendo, setEscrevendo] = useState(false); // Modal de escrever
  
  // Inputs para nova carta
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoConteudo, setNovoConteudo] = useState('');

  // 1. DEFINIR A FUNÇÃO PRIMEIRO
  const carregarCartas = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/cartas');
      if (res.data.success) setCartas(res.data.data);
    } catch (err) { console.error(err); }
  };

  // 2. CHAMAR ELA DEPOIS
  useEffect(() => {
    carregarCartas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirCarta = async (carta) => {
    setLendo(carta);
    if (!carta.foi_lida) {
      try {
        await axios.put(`http://localhost:3001/api/cartas/${carta.id}/ler`);
        // Atualiza localmente
        const novaLista = cartas.map(c => c.id === carta.id ? {...c, foi_lida: true} : c);
        setCartas(novaLista);
      } catch (err) { console.error(err); }
    }
  };

  const enviarCarta = async () => {
    if (!novoTitulo || !novoConteudo) return alert('Escreva algo!');
    try {
      await axios.post('http://localhost:3001/api/cartas', {
        titulo: novoTitulo,
        conteudo: novoConteudo
      });
      setEscrevendo(false);
      setNovoTitulo('');
      setNovoConteudo('');
      carregarCartas();
    } catch (err) { 
      // AQUI ESTAVA O ERRO: Agora usamos o 'err'
      console.error(err); 
      alert('Erro ao enviar'); 
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in relative">
      <h2 className="text-kawaii-purple text-center font-pixel text-lg mb-6">Correio do Amor</h2>

      {/* BOTÃO DE ESCREVER (SÓ O ADMIN VÊ) */}
      {user.papel === 'admin' && (
        <button 
          onClick={() => setEscrevendo(true)}
          className="bg-white/10 border border-dashed border-gray-500 text-gray-400 p-3 rounded-lg mb-4 text-xs uppercase hover:bg-white/20 transition"
        >
          + Escrever Nova Carta
        </button>
      )}

      {/* LISTA DE ENVELOPES */}
      <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-20 custom-scrollbar">
        {cartas.map((carta) => (
          <div 
            key={carta.id} 
            onClick={() => abrirCarta(carta)}
            className={`relative p-4 rounded-xl cursor-pointer transition transform hover:scale-105 active:scale-95 flex flex-col items-center text-center gap-2 border ${carta.foi_lida ? 'bg-black/20 border-gray-700' : 'bg-kawaii-pink/10 border-kawaii-pink border-2'}`}
          >
            <div className="text-4xl">
              {carta.foi_lida ? '📖' : '💌'}
            </div>
            <p className="text-xs font-bold text-gray-300 line-clamp-2 leading-tight">
              {carta.titulo}
            </p>
            {!carta.foi_lida && (
              <span className="absolute -top-2 -right-2 bg-kawaii-pink text-black text-[9px] px-2 py-1 rounded-full font-bold animate-bounce">
                NOVA
              </span>
            )}
          </div>
        ))}
        {cartas.length === 0 && (
            <p className="col-span-2 text-center text-gray-600 text-xs mt-10">
                A caixa de correio está vazia... por enquanto.
            </p>
        )}
      </div>

      {/* MODAL DE LEITURA (A CARTA ABERTA) */}
      {lendo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#fff1f5] text-gray-800 w-full max-w-sm rounded-lg p-6 shadow-2xl relative rotate-1 border-4 border-kawaii-pink/50">
            {/* Botão Fechar */}
            <button 
                onClick={() => setLendo(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold"
            >
                &times;
            </button>
            
            <h3 className="font-pixel text-kawaii-purple text-sm mb-4 border-b border-gray-200 pb-2">
                {lendo.titulo}
            </h3>
            
            <div className="text-sm leading-relaxed font-serif whitespace-pre-wrap max-h-[60vh] overflow-y-auto custom-scrollbar-light">
                {lendo.conteudo}
            </div>

            <div className="mt-6 text-center text-2xl text-kawaii-pink">
                ❥
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE ESCREVER (ADMIN) */}
      {escrevendo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-yami-gray w-full max-w-sm rounded-xl p-4 border border-gray-700 shadow-2xl">
              <h3 className="text-white mb-4">Nova Carta</h3>
              <input 
                className="w-full bg-black/50 text-white p-2 rounded mb-2 border border-gray-700 outline-none"
                placeholder="Título (ex: Leia quando estiver triste)"
                value={novoTitulo}
                onChange={e => setNovoTitulo(e.target.value)}
              />
              <textarea 
                className="w-full h-32 bg-black/50 text-white p-2 rounded mb-4 border border-gray-700 outline-none resize-none"
                placeholder="Escreva sua mensagem de amor aqui..."
                value={novoConteudo}
                onChange={e => setNovoConteudo(e.target.value)}
              />
              <div className="flex gap-2">
                  <button onClick={() => setEscrevendo(false)} className="flex-1 bg-gray-700 text-white py-2 rounded">Cancelar</button>
                  <button onClick={enviarCarta} className="flex-1 bg-kawaii-pink text-black font-bold py-2 rounded">Enviar 💌</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Cartas;