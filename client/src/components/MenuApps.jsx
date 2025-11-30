const MenuApps = ({ setTab }) => {
  
  // Lista de todos os "Apps" do sistema
  const apps = [
    // --- JÁ EXISTEM ---
    { id: 'jardim', label: 'Jardim', icon: '🌿', color: 'text-green-400', border: 'border-green-400/30' },
    { id: 'saude', label: 'Enfermaria', icon: '💊', color: 'text-medical-red', border: 'border-medical-red/30' },
    { id: 'cartas', label: 'Correio', icon: '💌', color: 'text-kawaii-purple', border: 'border-kawaii-purple/30' },
    
    // --- VAMOS CRIAR AGORA (Fase Segurança) ---
    { id: 'sonhos', label: 'Pesadelos', icon: '👻', color: 'text-gray-400', border: 'border-gray-500/30' },
    
    // --- FUTUROS (Vida) ---
    { id: 'ciclo', label: 'Ciclo', icon: '🩸', color: 'text-pink-600', border: 'border-pink-600/30' },
    { id: 'cofre', label: 'Cofre', icon: '🐷', color: 'text-yellow-400', border: 'border-yellow-400/30' },
    { id: 'metas', label: 'Tesouro', icon: '🗺️', color: 'text-blue-400', border: 'border-blue-400/30' },
    
    // --- FUTUROS (Lazer) ---
    { id: 'fotos', label: 'Galeria', icon: '📸', color: 'text-indigo-400', border: 'border-indigo-400/30' },
    { id: 'gacha', label: 'Sorte', icon: '🎲', color: 'text-purple-300', border: 'border-purple-300/30' },
   
  ];

  return (
    <div className="w-full h-full flex flex-col p-6 animate-fade-in">
      <h2 className="text-gray-500 text-center font-pixel text-xs tracking-[0.3em] uppercase mb-8">
        Menu de Aplicativos
      </h2>

      {/* Grade de Ícones */}
      <div className="grid grid-cols-3 gap-4 overflow-y-auto pb-20 custom-scrollbar">
        {apps.map((app) => (
          <button
            key={app.id}
            onClick={() => setTab(app.id)}
            className={`flex flex-col items-center justify-center aspect-square bg-black/40 rounded-2xl border ${app.border} hover:bg-white/5 active:scale-95 transition-all group`}
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition duration-300 filter drop-shadow-md">
                {app.icon}
            </span>
            <span className={`text-[10px] uppercase font-bold tracking-wider ${app.color}`}>
                {app.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuApps;