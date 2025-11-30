import { useState, useEffect } from 'react';
import axios from 'axios';

const Galeria = ({ user }) => {
  const [fotos, setFotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Estado para nova foto
  const [novaFoto, setNovaFoto] = useState(null); // Preview da imagem
  const [legenda, setLegenda] = useState('');
  const [dataFoto, setDataFoto] = useState(new Date().toISOString().split('T')[0]);

  // 1. DEFINIR A FUNÇÃO PRIMEIRO (Movida para cima para evitar erro)
  const carregarGaleria = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/galeria');
      if (res.data.success) setFotos(res.data.data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  // 2. CHAMAR A FUNÇÃO DEPOIS
  useEffect(() => {
    carregarGaleria();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Converte arquivo para texto (Base64)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNovaFoto(reader.result); // Guarda a string da imagem
      };
      reader.readAsDataURL(file);
    }
  };

  const salvarFoto = async () => {
    if (!novaFoto) return;
    setUploading(true);
    try {
      await axios.post('http://localhost:3001/api/galeria', {
        usuario_id: user.id,
        imagem: novaFoto,
        legenda,
        data_foto: dataFoto
      });
      
      // Limpa tudo
      setNovaFoto(null);
      setLegenda('');
      carregarGaleria();
      alert('📸 Foto salva com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar. A foto pode ser muito grande.');
    }
    setUploading(false);
  };

  if (loading) return <div className="text-center text-indigo-400 mt-10 animate-pulse">Revelando fotos...</div>;

  return (
    <div className="w-full h-full flex flex-col p-4 animate-fade-in font-body overflow-y-auto custom-scrollbar">
      <h2 className="text-indigo-400 text-center font-pixel text-lg mb-2 tracking-widest">
        Cine-Galeria
      </h2>
      <p className="text-center text-xs text-gray-500 mb-6">Nossas memórias guardadas pra sempre.</p>

      {/* ÁREA DE UPLOAD */}
      <div className="bg-gray-900/50 border border-indigo-900/50 p-4 rounded-xl mb-8">
        {!novaFoto ? (
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-indigo-500/50 rounded-lg cursor-pointer hover:bg-indigo-500/10 transition">
                <span className="text-2xl mb-1">📷</span>
                <span className="text-xs text-indigo-300 uppercase tracking-widest">Adicionar Nova Foto</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
        ) : (
            <div className="flex flex-col gap-3">
                <img src={novaFoto} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-white/10" />
                <input 
                    type="text" 
                    placeholder="Escreva uma legenda..." 
                    value={legenda}
                    onChange={(e) => setLegenda(e.target.value)}
                    className="bg-black/30 text-white p-2 rounded text-sm border border-white/10 outline-none focus:border-indigo-500"
                />
                <input 
                    type="date" 
                    value={dataFoto}
                    onChange={(e) => setDataFoto(e.target.value)}
                    className="bg-black/30 text-white p-2 rounded text-sm border border-white/10 outline-none"
                />
                <div className="flex gap-2">
                    <button onClick={salvarFoto} disabled={uploading} className="flex-1 bg-indigo-600 text-white py-2 rounded font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition disabled:opacity-50">
                        {uploading ? 'Salvando...' : 'Salvar no Álbum'}
                    </button>
                    <button onClick={() => setNovaFoto(null)} className="px-3 py-2 bg-red-900/30 text-red-400 rounded text-xs hover:bg-red-900/50">
                        ❌
                    </button>
                </div>
            </div>
        )}
      </div>

      {/* GRADE DE FOTOS (Corrigida para altura automática) */}
      <div className="grid grid-cols-2 gap-3 pb-20 items-start">
        {fotos.map((foto) => (
            <div key={foto.id} className="relative group break-inside-avoid rounded-xl overflow-hidden border border-white/10 bg-gray-800">
                <img 
                    src={foto.imagem} 
                    alt={foto.legenda} 
                    className="w-full h-auto transition duration-500 group-hover:scale-110 block" 
                    loading="lazy"
                />
                
                {/* Overlay com legenda (aparece ao clicar ou passar mouse) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <p className="text-white text-xs font-bold line-clamp-2">{foto.legenda}</p>
                    <p className="text-[9px] text-gray-400 mt-1">{new Date(foto.data_foto).toLocaleDateString('pt-BR')}</p>
                </div>
            </div>
        ))}
      </div>
      
      {fotos.length === 0 && <p className="text-center text-gray-600 text-xs mt-10">Nenhuma foto no álbum ainda.</p>}

    </div>
  );
};

export default Galeria;