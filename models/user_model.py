from database import get_connection
from werkzeug.security import generate_password_hash

def create_user(nome, email, senha, is_admin=0, foto='default.png'):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO usuarios (nome,email,senha,is_admin,foto) VALUES (?,?,?,?,?)',(nome,email,senha,is_admin,foto))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao criar usuário: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def get_total_team_pokemons(usuario_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM pokemon_equipe WHERE usuario_id = ?', (usuario_id,))
    count = cursor.fetchone()[0]
    conn.close()
    return count

def get_total_collection_pokemons(usuario_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM pokemon_colecao WHERE usuario_id = ?', (usuario_id,))
    count = cursor.fetchone()[0]
    conn.close()
    return count


# --- FUNÇÕES PARA EQUIPE ---
def add_pokemon_to_team(usuario_id, pokemon_id_api, nome_pokemon, sprite_url, tipo):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        # Verifica se já existem 6 pokémons na equipe
        cursor.execute('SELECT COUNT(*) FROM pokemon_equipe WHERE usuario_id = ?', (usuario_id,))
        if cursor.fetchone()[0] >= 6:
            return False, "Equipe cheia!"
        
        cursor.execute('''INSERT INTO pokemon_equipe (usuario_id, pokemon_id_api, nome_pokemon, sprite_url, tipo) 
                          VALUES (?, ?, ?, ?, ?)''', (usuario_id, pokemon_id_api, nome_pokemon, sprite_url, tipo))
        conn.commit()
        return True, "Adicionado à equipe!"
    except Exception as e:
        print(f"Erro ao salvar equipe: {e}")
        return False, str(e)
    finally:
        if 'conn' in locals(): conn.close()

def get_user_team(usuario_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM pokemon_equipe WHERE usuario_id = ?', (usuario_id,))
    team = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return team

def remove_pokemon_from_team(usuario_id, pokemon_id_api):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM pokemon_equipe WHERE usuario_id = ? AND pokemon_id_api = ?', (usuario_id, pokemon_id_api))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao remover da equipe: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

# --- FUNÇÕES PARA COLEÇÃO (PACOTES) ---
def add_pokemon_to_collection(usuario_id, pokemon_id_api, nome_pokemon, sprite_url, tipo):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('''INSERT INTO pokemon_colecao (usuario_id, pokemon_id_api, nome_pokemon, sprite_url, tipo) 
                          VALUES (?, ?, ?, ?, ?)''', (usuario_id, pokemon_id_api, nome_pokemon, sprite_url, tipo))
        conn.commit()
    finally:
        if 'conn' in locals(): conn.close()

def get_user_collection(usuario_id, nome=None, tipo=None):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        query = 'SELECT * FROM pokemon_colecao WHERE usuario_id = ?'
        params = [usuario_id]

        if nome:
            query += ' AND nome_pokemon LIKE ?'
            params.append(f'%{nome}%')
        
        if tipo:
            query += ' AND tipo = ?'
            params.append(tipo)

        query += ' ORDER BY data_obtencao DESC'
        cursor.execute(query, params)
        collection = [dict(row) for row in cursor.fetchall()]
        return collection
    finally:
        if 'conn' in locals(): conn.close()

def remove_pokemon_from_collection(usuario_id, pokemon_id_api):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM pokemon_colecao WHERE usuario_id = ? AND pokemon_id_api = ?', (usuario_id, pokemon_id_api))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao remover da coleção: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def update_password_by_email(email, nova_senha):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE usuarios SET senha = ? WHERE email = ?', (nova_senha, email))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao redefinir senha: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def get_user_by_email(email):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE email = ?', (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

def get_user_by_id(user_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM usuarios WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    return user

def get_all_users():
    conn=get_connection()
    cursor=conn.cursor()
    cursor.execute('SELECT * FROM usuarios')
    users=cursor.fetchall()
    cursor.close()
    conn.close()
    return [dict(row) for row in users]

def search_users_db(query, tipo=None, data=None):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Se a query for um número, pesquisa também pelo ID exato
    if query.isdigit():
        sql = "SELECT id, nome, email, foto, is_admin FROM usuarios WHERE (id = ? OR nome LIKE ? OR email LIKE ?)"
        params = [int(query), f'%{query}%', f'%{query}%']
    else:
        sql = "SELECT id, nome, email, foto, is_admin FROM usuarios WHERE (nome LIKE ? OR email LIKE ?)"
        params = [f'%{query}%', f'%{query}%']

    if tipo:
        is_admin = 1 if tipo == 'admin' else 0
        sql += " AND is_admin = ?"
        params.append(is_admin)

    if data:
        sql += " AND DATE(data_cadastro) = ?"
        params.append(data)

    cursor.execute(sql, params)
    users = [dict(row) for row in cursor.fetchall()]
    for u in users:
        u['tipo'] = 'admin' if u['is_admin'] == 1 else 'user'
    conn.close()
    return users

def get_dashboard_stats():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM usuarios")
    total_usuarios = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM pokemon_colecao")
    total_capturas = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM usuarios WHERE is_admin = 0")
    total_comuns = cursor.fetchone()[0]
    conn.close()
    return {
        'total_usuarios': total_usuarios,
        'total_capturas': total_capturas,
        'novos_cadastros': total_comuns
    }

def update_user_admin(user_id, nome, email, tipo):
    is_admin = 1 if tipo == 'admin' else 0
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE usuarios SET nome = ?, email = ?, is_admin = ? WHERE id = ?', 
                       (nome, email, is_admin, user_id))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao atualizar admin: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def reset_password_db(user_id, nova_senha, forcar_reset=True):
    senha_hash = generate_password_hash(nova_senha)
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('UPDATE usuarios SET senha = ?, precisa_resetar = ? WHERE id = ?', 
                       (senha_hash, 1 if forcar_reset else 0, user_id))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao resetar senha: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def update_user(user_id, nome, email, foto, senha=None):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        if senha:
            cursor.execute('UPDATE usuarios SET nome = ?, email = ?, senha = ?, foto = ?, precisa_resetar = 0 WHERE id = ?', (nome, email, senha, foto, user_id))
        else:
            cursor.execute('UPDATE usuarios SET nome = ?, email = ?, foto = ? WHERE id = ?', (nome, email, foto, user_id))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao atualizar usuário: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def delete_user(user_id):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM usuarios WHERE id = ?', (user_id,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao deletar usuário: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def set_config_value(key, value):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT OR REPLACE INTO configuracoes (chave, valor) VALUES (?, ?)', (key, value))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao definir configuração: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()

def get_config_value(key):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT valor FROM configuracoes WHERE chave = ?', (key,))
        result = cursor.fetchone()
        return result['valor'] if result else None
    except Exception as e:
        print(f"Erro ao obter configuração: {e}")
        return None
    finally:
        if 'conn' in locals(): conn.close()

def delete_config_value(key):
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM configuracoes WHERE chave = ?', (key,))
        conn.commit()
        return True
    except Exception as e:
        print(f"Erro ao deletar configuração: {e}")
        return False
    finally:
        if 'conn' in locals(): conn.close()