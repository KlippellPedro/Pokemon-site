from flask import Blueprint, render_template, request, session, flash, redirect, url_for, jsonify
from models.user_model import (
    get_all_users, get_user_by_id, create_user, update_user_admin, 
    delete_user, reset_password_db, get_dashboard_stats, search_users_db
)
from utils.decorators import admin_required # Assumindo que você tem este decorator
from models.user_model import set_config_value, get_config_value, delete_config_value
from werkzeug.security import generate_password_hash
import os

bp = Blueprint('admin', __name__, url_prefix='/admin')

@bp.route('/dashboard')
@admin_required
def dashboard():
    stats = get_dashboard_stats()
    users = get_all_users()
    return render_template('admin.html', stats=stats, users=users)

@bp.route('/api/users/search')
@admin_required
def api_search_users():
    query = request.args.get('q', '')
    tipo = request.args.get('tipo', '')
    data = request.args.get('data', '')
    # Busca dinâmica por nome, email, ID e Data
    users = search_users_db(query, tipo, data)
    return jsonify(users)

@bp.route('/user/create', methods=['POST'])
@admin_required
def user_create():
    nome = request.form.get('nome')
    email = request.form.get('email')
    senha = request.form.get('senha')
    tipo = request.form.get('tipo', 'user')
    
    is_admin = 1 if tipo == 'admin' else 0
    if create_user(nome, email, generate_password_hash(senha), is_admin=is_admin, foto='default.png'):
        flash(f'Usuário {nome} criado com sucesso!', 'success')
    else:
        flash('Erro ao criar usuário. Verifique se o e-mail já existe.', 'danger')
    
    return redirect(url_for('admin.dashboard'))

@bp.route('/set_destaque', methods=['POST'])
@admin_required
def set_destaque():
    pokemon_nome = request.form.get('pokemon_nome')
    if pokemon_nome:
        # Em um cenário real, você validaria este nome/ID contra a PokeAPI
        # Por enquanto, armazenamos o nome como valor.
        set_config_value('destaque_pokemon_id', pokemon_nome)
        flash(f'Pokémon de destaque definido para {pokemon_nome}.', 'success')
    else:
        flash('Nome do Pokémon não fornecido.', 'danger')
    return redirect(url_for('admin.dashboard'))

@bp.route('/reset_destaque', methods=['GET'])
@admin_required
def reset_destaque():
    delete_config_value('destaque_pokemon_id')
    flash('Pokémon de destaque resetado para aleatório.', 'success')
    return redirect(url_for('admin.dashboard'))

@bp.route('/set_game', methods=['POST'])
@admin_required
def set_game():
    game_mode = request.form.get('game_mode')
    pokemon_nome = request.form.get('pokemon_nome')
    if game_mode and pokemon_nome:
        # Novamente, resolva pokemon_nome para um ID em um cenário real
        set_config_value(f'game_{game_mode}_pokemon_id', pokemon_nome)
        flash(f'Alvo do jogo "{game_mode}" definido para {pokemon_nome}.', 'success')
    else:
        flash('Modo de jogo ou nome do Pokémon não fornecido.', 'danger')
    return redirect(url_for('admin.dashboard'))

@bp.route('/config/destaque', methods=['GET'])
def get_destaque_config():
    pokemon_id = get_config_value('destaque_pokemon_id')
    return jsonify({'pokemon_id': pokemon_id})

@bp.route('/config/games', methods=['GET'])
def get_game_config():
    classic_id = get_config_value('game_classic_pokemon_id')
    silhouette_id = get_config_value('game_silhouette_pokemon_id')
    return jsonify({'classic_id': classic_id, 'silhouette_id': silhouette_id})

@bp.route('/user/edit/<int:user_id>', methods=['POST'])
@admin_required
def user_edit(user_id):
    nome = request.form.get('nome')
    email = request.form.get('email')
    tipo = request.form.get('tipo')
    
    if update_user_admin(user_id, nome, email, tipo):
        flash('Dados do usuário atualizados!', 'success')
    else:
        flash('Erro ao atualizar usuário.', 'danger')
    
    return redirect(url_for('admin.dashboard'))

@bp.route('/user/delete/<int:user_id>', methods=['POST'])
@admin_required
def user_delete(user_id):
    # Regra do Professor: Adm não pode excluir ele mesmo
    if user_id == session.get('user_id'):
        flash('Você não pode excluir sua própria conta admin!', 'danger')
        return redirect(url_for('admin.dashboard'))
    
    if delete_user(user_id):
        flash('Usuário removido do sistema.', 'success')
    else:
        flash('Erro ao remover usuário.', 'danger')
    
    return redirect(url_for('admin.dashboard'))

@bp.route('/user/reset-password/<int:user_id>', methods=['POST'])
@admin_required
def user_reset_password(user_id):
    # Gera uma senha padrão e marca para reset no próximo login
    nova_senha_temp = "Poke123@reset"
    if reset_password_db(user_id, nova_senha_temp, forcar_reset=True):
        flash(f'Senha resetada para: {nova_senha_temp}. O usuário deverá trocar no próximo login.', 'warning')
    else:
        flash('Erro ao resetar senha.', 'danger')
    
    return redirect(url_for('admin.dashboard'))