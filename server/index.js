require('dotenv').config(); // Carrega o arquivo .env
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const cloudinary = require('cloudinary').v2; // Importa Cloudinary

const app = express();

// Configuração para aceitar dados grandes (necessário para o upload de fotos)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// --- CONFIGURAÇÃO DO CLOUDINARY ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get('/', (req, res) => {
  res.send('Servidor do Projeto Nós está Online! 🚀');
});

// ================= ROTAS =================

// ROTA 1: LOGIN MÁGICO
app.post('/api/login', async (req, res) => {
  const { magic_code } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE magic_code = $1', [magic_code]);
    if (result.rows.length > 0) res.json({ success: true, user: result.rows[0] });
    else res.status(401).json({ success: false, message: 'Código inválido' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ROTA 2: JARDIM (Salvar)
app.post('/api/diario', async (req, res) => {
  const { usuario_id, humor, nota } = req.body;
  const precisa_atencao = ['triste', 'doente', 'raiva'].includes(humor);
  try {
    await pool.query(
      'INSERT INTO diarios (usuario_id, humor, nota, precisa_atencao, data_registro) VALUES ($1, $2, $3, $4, CURRENT_DATE) ON CONFLICT (usuario_id, data_registro) DO UPDATE SET humor = $2, nota = $3, precisa_atencao = $4, criado_em = CURRENT_TIMESTAMP',
      [usuario_id, humor, nota, precisa_atencao]
    );
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao salvar' }); }
});

// ROTA 3: JARDIM (Histórico)
app.get('/api/jardim', async (req, res) => {
  try {
    const result = await pool.query('SELECT d.*, u.nome FROM diarios d JOIN usuarios u ON d.usuario_id = u.id ORDER BY data_registro DESC LIMIT 7');
    res.json({ success: true, data: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar' }); }
});

// ROTA 4: SAÚDE
app.post('/api/saude', async (req, res) => {
  const { usuario_id, tipo, detalhe, intensidade } = req.body;
  try {
    await pool.query('INSERT INTO saude (usuario_id, tipo, detalhe, intensidade) VALUES ($1, $2, $3, $4)', [usuario_id, tipo, detalhe, intensidade || 0]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao salvar' }); }
});

// ROTA 5: CARTAS
app.post('/api/cartas', async (req, res) => {
  const { titulo, conteudo } = req.body;
  try {
    await pool.query('INSERT INTO cartas (titulo, conteudo) VALUES ($1, $2)', [titulo, conteudo]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao enviar' }); }
});

app.get('/api/cartas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cartas ORDER BY criado_em DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar' }); }
});

app.put('/api/cartas/:id/ler', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE cartas SET foi_lida = TRUE WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao ler' }); }
});

// ROTA 6: SONHOS
app.post('/api/sonhos', async (req, res) => {
  const { usuario_id, texto, tipo } = req.body;
  try {
    await pool.query('INSERT INTO sonhos (usuario_id, texto, tipo) VALUES ($1, $2, $3)', [usuario_id, texto, tipo]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao salvar sonho' }); }
});

app.get('/api/sonhos/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM sonhos WHERE usuario_id = $1 AND tipo = 'bom' ORDER BY data_criacao DESC", [usuario_id]);
    res.json({ success: true, data: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar sonhos' }); }
});

// ROTA 7: CICLO LUNAR
app.post('/api/ciclo', async (req, res) => {
  const { usuario_id, data_ultima, duracao } = req.body;
  try {
    const check = await pool.query('SELECT * FROM ciclos WHERE usuario_id = $1', [usuario_id]);
    if (check.rows.length > 0) {
      await pool.query('UPDATE ciclos SET data_ultima_menstruacao = $1, duracao_ciclo = $2 WHERE usuario_id = $3', [data_ultima, duracao || 28, usuario_id]);
    } else {
      await pool.query('INSERT INTO ciclos (usuario_id, data_ultima_menstruacao, duracao_ciclo) VALUES ($1, $2, $3)', [usuario_id, data_ultima, duracao || 28]);
    }
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao salvar ciclo' }); }
});

app.get('/api/ciclo/:usuario_id', async (req, res) => {
  const { usuario_id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM ciclos WHERE usuario_id = $1', [usuario_id]);
    if (result.rows.length > 0) res.json({ success: true, data: result.rows[0] });
    else res.json({ success: false, message: 'Nenhum ciclo configurado' });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar ciclo' }); }
});

// ROTA 8: COFRE
app.post('/api/cofre', async (req, res) => {
  const { usuario_id, valor, descricao } = req.body;
  try {
    await pool.query('INSERT INTO cofre (usuario_id, valor, descricao) VALUES ($1, $2, $3)', [usuario_id, valor, descricao]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao depositar' }); }
});

app.get('/api/cofre', async (req, res) => {
  try {
    const historico = await pool.query('SELECT * FROM cofre ORDER BY data_transacao DESC LIMIT 10');
    const total = await pool.query('SELECT SUM(valor) as saldo FROM cofre');
    res.json({ success: true, saldo: total.rows[0].saldo || 0, historico: historico.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao abrir cofre' }); }
});

// ROTA 9: METAS
app.get('/api/metas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM metas ORDER BY ordem ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar mapa' }); }
});

app.put('/api/metas/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE metas SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao atualizar fase' }); }
});

app.post('/api/metas', async (req, res) => {
  const { titulo, ordem } = req.body;
  try {
    await pool.query('INSERT INTO metas (titulo, ordem) VALUES ($1, $2)', [titulo, ordem]);
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao criar fase' }); }
});

// ROTA 10: GALERIA DE FOTOS (PROFISSIONAL)
app.post('/api/galeria', async (req, res) => {
  const { usuario_id, imagem, legenda, data_foto } = req.body;
  try {
    // 1. Upload para o Cloudinary (Nuvem)
    const uploadRes = await cloudinary.uploader.upload(imagem, {
      folder: 'projeto_nos',
      resource_type: 'image'
    });

    // 2. Salva o LINK SEGURO no banco
    await pool.query(
      'INSERT INTO galeria (usuario_id, imagem, legenda, data_foto) VALUES ($1, $2, $3, $4)',
      [usuario_id, uploadRes.secure_url, legenda, data_foto]
    );

    res.json({ success: true, url: uploadRes.secure_url });
  } catch (err) {
    console.error('Erro Cloudinary:', err);
    res.status(500).json({ error: 'Erro ao salvar foto na nuvem' });
  }
});

app.get('/api/galeria', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM galeria ORDER BY data_foto DESC, criado_em DESC');
    res.json({ success: true, data: result.rows });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro ao buscar fotos' }); }
});

// =================== ROTA 11: ARCADE & GACHA (NOVO) ===================

// GANHAR MOEDAS (Limite 5/dia)
app.post('/api/arcade/ganhar', async (req, res) => {
  const { usuario_id } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [usuario_id]);
    const user = userResult.rows[0];

    // Verifica se mudou o dia
    const hoje = new Date().toISOString().split('T')[0];
    // Se user.ultimo_dia_game for null (primeira vez), usa uma data antiga
    const dataBanco = user.ultimo_dia_game ? new Date(user.ultimo_dia_game).toISOString().split('T')[0] : '2000-01-01';
    
    let moedasHoje = user.moedas_hoje;
    if (hoje !== dataBanco) {
      moedasHoje = 0; // Novo dia, reseta
    }

    if (moedasHoje >= 5) {
      return res.json({ success: false, message: 'Limite diário atingido!', saldo: user.moedas });
    }

    await pool.query(
      'UPDATE usuarios SET moedas = moedas + 1, moedas_hoje = $1, ultimo_dia_game = CURRENT_DATE WHERE id = $2', 
      [moedasHoje + 1, usuario_id]
    );

    res.json({ success: true, novoSaldo: user.moedas + 1 });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro no arcade' }); }
});

// PEGAR SALDO
app.get('/api/usuario/:id/saldo', async (req, res) => {
  try {
    const result = await pool.query('SELECT moedas FROM usuarios WHERE id = $1', [req.params.id]);
    res.json({ success: true, moedas: result.rows[0].moedas });
  } catch (err) { res.status(500).json({ error: 'Erro saldo' }); }
});

// GIRAR O GACHA
app.post('/api/gacha/girar', async (req, res) => {
  const { usuario_id } = req.body;
  const CUSTO_GIRO = 10;

  try {
    // 1. Verifica giro grátis do dia
    const checkDiario = await pool.query(
      'SELECT * FROM premios WHERE usuario_id = $1 AND data_ganho = CURRENT_DATE', 
      [usuario_id]
    );
    
    // Se já ganhou hoje, tem que pagar
    if (checkDiario.rows.length > 0) {
      const userRes = await pool.query('SELECT moedas FROM usuarios WHERE id = $1', [usuario_id]);
      const saldo = userRes.rows[0].moedas;

      if (saldo < CUSTO_GIRO) {
        return res.json({ success: false, message: `Sem giro grátis hoje! Você precisa de ${CUSTO_GIRO} moedas.` });
      }
      // Desconta moedas
      await pool.query('UPDATE usuarios SET moedas = moedas - $1 WHERE id = $2', [CUSTO_GIRO, usuario_id]);
    }

    // 2. LISTA DE 40 PRÊMIOS (20 Fofos / 20 Safados)
    const premiosPossiveis = [
      // FOFOS
      { nome: 'Vale Massagem Relaxante', tipo: 'vale' },
      { nome: 'Rolê de Moto (Destino Surpresa)', tipo: 'vale' },
      { nome: 'Jantarzinho', tipo: 'vale' },
      { nome: 'Café da manhã na cama', tipo: 'vale' },
      { nome: 'Noite de Filmes + Pipoca', tipo: 'vale' },
      { nome: 'Açaí/Sorvete', tipo: 'vale' },
      { nome: 'Sessão de Skincare juntos', tipo: 'vale' },
      { nome: 'Vale um Pedido (Qualquer coisa fofa)', tipo: 'vale' },
      { nome: 'Dia de Princesa (Mimos)', tipo: 'vale' },
      { nome: 'Uma cartinha de amor à mão', tipo: 'vale' },
      { nome: 'Passeio no Parque/Praia', tipo: 'vale' },
      { nome: 'Chocolate/fini Favorito Agora', tipo: 'vale' },
      { nome: 'Eu lavo a louça/arrumo tudo hoje', tipo: 'vale' },
      { nome: 'Vale um Abraço Apertado', tipo: 'vale' },
      { nome: 'Pentear e fazer cafuné no seu cabelo', tipo: 'vale' },
      { nome: 'Pagar para fazerem suas unhas', tipo: 'vale' },
      { nome: 'Dormir de conchinha a noite toda', tipo: 'vale' },
      { nome: 'Ouvir suas reclamações sem julgar', tipo: 'vale' },
      { nome: 'Um elogio sincero a cada hora', tipo: 'vale' },
      { nome: 'Beijos na testa o dia todo', tipo: 'vale' },

      // SAFADOS
      { nome: 'Vale Dedada Caprichada', tipo: 'safado' },
      { nome: 'Oral até as pernas tremerem', tipo: 'safado' },
      { nome: 'Massagem no corpo todo (+18)', tipo: 'safado' },
      { nome: 'Sexo na parte de cima da casa', tipo: 'safado' },
      { nome: 'assistir seu namorado batendo uma pra vc', tipo: 'safado' },
      { nome: 'Rapidinha onde você quiser', tipo: 'safado' },
      { nome: 'Hoje eu sou seu pra vc fazer oq quiser', tipo: 'safado' },
      { nome: 'Vale Gozar quantas vezes quiser', tipo: 'safado' },
      { nome: 'Sussurros safados no ouvido', tipo: 'safado' },
      { nome: 'Uma foda bem gostosa e lenta', tipo: 'safado' },
      { nome: 'Sexo no banheiro', tipo: 'safado' },
      { nome: 'Uma rapidinha antes de sair', tipo: 'safado' },
      { nome: 'Te acordar com beijos e carícias', tipo: 'safado' },
      { nome: 'Striptease pro seu namorado', tipo: 'safado' },
      { nome: 'Comer algo com a porra do seu namorado', tipo: 'safado' },
      { nome: 'Beijos no corpo todo', tipo: 'safado' },
      { nome: 'Dominar seu namorado na cama hoje', tipo: 'safado' },
      { nome: 'Ser dominada pelo seu namorado hoje', tipo: 'safado' },
      { nome: 'Vale um nude exclusivo agora', tipo: 'safado' },
      { nome: 'Realizar uma fantasia sua', tipo: 'safado' },
    ];

    // 3. Sorteio
    const sorteado = premiosPossiveis[Math.floor(Math.random() * premiosPossiveis.length)];

    // 4. Salva prêmio
    await pool.query(
      'INSERT INTO premios (usuario_id, nome, tipo, status) VALUES ($1, $2, $3, $4)',
      [usuario_id, sorteado.nome, sorteado.tipo, 'disponivel']
    );

    res.json({ success: true, premio: sorteado });

  } catch (err) { console.error(err); res.status(500).json({ error: 'Erro na máquina' }); }
});

// LISTAR INVENTÁRIO
app.get('/api/gacha/inventario/:usuario_id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM premios WHERE usuario_id = $1 ORDER BY status ASC, data_ganho DESC', [req.params.usuario_id]);
    res.json({ success: true, data: result.rows });
  } catch (err) { res.status(500).json({ error: 'Erro inventario' }); }
});

// USAR PRÊMIO
app.put('/api/gacha/usar/:id', async (req, res) => {
  try {
    await pool.query("UPDATE premios SET status = 'usado' WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Erro ao usar' }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor FINAL rodando na porta ${PORT}!`);
});