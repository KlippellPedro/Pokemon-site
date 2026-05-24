from flask import Blueprint, render_template, request, redirect, url_for, flash, session, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from models.user_model import create_user, get_user_by_email
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