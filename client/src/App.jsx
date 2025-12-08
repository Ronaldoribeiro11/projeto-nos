import { useState, useEffect } from 'react';
import axios from 'axios'; // Mantemos axios para os outros apps (Jardim, etc)
import Pulso from './components/Pulso';
import MenuApps from './components/MenuApps'; 

// --- APPS PRONTOS ---
import Jardim from './components/Jardim';
import Saude from './components/Saude';
import Cartas from './components/Cartas';
import SalaPanico from './components/SalaPanico';
import Sonhos from './components/Sonhos';
import Ciclo from './components/Ciclo';
import Cofre from './components/Cofre';
import Metas from './components/Metas';
import Galeria from './components/Galeria';
import Gacha from './components/Gacha';
import Arcade from './components/Arcade';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('home'); 
  
  // --- LÓGICA DE LOGIN GARANTIDA (SEM SERVIDOR) ---
  useEffect(() => {
    const realizarLogin = () => {
        // 1. Verifica se já tem login salvo no navegador
        const usuarioSalvo = localStorage.getItem('usuario_nos');
        if (usuarioSalvo) {
            setUser(JSON.parse(usuarioSalvo));
            setLoading(false);
            return;
        }

        // 2. Verifica a chave na URL LOCALMENTE
        const params = new URLSearchParams(window.location.search);
        const chaveUrl = params.get('chave');

        // SE A CHAVE FOR "amor", ENTRA DIRETO!
        if (chaveUrl === 'amor') {
            // Criamos o usuário manualmente, ignorando o servidor
            const usuarioEla = { 
                id: 1, 
                nome: 'Ela', 
                papel: 'user',
                magic_code: 'amor'
            };
            
            localStorage.setItem('usuario_nos', JSON.stringify(usuarioEla));
            setUser(usuarioEla);
            
            // Limpa a URL para ficar bonito
            window.history.replaceState({}, document.title, "/");
        }
        
        setLoading(false);
    };

    realizarLogin();
  }, []);

  // Telas de Carregamento e Bloqueio
  if (loading) return <div className="min-h-screen bg-yami-dark flex items-center justify-center animate-pulse text-kawaii-pink">❤️ Verificando...</div>;
  
  if (!user) return (
    <div className="min-h-screen bg-yami-dark flex flex-col items-center justify-center text-white space-y-4">
        <div className="text-6xl animate-bounce">🔒</div>
        <p className="text-gray-400 text-sm">Acesso Restrito</p>
        <p className="text-xs text-gray-600">Use o link correto com a chave.</p>
    </div>
  );

  // --- ÁREA LOGADA ---
  return (
    <div className="min-h-screen bg-yami-dark text-white relative overflow-hidden font-body flex justify-center">
      
      <Pulso />

      <div className="relative z-10 w-full max-w-md h-screen flex flex-col bg-black/30 backdrop-blur-sm border-x border-white/5">
        
        {/* HEADER */}
        <header className="flex justify-between items-center p-6 pb-2 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-kawaii-pink tracking-widest uppercase shadow-neon">Projeto Nós</h1>
            <p className="text-xs text-gray-400 mt-1">Conectado: <span className="text-kawaii-cyan animate-pulse">{user.nome}</span></p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-kawaii-purple flex items-center justify-center bg-black/40 shadow-lg">👾</div>
        </header>

        {/* ÁREA PRINCIPAL (GERENCIADOR DE TELAS) */}
        <main className="flex-1 overflow-hidden relative">
            
            {/* 1. HOME E MENU */}
            {tab === 'home' && <HomeContent />}
            {tab === 'menu' && <MenuApps setTab={setTab} />}
            
            {/* 2. FUNCIONALIDADES */}
            {tab === 'jardim' && <Jardim user={user} />}
            {tab === 'saude' && <Saude user={user} />}
            {tab === 'cartas' && <Cartas user={user} />}
            {tab === 'sonhos' && <Sonhos user={user} />}
            {tab === 'ciclo' && <Ciclo user={user} />}
            {tab === 'cofre' && <Cofre user={user} />}
            {tab === 'metas' && <Metas user={user} />}
            {tab === 'fotos' && <Galeria user={user} />}
            {tab === 'gacha' && <Gacha user={user} />}
            {tab === 'arcade' && <Arcade user={user} />}
            
            {/* 3. SEGURANÇA */}
            {tab === 'sos' && <SalaPanico />}

        </main>

        {/* RODAPÉ SIMPLIFICADO */}
        <footer className="p-6 pt-2 shrink-0">
            <div className="bg-yami-gray/90 backdrop-blur-xl rounded-2xl p-2 border border-white/10 shadow-2xl flex justify-around items-center">
                <button onClick={() => setTab('menu')} className={`p-3 text-2xl transition hover:scale-110 ${tab === 'menu' ? 'text-kawaii-purple scale-110' : 'text-gray-400'}`}>📱</button>
                <button onClick={() => setTab('home')} className={`p-3 text-2xl transition hover:scale-110 ${tab === 'home' ? 'text-kawaii-pink scale-125' : 'text-gray-400'}`}>🏠</button>
                <button onClick={() => setTab('sos')} className={`p-3 text-2xl transition hover:scale-110 ${tab === 'sos' ? 'text-red-500 animate-pulse' : 'text-red-900'}`}>🚨</button>
            </div>
        </footer>

      </div>
    </div>
  );
}

// --- HOME CONTENT ---
const HomeContent = () => {
    const [tempo, setTempo] = useState({ anos:0, meses:0, semanas:0, dias:0, horas:0, minutos:0, segundos:0 });
    const [bio, setBio] = useState({ sangue:0, celulas:0 });
    
    useEffect(() => {
        const DATA_INICIO = new Date(2025, 8, 22, 21, 47, 0).getTime();

        const timer = setInterval(() => {
            const agora = new Date().getTime();
            const diferenca = agora - DATA_INICIO;
            if (diferenca < 0) return;
            const segTot = Math.floor(diferenca/1000);
            const diasTot = Math.floor(segTot/86400);
            setTempo({
                anos: Math.floor(diasTot/365),
                meses: Math.floor((diasTot%365)/30),
                semanas: Math.floor(((diasTot%365)%30)/7),
                dias: Math.floor(((diasTot%365)%30)%7),
                horas: Math.floor((segTot%86400)/3600),
                minutos: Math.floor((segTot%3600)/60),
                segundos: segTot%60
            });
            setBio({
                sangue: (segTot * 0.0833).toFixed(1).replace('.',','),
                celulas: new Intl.NumberFormat('pt-BR').format(Math.floor(segTot * 3819444))
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []); 

    return (
        <div className="flex flex-col items-center text-center space-y-6 p-6 h-full overflow-y-auto scrollbar-hide animate-fade-in">
            <h2 className="text-gray-500 text-[10px] tracking-[0.4em] uppercase">TEMPO DE CONEXÃO</h2>
            <div className="w-full bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="grid grid-cols-4 gap-2 text-center mb-3">
                    <TimeBox valor={tempo.anos} label="Anos" cor="text-kawaii-purple" />
                    <TimeBox valor={tempo.meses} label="Meses" cor="text-kawaii-purple" />
                    <TimeBox valor={tempo.semanas} label="Sem" cor="text-kawaii-purple" />
                    <TimeBox valor={tempo.dias} label="Dias" cor="text-kawaii-purple" />
                </div>
                <div className="h-px w-1/2 bg-white/10 mx-auto mb-3"></div>
                <div className="grid grid-cols-3 gap-2 text-center max-w-[80%] mx-auto">
                    <TimeBox valor={tempo.horas} label="Horas" cor="text-kawaii-pink" />
                    <TimeBox valor={tempo.minutos} label="Min" cor="text-kawaii-pink" />
                    <TimeBox valor={tempo.segundos} label="Seg" cor="text-kawaii-pink" />
                </div>
            </div>
            <div className="w-full space-y-3 mt-2">
                <h2 className="text-medical-red text-[10px] tracking-[0.4em] uppercase flex items-center justify-center gap-2 opacity-80"><span className="animate-pulse">●</span> Dados Biológicos</h2>
                <BioCard icon="🩸" label="Sangue Bombeado" sub="enquanto te amo" val={bio.sangue} unit="Litros" color="text-medical-red" border="border-medical-red/20" />
                <BioCard icon="🧬" label="Células Renovadas" sub="por te amar" val={bio.celulas} unit="Unidades" color="text-kawaii-cyan" border="border-kawaii-cyan/20" />
            </div>
            <p className="text-[10px] text-gray-500 italic font-light pt-4 opacity-50">"Desde 22/09/2025, minha biologia é sua."</p>
        </div>
    );
};

const TimeBox = ({ valor, label, cor }) => (
    <div className="bg-black/40 rounded-lg p-2 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center min-h-[60px]">
        <span className={`text-xl font-bold font-pixel ${cor} leading-none`}>{String(valor).padStart(2, '0')}</span>
        <span className="text-[8px] uppercase text-gray-500 mt-1 font-bold">{label}</span>
    </div>
);

const BioCard = ({ icon, label, sub, val, unit, color, border }) => (
    <div className={`bg-yami-gray/40 p-4 rounded-xl border ${border} relative overflow-hidden group hover:bg-black/40 transition duration-500`}>
        <div className="absolute -right-4 -top-4 text-6xl opacity-5 rotate-12 group-hover:scale-110 group-hover:opacity-10 transition">{icon}</div>
        <div className="flex justify-between items-end relative z-10">
            <div className="text-left"><p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">{label}</p><p className="text-xs text-gray-500">{sub}</p></div>
            <div className="text-right"><p className={`text-lg font-pixel ${color} leading-none`}>{val}</p><p className={`text-[10px] ${color}`}>{unit}</p></div>
        </div>
    </div>
);

export default App;