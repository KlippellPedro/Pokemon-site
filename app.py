from flask import Flask, redirect, url_for, session, g # Importar 'g'
from database import init_db
from routes.auth_routes import bp as auth_bp
from routes.user_routes import bp as user_bp
from routes.admin_routes import bp as admin_bp
from models.user_model import get_user_by_id
from config import SECRET_KEY, UPLOAD_FOLDER

# Configura a pasta física 'statics' para responder pela URL '/static'
app=Flask(__name__, static_folder='statics', static_url_path='/static')
app.secret_key =SECRET_KEY
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

init_db()

app.register_blueprint(auth_bp)
app.register_blueprint(user_bp)
app.register_blueprint(admin_bp)

# Context processor para disponibilizar o usuário logado em todos os templates
@app.before_request
def load_logged_in_user():
    user_id = session.get('user_id')
    if user_id is None:
        g.user = None
    else:
        g.user = get_user_by_id(user_id)

@app.context_processor
def inject_user():
    return dict(current_user=g.user)

@app.route('/')
def index():
    if 'user_id' in session:
        user = get_user_by_id(session['user_id'])
        
        if user['is_admin']:
            return redirect(url_for('admin.dashboard'))
        return redirect(url_for('user.perfil'))
    # Em vez de mandar pro login, manda para a página de início (index.html)
    return redirect(url_for('user.index'))

if __name__ == '__main__':
    app.run(debug=True)