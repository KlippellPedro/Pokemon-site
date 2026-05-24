from flask import Blueprint, render_template, request, session, flash, current_app, redirect, url_for, jsonify
from models.user_model import get_user_by_id, update_user, get_user_by_email, add_pokemon_to_team, get_user_team, remove_pokemon_from_team, add_pokemon_to_collection, get_user_collection, remove_pokemon_from_collection
from utils.decorators import login_required
import os
import uuid
# from config import UPLOAD_FOLDER # Assumindo que UPLOAD_FOLDER está em current_app.config
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename

bp = Blueprint('user', __name__)

# Extensões de arquivo permitidas para upload de imagens
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 2 * 1024 * 1024  # 2MB

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/')
def index():
    return render_template('index.html')

@bp.route('/pokedex')
def pokedex():
    return render_template('pokédex.html')

@bp.route('/equipe')
@login_required
def equipe():
    return render_template('equipe.html')

@bp.route('/pacotes')
@login_required
def pacotes():
    return render_template('pacotes.html')

@bp.route('/social')
def social():
    return render_template('social.html')

@bp.route('/colecao')
@login_required
def colecao():
    user_id = session.get('user_id')
    nome_filtro = request.args.get('nome')
    tipo_filtro = request.args.get('tipo')
    
    # Lista de tipos para o dropdown
    tipos = ['bug', 'dark', 'dragon', 'electric', 'fairy', 'fighting', 'fire', 'flying', 'ghost', 'grass', 'ground', 'ice', 'normal', 'poison', 'psychic', 'rock', 'steel', 'water']

    # Dicionário de tradução para os tipos
    traducao_tipos = {
        'normal': 'NORMAL', 'fire': 'FOGO', 'water': 'ÁGUA', 'electric': 'ELÉTRICO',
        'grass': 'GRAMA', 'ice': 'GELO', 'fighting': 'LUTADOR', 'poison': 'VENENO',
        'ground': 'TERRA', 'flying': 'VOADOR', 'psychic': 'PSÍQUICO', 'bug': 'INSETO',
        'rock': 'PEDRA', 'ghost': 'FANTASMA', 'dragon': 'DRAGÃO', 'dark': 'SOMBRIO',
        'steel': 'AÇO', 'fairy': 'FADA'
    }
    
    collection = get_user_collection(user_id, nome=nome_filtro, tipo=tipo_filtro)
    return render_template('colecao.html', collection=collection, tipos=tipos, traducao_tipos=traducao_tipos)

@bp.route('/colecao/remover/<int:pokemon_id_api>')
@login_required
def remover_da_colecao(pokemon_id_api):
    user_id = session.get('user_id')
    if remove_pokemon_from_collection(user_id, pokemon_id_api):
        flash('Pokémon removido da sua coleção.', 'success')
    else:
        flash('Erro ao remover Pokémon.', 'danger')
    return redirect(url_for('user.colecao'))

@bp.route('/perfil', methods=['GET', 'POST'])
@login_required
def perfil():
    user_id = session.get('user_id')
    
    user = get_user_by_id(user_id)
    if not user:
        flash('Usuário não encontrado.', 'danger')
        return redirect(url_for('auth.login')) # Redireciona se o usuário não for encontrado

    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        uploaded_file = request.files.get('foto')
        nova_senha = request.form.get('senha')
        confirma_senha = request.form.get('confirma_senha')

        # Validação de confirmação de senha
        if nova_senha and nova_senha != confirma_senha:
            flash('As senhas não coincidem!', 'danger')
            return render_template('perfil.html', user=user)

        # Verificação de e-mail duplicado: impede trocar para um e-mail que já existe em outra conta
        existing_user = get_user_by_email(email)
        if existing_user and existing_user['id'] != user_id:
            flash('Este e-mail já está sendo usado por outro usuário.', 'danger')
            return render_template('perfil.html', user=user)
        
        current_photo_filename = user['foto'] # Mantém o nome da foto atual

        if uploaded_file and uploaded_file.filename != '':
            # Validação de tamanho (Desafio Extra)
            uploaded_file.seek(0, os.SEEK_END)
            file_size = uploaded_file.tell()
            uploaded_file.seek(0)

            if file_size > MAX_FILE_SIZE:
                flash('A imagem é muito grande! Limite de 2MB.', 'warning')
                return render_template('perfil.html', user=user)

            if allowed_file(uploaded_file.filename):
                filename = secure_filename(f"{uuid.uuid4()}.{uploaded_file.filename.rsplit('.', 1)[1].lower()}")
                uploaded_file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
                current_photo_filename = filename
            else:
                flash('Tipo de arquivo não permitido para a foto de perfil.', 'warning')

        # Prepara a senha hash caso o usuário queira alterá-la (Requisito: Alterar senha no perfil)
        senha_final = generate_password_hash(nova_senha) if nova_senha else None

        if update_user(user_id, nome, email, current_photo_filename, senha=senha_final):
            flash('Perfil atualizado com sucesso!', 'success')
        user = get_user_by_id(user_id) # Re-busca o usuário para refletir as mudanças na tela
    return render_template('perfil.html', user=user)

@bp.route('/api/team/add', methods=['POST'])
@login_required
def api_add_team():
    data = request.json
    user_id = session.get('user_id')
    
    # Mapeia os dados vindo do JS para o modelo do banco
    success, message = add_pokemon_to_team(
        user_id, data['id'], data['nome'], data['imagem'], data['tipo']
    )
    
    if success:
        return jsonify({'message': message}), 200
    return jsonify({'error': message}), 400

@bp.route('/api/team/get', methods=['GET'])
@login_required
def api_get_team():
    user_id = session.get('user_id')
    team = get_user_team(user_id)
    
    # Formata os dados para o padrão que o seu JS espera (id, nome, imagem, tipo)
    formatted_team = []
    for p in team:
        formatted_team.append({
            'id': p['pokemon_id_api'],
            'nome': p['nome_pokemon'],
            'imagem': p['sprite_url'],
            'tipo': p['tipo']
        })
    return jsonify(formatted_team)

@bp.route('/api/team/remove/<int:pokemon_id_api>', methods=['DELETE'])
@login_required
def api_remove_team(pokemon_id_api):
    user_id = session.get('user_id')
    if remove_pokemon_from_team(user_id, pokemon_id_api):
        return jsonify({'success': True}), 200
    return jsonify({'success': False}), 400

@bp.route('/api/collection/add', methods=['POST'])
@login_required
def api_add_collection():
    data = request.json
    user_id = session.get('user_id')
    
    add_pokemon_to_collection(
        user_id, data['id'], data['nome'], data['imagem'], data['tipo']
    )
    return jsonify({'message': 'Adicionado à coleção!'}), 200

@bp.route('/api/collection/get', methods=['GET'])
@login_required
def api_get_collection():
    user_id = session.get('user_id')
    collection = get_user_collection(user_id)
    
    return jsonify([{
        'id': p['pokemon_id_api'],
        'nome': p['nome_pokemon'],
        'imagem': p['sprite_url'],
        'tipo': p['tipo']
    } for p in collection])

@bp.route('/api/collection/add_batch', methods=['POST'])
@login_required
def api_add_collection_batch():
    data = request.json # Espera uma lista de objetos pokemon
    user_id = session.get('user_id')
    
    for p in data:
        add_pokemon_to_collection(
            user_id, p['id'], p['nome'], p['imagem'], p['tipo']
        )
    return jsonify({'message': f'{len(data)} pokémons adicionados!'}), 200

@bp.route('/api/collection/autocomplete_data', methods=['GET'])
@login_required
def api_collection_autocomplete_data():
    user_id = session.get('user_id')
    collection = get_user_collection(user_id) # Reutiliza a função existente do modelo
    
    formatted_data = []
    for p in collection:
        formatted_data.append({
            'nome': p['nome_pokemon'],
            'id': p['pokemon_id_api'],
            'imagem': p['sprite_url'],
            'tipo': p['tipo']
        })
    return jsonify(formatted_data)