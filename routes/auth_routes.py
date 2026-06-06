from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models.user_model import create_user, get_user_by_email, reset_password_db
import os
import uuid

bp = Blueprint('auth', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@bp.route('/check_email')
def check_email():
    email = request.args.get('email')
    user = get_user_by_email(email)
    return jsonify({'exists': bool(user)})

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        senha = request.form.get('senha')
        file = request.files.get('foto')
        
        if get_user_by_email(email):
            flash('Este e-mail já está cadastrado.', 'danger')
            return redirect(url_for('auth.register'))

        filename = 'default.png'
        if file and file.filename != '':
            if allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = secure_filename(f"{uuid.uuid4()}.{ext}")
                file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            else:
                flash('Tipo de arquivo não permitido!', 'warning')
                return redirect(url_for('auth.register'))
            
        create_user(nome, email, generate_password_hash(senha), is_admin=0, foto=filename)
        flash('Cadastro realizado com sucesso! Faça login para continuar.', 'success')
        return redirect(url_for('auth.login'))
    return render_template('register.html')

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user=get_user_by_email(request.form.get('email'))
        if user and check_password_hash(user['senha'],request.form.get('senha')):
            session['user_id']=user['id']
            if user['is_admin']:
                return redirect(url_for('admin.dashboard'))
            if user['precisa_resetar']:
                flash('Você precisa alterar sua senha por segurança!', 'warning')
                return redirect(url_for('user.perfil'))
            return redirect(url_for('user.perfil'))
        flash('E-mail ou senha incorretos.', 'danger')
    return render_template('login.html')

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))

@bp.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        user = get_user_by_email(email)
        if user:
            # Marca a conta para resetar senha no próximo login
            reset_password_db(user['id'], f'reset_{user["id"]}', forcar_reset=True)
            flash('Conta encontrada! Defina sua nova senha abaixo.', 'success')
            return redirect(url_for('auth.reset_password', email=email))
        # Mensagem genérica por segurança (não revela se o email existe)
        flash('Se esse e-mail estiver cadastrado, você receberá as instruções de redefinição.', 'info')
        return redirect(url_for('auth.login'))
    return render_template('forgot_password.html')

@bp.route('/reset_password/<email>', methods=['GET', 'POST'])
def reset_password(email):
    user = get_user_by_email(email)
    if not user:
        flash('Link inválido ou e-mail não encontrado.', 'danger')
        return redirect(url_for('auth.forgot_password'))

    if request.method == 'POST':
        nova_senha = request.form.get('senha', '')
        if len(nova_senha) < 4:
            flash('A senha deve ter pelo menos 4 caracteres.', 'warning')
            return render_template('reset_password.html', email=email)
        # Salva nova senha e remove o flag de reset
        reset_password_db(user['id'], nova_senha, forcar_reset=False)
        flash('Senha redefinida com sucesso! Faça login com a nova senha.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('reset_password.html', email=email)
