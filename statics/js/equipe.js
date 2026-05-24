// ============================================================
// VARIÁVEIS E SELEÇÃO DE ELEMENTOS
// ============================================================
const inputEquipe = document.getElementById('input-equipe');
const btnAdd = document.getElementById('btn-add');
const timeGrid = document.getElementById('time-grid');
const msgAviso = document.getElementById('msg-aviso');
const autocompleteList = document.getElementById('equipe-autocomplete-list');

// Carrega o time salvo no navegador ou cria uma lista vazia
let meuTime = []; // A equipe atual do usuário
const MAX_POKEMON = 6;

// Lista global para armazenar os nomes de todos os Pokémon
// Agora, esta lista armazenará os Pokémons da coleção do usuário
let listaPokemonsColecao = [];

// ============================================================
// 1. SISTEMA DE AUTOCOMPLETE (SUGESTÕES)
// ============================================================

// Busca os Pokémons da coleção do usuário para o autocomplete
async function carregarSugestoesEquipe() {
    try {
        // Busca da nova API do Flask que retorna a coleção do usuário
        const res = await fetch('/api/collection/autocomplete_data');
        const data = await res.json();
        listaPokemonsColecao = data; // Armazena os objetos Pokémon completos da coleção
    } catch (e) {
        console.error("Erro ao carregar lista de Pokémons da coleção para sugestão:", e);
    }
}

// Lógica para filtrar nomes enquanto o usuário digita
inputEquipe.addEventListener('input', function () {
    const valor = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';
    msgAviso.innerText = ''; // Limpa avisos de erro ao começar a digitar

    if (!valor) return;

    // Filtra os pokémons que começam com o texto digitado
    // Agora filtra da lista da coleção do usuário
    const filtrados = listaPokemonsColecao.filter(p => p.nome.toLowerCase().startsWith(valor));

    // Mostra apenas as primeiras 15 sugestões para manter a performance
    const sugestoesLimitadas = filtrados.slice(0, 15);

    sugestoesLimitadas.forEach(pokemon => {
        const item = document.createElement('div');
        // Destaca o que já foi digitado e exibe o nome
        item.innerHTML = `
            <img src="${pokemon.imagem}" class="autocomplete-icon" style="width:40px; height:40px; image-rendering:pixelated;">
            <span><strong>${pokemon.nome.substring(0, valor.length)}</strong>${pokemon.nome.substring(valor.length)}</span>
        `;

        // Ao clicar na sugestão, preenche o campo e tenta adicionar
        item.addEventListener('click', function () {
            inputEquipe.value = pokemon.nome;
            autocompleteList.innerHTML = '';
            adicionarAoTime(pokemon); // Passa o objeto Pokémon completo
        });

        autocompleteList.appendChild(item);
    });
});

// Fecha a lista de sugestões se o usuário clicar fora do campo de busca
document.addEventListener('click', (e) => {
    if (e.target !== inputEquipe) autocompleteList.innerHTML = '';
});


// ============================================================
// 2. LOGICA DA EQUIPE (RENDERIZAR, ADICIONAR E REMOVER)
// ============================================================

// Função para buscar o time do servidor (Substitui o localStorage)
async function carregarTimeDoBanco() {
    try {
        const res = await fetch('/api/team/get');
        meuTime = await res.json();
        renderizarTime();
    } catch (e) {
        console.error("Erro ao carregar equipe do banco:", e);
    }
}

// Função para desenhar os 6 slots na tela
function renderizarTime() {
    timeGrid.innerHTML = '';

    for (let i = 0; i < MAX_POKEMON; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');

        if (meuTime[i]) {
            // Se o slot estiver ocupado
            const pokemon = meuTime[i];
            slot.classList.add('preenchido', pokemon.tipo);

            slot.innerHTML = `
                <button class="btn-remover" onclick="removerPokemon(${i}, ${pokemon.id})">X</button>
                <img src="${pokemon.imagem}" alt="${pokemon.nome}">
                <span class="nome-slot">${pokemon.nome}</span>
            `;
        } else {
            // Se o slot estiver vazio
            slot.innerHTML = `<span style="color:#555;">Vazio</span>`;
        }
        timeGrid.appendChild(slot);
    }
}

// Função para buscar dados do Pokémon e colocar na lista
async function adicionarAoTime(pokemonDaColecao = null) { // Aceita um objeto Pokémon diretamente
    const nome = inputEquipe.value.toLowerCase().trim();
    autocompleteList.innerHTML = ''; // Limpa sugestões ao tentar adicionar

    if (!nome && !pokemonDaColecao) {
        msgAviso.innerText = "Digite o nome de um Pokémon ou selecione da lista.";
        msgAviso.style.color = '#ff5252';
        return;
    }

    if (meuTime.length >= MAX_POKEMON) {
        msgAviso.innerText = "Sua equipe já está cheia (máximo 6)!";
        msgAviso.style.color = '#ff5252';
        return;
    }

    // Verifica se o Pokémon já está na equipe
    if (meuTime.some(p => p.nome.toLowerCase() === nome)) {
        msgAviso.innerText = `"${nome.toUpperCase()}" já está na sua equipe!`;
        msgAviso.style.color = '#ff5252';
        return;
    }

    let pokemonParaAdicionar = pokemonDaColecao;

    // Se não veio do autocomplete (clique na sugestão), tenta encontrar na lista da coleção
    if (!pokemonParaAdicionar) {
        pokemonParaAdicionar = listaPokemonsColecao.find(p => p.nome.toLowerCase() === nome);
        if (!pokemonParaAdicionar) {
            msgAviso.innerText = `"${nome.toUpperCase()}" não encontrado na sua coleção!`;
            msgAviso.style.color = '#ff5252';
            return;
        }
    }

    btnAdd.innerText = "ADICIONANDO...";

    try {
        // Usa os dados do Pokémon da coleção, não precisa mais da PokeAPI
        const response = await fetch('/api/team/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: pokemonParaAdicionar.id,
                nome: pokemonParaAdicionar.nome,
                imagem: pokemonParaAdicionar.imagem,
                tipo: pokemonParaAdicionar.tipo
            })
        });

        if (response.ok) {
            meuTime.push(pokemonParaAdicionar); // Adiciona o objeto completo da coleção
            inputEquipe.value = '';
            renderizarTime();
            msgAviso.innerText = `"${pokemonParaAdicionar.nome.toUpperCase()}" adicionado à equipe!`;
            msgAviso.style.color = '#4caf50'; // Verde para sucesso
        } else {
            const errData = await response.json();
            msgAviso.innerText = errData.error || "Erro ao salvar no servidor";
            msgAviso.style.color = '#ff5252'; // Vermelho para erro
        }

    } catch (error) {
        msgAviso.innerText = "Pokémon não encontrado. Verifique o nome!";
        msgAviso.style.color = '#ff5252';
    } finally {
        btnAdd.innerText = "CAPTURAR";
    }
}

// Função para remover um Pokémon pelo índice do array
async function removerPokemon(index, pokemonIdApi) {
    try {
        const response = await fetch(`/api/team/remove/${pokemonIdApi}`, { method: 'DELETE' });
        if (response.ok) {
            meuTime.splice(index, 1);
            renderizarTime();
        }
    } catch (e) {
        console.error("Erro ao remover do banco:", e);
    }
}


// ============================================================
// 3. EVENTOS E INICIALIZAÇÃO
// ============================================================

btnAdd.addEventListener('click', adicionarAoTime);

// Ajuste para que o Enter funcione mesmo sem selecionar do autocomplete
inputEquipe.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // Se o usuário apertar Enter, tenta adicionar o que está no input
        adicionarAoTime();
    }
});

// Inicializa a página
carregarTimeDoBanco();
carregarSugestoesEquipe();