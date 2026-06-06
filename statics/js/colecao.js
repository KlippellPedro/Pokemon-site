const pokemonInput = document.getElementById('pokemon-input');
const autocompleteList = document.getElementById('colecao-autocomplete-list');
const filtroForm = document.querySelector('.colecao-filtros');

let listaPokemonsColecao = [];

// ============================================================
// IDS ESPECIAIS PARA RARIDADE
// ============================================================

const IDS_LENDARIOS_COL = [
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649
];

const IDS_RAROS_COL = [
    1, 4, 7, 25, 133, 147, 148, 149,
    152, 155, 158, 196, 197,
    252, 255, 258, 282,
    387, 390, 393,
    445, 448
];

// ============================================================
// AUTOCOMPLETE
// ============================================================

async function carregarSugestoesColecao() {
    try {
        const res = await fetch('/api/collection/autocomplete_data');
        const data = await res.json();
        listaPokemonsColecao = data;
    } catch (e) {
        console.error("Erro ao carregar lista de Pokémons da coleção para sugestão:", e);
    }
}

pokemonInput.addEventListener('input', function () {
    const valor = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';

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
            pokemonInput.value = pokemon.nome;
            autocompleteList.innerHTML = '';
            filtroForm.submit();
        });

        autocompleteList.appendChild(item);
    });
});

document.addEventListener('click', (e) => {
    if (e.target !== pokemonInput) autocompleteList.innerHTML = '';
});

// ============================================================
// RARIDADE + ANIMAÇÃO DE ENTRADA
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.colecao-grid .pokemon-card[data-pokemon-id]');

    cards.forEach(function (card, index) {
        const id = parseInt(card.getAttribute('data-pokemon-id'));

        if (IDS_LENDARIOS_COL.includes(id)) {
            card.classList.add('col-lendario');
        } else if (IDS_RAROS_COL.includes(id)) {
            card.classList.add('col-raro');
        }

        card.style.animationDelay = `${index * 0.05}s`;
    });
});

// ============================================================
// ATUALIZA LABELS DE TIPO AO TROCAR IDIOMA
// ============================================================

document.addEventListener('langChanged', function () {
    // Badges de tipo nos cards
    document.querySelectorAll('.colecao-grid .type-badge[data-tipo]').forEach(function (el) {
        const tipo = el.getAttribute('data-tipo');
        if (typeof t === 'function') el.textContent = t('tipo.' + tipo) || tipo.toUpperCase();
    });

    // Opções do select de filtro (server-rendered, precisa de update manual)
    if (typeof t === 'function') {
        var firstOpt = document.querySelector('.filtro-tipo option[data-i18n]');
        if (firstOpt) firstOpt.textContent = t(firstOpt.getAttribute('data-i18n'));

        document.querySelectorAll('.filtro-tipo option[data-tipo]').forEach(function (opt) {
            opt.textContent = t('tipo.' + opt.getAttribute('data-tipo')) || opt.getAttribute('data-tipo').toUpperCase();
        });
    }
});

carregarSugestoesColecao();
