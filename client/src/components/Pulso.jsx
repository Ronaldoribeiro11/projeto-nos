const Pulso = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      
      {/* 1. A Linha do Batimento (Mais alta e visível) */}
      <div className="absolute top-1/2 left-0 w-full h-40 -translate-y-1/2 opacity-30">
        <svg 
          className="w-full h-full" 
          viewBox="0 0 1000 100" 
          preserveAspectRatio="none"
        >
            <path 
                d="M-100,50 L400,50 L420,10 L440,90 L460,50 L1100,50" 
                fill="none" 
                stroke="#ff7eb6" 
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
                className="animate-pulse-line"
            />
        </svg>
      </div>
      
      {/* 2. O Brilho de Fundo (Aura) */}
      <div className="absolute inset-0 bg-gradient-to-t from-yami-dark via-transparent to-yami-dark"></div>
      
      {/* 3. A luz central pulsante */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-kawaii-pink rounded-full blur-[80px] opacity-10 animate-pulse"></div>
    </div>
  );
};

export default Pulso;