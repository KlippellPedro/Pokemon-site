import sqlite3
from config import DATABASE
from werkzeug.security import generate_password_hash

def get_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor=conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS usuarios(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        cpf TEXT,
        telefone TEXT,
        senha TEXT,
        foto TEXT,
        is_admin INTEGER DEFAULT 0,
        precisa_resetar INTEGER DEFAULT 0,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')

    # Tabela para salvar os 6 pokemons de cada usuário
    cursor.execute('''CREATE TABLE IF NOT EXISTS pokemon_equipe(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        pokemon_id_api INTEGER NOT NULL,
        nome_pokemon TEXT NOT NULL,
        sprite_url TEXT,
        tipo TEXT,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )''')
    
    # Tabela para salvar todos os pokemons que o usuário ganhou em pacotes (Coleção/Inventário)
    cursor.execute('''CREATE TABLE IF NOT EXISTS pokemon_colecao(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        pokemon_id_api INTEGER NOT NULL,
        nome_pokemon TEXT NOT NULL,
        sprite_url TEXT,
        tipo TEXT,
        data_obtencao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
    )''')

    # Tabela para configurações globais do Admin (Destaque e Minigames)
    cursor.execute('''CREATE TABLE IF NOT EXISTS configuracoes(
        chave TEXT PRIMARY KEY,
        valor TEXT
    )''')
    
    # Verifica se o administrador padrão já existe antes de inserir
    admin_email = 'admin@gmail.com'
    cursor.execute("SELECT id FROM usuarios WHERE email = ?", (admin_email,))
    if not cursor.fetchone():
        cursor.execute('''INSERT INTO usuarios(nome, email, senha, foto, is_admin) 
                       VALUES (?, ?, ?, ?, 1)''', 
                       ('Admin', admin_email, generate_password_hash('123456'), 'default.png'))

    conn.commit()
    cursor.close()
    conn.close()