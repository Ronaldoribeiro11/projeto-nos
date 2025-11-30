const pool = require('./db');

const criarTabelas = async () => {
  try {
    console.log('⏳ Atualizando Banco de Dados...');

    // 1. USUÁRIOS (Atualizado com Economia)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(50) NOT NULL,
        magic_code VARCHAR(50) UNIQUE NOT NULL,
        papel VARCHAR(20) DEFAULT 'user',
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Tenta adicionar as colunas novas se elas não existirem (ALTER TABLE)
    // Isso é seguro: se já tiver, ele ignora o erro
    try { await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS moedas INTEGER DEFAULT 0'); } catch(e){}
    try { await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS moedas_hoje INTEGER DEFAULT 0'); } catch(e){}
    try { await pool.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultimo_dia_game DATE DEFAULT CURRENT_DATE'); } catch(e){}

    // 2. Diários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS diarios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        humor VARCHAR(20) NOT NULL,
        nota TEXT,
        precisa_atencao BOOLEAN DEFAULT FALSE,
        data_registro DATE DEFAULT CURRENT_DATE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(usuario_id, data_registro)
      );
    `);

    // 3. Saúde
    await pool.query(`
      CREATE TABLE IF NOT EXISTS saude (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        tipo VARCHAR(20) NOT NULL,
        detalhe VARCHAR(50) NOT NULL,
        intensidade INTEGER DEFAULT 0,
        data_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Cartas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cartas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(100) NOT NULL,
        conteudo TEXT NOT NULL,
        foi_lida BOOLEAN DEFAULT FALSE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Sonhos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sonhos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        texto TEXT NOT NULL,
        tipo VARCHAR(20) NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Ciclo Lunar
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ciclos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        data_ultima_menstruacao DATE NOT NULL,
        duracao_ciclo INTEGER DEFAULT 28,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Cofre
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cofre (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        valor DECIMAL(10,2) NOT NULL,
        descricao VARCHAR(50),
        data_transacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Metas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS metas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'bloqueado',
        ordem INTEGER DEFAULT 0,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Galeria
    await pool.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        imagem TEXT NOT NULL,
        legenda VARCHAR(200),
        data_foto DATE DEFAULT CURRENT_DATE,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. PREMIOS / GACHA (NOVO) 🎰
    await pool.query(`
      CREATE TABLE IF NOT EXISTS premios (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        nome VARCHAR(100) NOT NULL,
        tipo VARCHAR(20) NOT NULL, 
        status VARCHAR(20) DEFAULT 'disponivel',
        data_ganho DATE DEFAULT CURRENT_DATE
      );
    `);
    console.log('✅ Tabela "premios" OK.');

    // Dados Iniciais
    await pool.query(`
      INSERT INTO metas (titulo, status, ordem)
      SELECT 'Primeiro Encontro', 'concluido', 1
      WHERE NOT EXISTS (SELECT 1 FROM metas);
      
      INSERT INTO usuarios (nome, magic_code, papel, moedas)
      VALUES ('Ela', 'amor', 'user', 10), ('Você', 'mestre', 'admin', 999)
      ON CONFLICT (magic_code) DO NOTHING;
    `);
    
    console.log('🎉 SISTEMA COMPLETO! Banco atualizado.');
    process.exit();
  } catch (err) {
    console.error('❌ Erro:', err);
    process.exit(1);
  }
};

criarTabelas();