/**
 * Lógica do Painel Administrativo: Busca AJAX e Filtros
 */
document.addEventListener('DOMContentLoaded', () => {
    const inputBusca = document.getElementById('admin-search-user');
    const filtroTipo = document.getElementById('admin-filter-type');
    const filtroData = document.getElementById('admin-filter-date');
    const tabelaCorpo = document.querySelector('.admin-table tbody');

    async function buscarUsuarios() {
        const query = inputBusca.value;
        const tipo = filtroTipo.value;
        const data = filtroData.value;

        const response = await fetch(`/admin/api/users/search?q=${query}&tipo=${tipo}&data=${data}`);
        const usuarios = await response.json();

        // Verifica se currentUserId está definido no escopo global (pode ser passado via Jinja no HTML)
        const idLogado = typeof currentUserId !== 'undefined' ? currentUserId : null;

        tabelaCorpo.innerHTML = ''; // Limpa a tabela

        usuarios.forEach(user => {
            const isAdminStr = user.tipo === 'admin' ? '1' : '0';
            const row = `
                <tr>
                    <td>#${user.id}</td>
                    <td>${user.nome}</td>
                    <td>${user.email}</td>
                    <td>
                        <span class="${user.tipo === 'admin' ? 'badge-admin' : ''}" style="${user.tipo !== 'admin' ? 'color: #4caf50' : ''}">
                            ${user.tipo.toUpperCase()}
                        </span>
                    </td>
                    <td>
                        <button class="btn-limpar" style="padding: 5px 10px; font-size: 10px" 
                                onclick="abrirModalEdicao('${user.id}', '${user.nome}', '${user.email}', '${isAdminStr}')">EDITAR</button>
                        <button class="btn-limpar" style="padding: 5px 10px; font-size: 10px; background: #7b1fa2; color: white;" 
                                onclick="confirmarReset('${user.id}', '${user.nome}')">RESET SENHA</button>
                        ${user.id != idLogado ? `<button class="btn-delete" style="background: none; border: none; color: #ff5252; cursor: pointer; text-decoration: underline; font-size: 11px" onclick="abrirModalExclusao('${user.id}', '${user.nome}')">Excluir</button>` : ''}
                    </td>
                </tr>
            `;
            tabelaCorpo.insertAdjacentHTML('beforeend', row);
        });
    }

    inputBusca.addEventListener('input', buscarUsuarios);
    filtroTipo.addEventListener('change', buscarUsuarios);
    filtroData.addEventListener('change', buscarUsuarios);
});