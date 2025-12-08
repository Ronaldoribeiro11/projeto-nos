import { useState, useEffect } from 'react';
import axios from 'axios';

const Ciclo = ({ user }) => {
  const [ciclo, setCiclo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoje] = useState(new Date());

  // Carregar dados ao abrir
  useEffect(() => {
    carregarCiclo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarCiclo = async () => {
    try {
      // CORREÇÃO: Caminho relativo /api
      const res = await axios.get(`/api/ciclo/${user.id}`);
      if (res.data.success) {
        setCiclo(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Função para marcar "Menstruei Hoje"
  const registrarMenstruacao = async () => {
    const confirmacao = window.confirm("Marcar que a menstruação começou hoje?");
    if (!confirmacao) return;

    // Ajusta data para fuso horário local para não salvar dia errado
    const dataHoje = new Date().toLocaleDateString('en-CA'); // Formato YYYY-MM-DD

    try {
      // CORREÇÃO: Caminho relativo /api
      await axios.post('/api/ciclo', {
        usuario_id: user.id,
        data_ultima: dataHoje,
        duracao: 28 // Padrão de 28 dias
      });
      alert('Ciclo atualizado! 🩸');
      carregarCiclo();
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar ciclo.');
    }
  };

  // --- LÓGICA DE CÁLCULO DA FASE ---
  const calcularFase = () => {
    if (!ciclo) return null;

    // Converte a string do banco para data real
    const ultima = new Date(ciclo.data_ultima_menstruacao);
    // Adiciona o fuso horário para garantir precisão
    ultima.setMinutes(ultima.getMinutes() + ultima.getTimezoneOffset());

    const diferencaTempo = hoje.getTime() - ultima.getTime();
    const diaDoCiclo = Math.floor(diferencaTempo / (1000 * 3600 * 24)) + 1;

    let fase = {};

    if (diaDoCiclo >= 1 && diaDoCiclo <= 5) {
      fase = { nome: 'Menstruação', cor: 'text-red-500', borda: 'border-red-500', icone: '🩸', desc: 'Descanse, beba água e se cuide.' };
    } else if (diaDoCiclo >= 6 && diaDoCiclo <= 11) {
      fase = { nome: 'Fase Folicular', cor: 'text-pink-400', borda: 'border-pink-400', icone: '🌸', desc: 'Sua energia está voltando!' };
    } else if (diaDoCiclo >= 12 && diaDoCiclo <= 16) {
      fase = { nome: 'Ovulação', cor: 'text-yellow-400', borda: 'border-yellow-400', icone: '✨', desc: 'Ápice de confiança e energia.' };
    } else if (diaDoCiclo >= 17 && diaDoCiclo <= 28) {
      fase = { nome: 'Fase Lútea / TPM', cor: 'text-purple-400', borda: 'border-purple-400', icone: '🔮', desc: 'Momento de introspecção. Cuidado com o estresse.' };
    } else {
      fase = { nome: 'Atrasado?', cor: 'text-gray-400', borda: 'border-gray-400', icone: '❓', desc: 'O ciclo passou de 28 dias.' };
    }

    return { diaDoCiclo, ...fase };
  };

  const dadosFase = calcularFase();

  if (loading) return <div className="text-center text-gray-500 mt-10 animate-pulse">Consultando a lua...</div>;

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in font-body overflow-y-auto custom-scrollbar">
      <h2 className="text-pink-600 text-center font-pixel text-lg mb-6 tracking-widest">
        Ciclo Lunar
      </h2>

      {!ciclo ? (
        // TELA DE BOAS VINDAS (PRIMEIRA VEZ)
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <div className="text-6xl mb-4">🌑</div>
          <p className="text-gray-400 mb-6 text-sm">Vamos sincronizar seu ciclo?</p>
          <button 
            onClick={registrarMenstruacao}
            className="bg-red-600/20 border border-red-500 text-red-400 px-6 py-4 rounded-xl uppercase tracking-widest hover:bg-red-600 hover:text-white transition animate-pulse"
          >
            Menstruei Hoje 🩸
          </button>
        </div>
      ) : (
        // TELA DO CICLO ATUAL
        <div className="flex flex-col items-center flex-1">
          
          {/* VISUAL DA FASE (Círculo Principal) */}
          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            {/* Anéis decorativos */}
            <div className={`absolute inset-0 rounded-full border-2 border-dashed opacity-20 animate-[spin_10s_linear_infinite] ${dadosFase.borda}`}></div>
            <div className={`absolute inset-4 rounded-full border border-white/5`}></div>
            
            <div className="text-center z-10 flex flex-col items-center">
                <span className="text-5xl mb-2 filter drop-shadow-md">{dadosFase.icone}</span>
                <span className={`text-xl font-bold uppercase tracking-widest ${dadosFase.cor}`}>{dadosFase.nome}</span>
                <div className="mt-2 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                    <p className="text-gray-300 text-xs uppercase tracking-widest">Dia {dadosFase.diaDoCiclo}</p>
                </div>
            </div>
          </div>

          {/* MENSAGEM DE APOIO */}
          <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center mb-8 w-full max-w-xs shadow-lg">
            <p className="text-gray-300 text-sm font-serif italic">"{dadosFase.desc}"</p>
          </div>

          {/* PREVISÃO DE DATAS */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
             <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <span className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1">Início</span>
                <span className="text-white text-xs font-bold">
                    {new Date(ciclo.data_ultima_menstruacao).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                </span>
             </div>
             <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-center">
                <span className="block text-[9px] text-gray-500 uppercase tracking-widest mb-1">Próxima (Prev)</span>
                <span className="text-white text-xs font-bold">
                    {(() => {
                        const prox = new Date(ciclo.data_ultima_menstruacao);
                        // Adiciona timezone para cálculo correto
                        prox.setMinutes(prox.getMinutes() + prox.getTimezoneOffset());
                        prox.setDate(prox.getDate() + 28);
                        return prox.toLocaleDateString('pt-BR');
                    })()}
                </span>
             </div>
          </div>

          {/* BOTÃO DE RESET (DISCRETO) */}
          <button 
            onClick={registrarMenstruacao}
            className="text-[10px] text-red-400/50 hover:text-red-400 border border-red-900/30 hover:border-red-500 px-4 py-2 rounded-full transition uppercase tracking-widest hover:bg-red-900/10"
          >
            Iniciar Novo Ciclo
          </button>

        </div>
      )}
    </div>
  );
};

export default Ciclo;