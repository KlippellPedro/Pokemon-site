// ============================================================
// VARIÁVEIS E SELEÇÃO DE ELEMENTOS
// ============================================================
const inputEquipe = document.getElementById('input-equipe');
const btnAdd = document.getElementById('btn-add');
const timeGrid = document.getElementById('time-grid');
const msgAviso = document.getElementById('msg-aviso');
const autocompleteList = document.getElementById('equipe-autocomplete-list');

let meuTime = [];
const MAX_POKEMON = 6;
let listaPokemonsColecao = [];

// ============================================================
// CORES E IDS ESPECIAIS
// ============================================================

const COR_TIPO = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

const IDS_LENDARIOS_EQUIPE = [
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649
];

const IDS_RAROS_EQUIPE = [
    1, 4, 7, 25, 133, 147, 148, 149,
    152, 155, 158, 196, 197,
    252, 255, 258, 282,
    387, 390, 393,
    445, 448
];

// ============================================================
// 1. SISTEMA DE AUTOCOMPLETE (SUGESTÕES)
// ============================================================

async function carregarSugestoesEquipe() {
    try {
        const res = await fetch('/api/collection/autocomplete_data');
        const data = await res.json();
        listaPokemonsColecao = data;
    } catch (e) {
        console.error("Erro ao carregar lista de Pokémons da coleção para sugestão:", e);
    }
}

inputEquipe.addEventListener('input', function () {
    const valor = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';
    msgAviso.innerText = '';

    if (!valor) return;

    const filtrados = listaPokemonsColecao.filter(p => p.nome.toLowerCase().startsWith(valor));
    const sugestoesLimitadas = filtrados.slice(0, 15);

    sugestoesLimitadas.forEach(pokemon => {
        const item = document.createElement('div');
        item.innerHTML = `
            <img src="${pokemon.imagem}" class="autocomplete-icon" style="width:40px; height:40px; image-rendering:pixelated;">
            <span><strong>${pokemon.nome.substring(0, valor.length)}</strong>${pokemon.nome.substring(valor.length)}</span>
        `;

        item.addEventListener('click', function () {
            inputEquipe.value = pokemon.nome;
            autocompleteList.innerHTML = '';
            adicionarAoTime(pokemon);
        });

        autocompleteList.appendChild(item);
    });
});

document.addEventListener('click', (e) => {
    if (e.target !== inputEquipe) autocompleteList.innerHTML = '';
});


// ============================================================
// 2. LÓGICA DA EQUIPE (RENDERIZAR, ADICIONAR E REMOVER)
// ============================================================

async function carregarTimeDoBanco() {
    try {
        const res = await fetch('/api/team/get');
        meuTime = await res.json();
        renderizarTime();
    } catch (e) {
        console.error("Erro ao carregar equipe do banco:", e);
    }
}

function renderizarTime() {
    timeGrid.innerHTML = '';

    for (let i = 0; i < MAX_POKEMON; i++) {
        const slot = document.createElement('div');
        slot.classList.add('slot');
        slot.style.animationDelay = `${i * 0.07}s`;

        if (meuTime[i]) {
            const pokemon = meuTime[i];
            const tipo = pokemon.tipo || 'normal';
            const cor = COR_TIPO[tipo] || '#666';
            const tipoLabel = (typeof t === 'function') ? t('tipo.' + tipo) : tipo.toUpperCase();
            const isLendario = IDS_LENDARIOS_EQUIPE.includes(Number(pokemon.id));
            const isRaro = IDS_RAROS_EQUIPE.includes(Number(pokemon.id)) && !isLendario;
            const classeRar = isLendario ? 'slot-lendario' : (isRaro ? 'slot-raro' : '');

            slot.classList.add('preenchido', tipo);
            if (classeRar) slot.classList.add(classeRar);

            slot.innerHTML = `
                <button class="btn-remover" onclick="removerPokemon(${i}, ${pokemon.id})">×</button>
                <div class="slot-header" style="background:linear-gradient(135deg,${cor}dd,${cor}77)">
                    <span class="slot-num-label">Nº${i + 1}</span>
                    <span class="slot-tipo-badge" data-tipo="${tipo}">${tipoLabel}</span>
                </div>
                <div class="slot-arte">
                    <img src="${pokemon.imagem}" alt="${pokemon.nome}">
                </div>
                <div class="slot-rodape">
                    <span class="nome-slot">${pokemon.nome.toUpperCase()}</span>
                </div>
                <div class="holo-overlay"></div>
            `;
        } else {
            const slotLabel    = (typeof t === 'function') ? t('equipe.slot')     : 'SLOT';
            const addLabel     = (typeof t === 'function') ? t('equipe.adicionar') : '+ Adicionar';
            slot.innerHTML = `
                <div class="slot-vazio-content">
                    <div class="pokeball-vazio"></div>
                    <span class="slot-vazio-num">${slotLabel} ${i + 1}</span>
                    <span class="slot-vazio-hint">${addLabel}</span>
                </div>
            `;
        }
        timeGrid.appendChild(slot);
    }
}

async function adicionarAoTime(pokemonDaColecao = null) {
    const nome = inputEquipe.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';

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

    if (meuTime.some(p => p.nome.toLowerCase() === nome)) {
        msgAviso.innerText = `"${nome.toUpperCase()}" já está na sua equipe!`;
        msgAviso.style.color = '#ff5252';
        return;
    }

    let pokemonParaAdicionar = pokemonDaColecao;

    if (!pokemonParaAdicionar) {
        pokemonParaAdicionar = listaPokemonsColecao.find(p => p.nome.toLowerCase() === nome);
        if (!pokemonParaAdicionar) {
            msgAviso.innerText = `"${nome.toUpperCase()}" não encontrado na sua coleção!`;
            msgAviso.style.color = '#ff5252';
            return;
        }
    }

    const langAtual = (typeof _langAtual !== 'undefined') ? _langAtual : 'pt';
    btnAdd.innerText = langAtual === 'en' ? 'CATCHING...' : 'ADICIONANDO...';

    try {
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
            meuTime.push(pokemonParaAdicionar);
            inputEquipe.value = '';
            renderizarTime();
            msgAviso.innerText = `"${pokemonParaAdicionar.nome.toUpperCase()}" adicionado à equipe!`;
            msgAviso.style.color = '#4caf50';
        } else {
            const errData = await response.json();
            msgAviso.innerText = errData.error || "Erro ao salvar no servidor";
            msgAviso.style.color = '#ff5252';
        }

    } catch (error) {
        msgAviso.innerText = "Pokémon não encontrado. Verifique o nome!";
        msgAviso.style.color = '#ff5252';
    } finally {
        btnAdd.innerText = (typeof t === 'function') ? t('equipe.capturar') : 'CAPTURAR';
    }
}

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

inputEquipe.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') adicionarAoTime();
});

// Re-renderiza os slots ao trocar idioma (atualiza tipo + "SLOT X" + "+ Adicionar")
document.addEventListener('langChanged', function () {
    renderizarTime();
});

carregarTimeDoBanco();
carregarSugestoesEquipe();
