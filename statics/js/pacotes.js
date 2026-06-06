const secaoEscolha = document.getElementById('secao-escolha');
const areaRevelacao = document.getElementById('area-revelacao');
const gridRevelacao = document.getElementById('grid-revelacao');

// ============================================================
// POOLS DE POKÉMON POR CATEGORIA
// ============================================================

const IDS_LENDARIOS = [
    144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493,
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649
];

const IDS_RAROS = [
    1, 4, 7, 25, 133, 147, 148, 149,
    152, 155, 158, 196, 197,
    252, 255, 258, 282, 384,
    387, 390, 393,
    445, 448
];

const IDS_STARTERS = [
    1, 4, 7,           // Gen 1
    152, 155, 158,     // Gen 2
    252, 255, 258,     // Gen 3
    387, 390, 393,     // Gen 4
    495, 498, 501,     // Gen 5
    650, 653, 656,     // Gen 6
    722, 725, 728,     // Gen 7
    810, 813, 816,     // Gen 8
    906, 909, 912      // Gen 9
];

const IDS_SOMBRIOS = [
    92, 93, 94, 54, 55, 79, 80,
    197, 228, 229, 261, 262,
    302, 353, 354, 355, 356, 359, 361, 362,
    429, 430, 442, 453, 454, 477,
    487, 491, 562, 563, 564, 565, 708, 709
];

const IDS_COMUNS = Array.from({ length: 493 }, (_, i) => i + 1)
    .filter(id => !IDS_LENDARIOS.includes(id) && !IDS_RAROS.includes(id));

// ============================================================
// CORES POR TIPO (para o header do card)
// ============================================================

const COR_TIPO = {
    normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
    grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
    ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
    rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
    steel: '#B8B8D0', fairy: '#EE99AC'
};

// ============================================================
// LÓGICA DE SORTEIO
// ============================================================

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getSortudoId(boosterId, isLastCard) {
    const sorte = Math.random() * 100;

    switch (boosterId) {
        case 'booster-lendario':
            return pick(IDS_LENDARIOS);

        case 'booster-epico':
            if (isLastCard) return pick(IDS_RAROS);
            return sorte > 80 ? pick(IDS_RAROS) : pick(IDS_COMUNS);

        case 'booster-starter':
            return pick(IDS_STARTERS);

        case 'booster-sombrio':
            return pick(IDS_SOMBRIOS);

        case 'booster-campeao':
            if (isLastCard) return pick(IDS_LENDARIOS);
            return sorte > 60 ? pick(IDS_RAROS) : pick(IDS_COMUNS);

        // Básico (default)
        default:
            if (isLastCard) return sorte > 50 ? pick(IDS_RAROS) : pick(IDS_COMUNS);
            return pick(IDS_COMUNS);
    }
}

function getTotalCards(boosterId) {
    return boosterId === 'booster-lendario' ? 1
         : boosterId === 'booster-campeao'  ? 10
         : 5;
}

// ============================================================
// EVENTOS DE CLIQUE NOS PACOTES
// ============================================================

document.querySelectorAll('.booster-option').forEach(option => {
    option.addEventListener('click', () => abrirPacote(option.id));
});

// ============================================================
// ABERTURA DO PACOTE
// ============================================================

async function abrirPacote(boosterId) {
    secaoEscolha.classList.add('hidden');
    areaRevelacao.classList.remove('hidden');
    gridRevelacao.innerHTML = '<p class="pacotes-loading">Abrindo pacote...</p>';

    const totalCards = getTotalCards(boosterId);
    const ids = [];
    for (let i = 0; i < totalCards; i++) {
        ids.push(getSortudoId(boosterId, i === totalCards - 1));
    }

    try {
        const resultados = await Promise.all(
            ids.map(id => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()))
        );

        // Salva na coleção do usuário
        const pokemonsParaSalvar = resultados.map(p => ({
            id: p.id, nome: p.name,
            imagem: p.sprites.other['official-artwork'].front_default,
            tipo: p.types[0].type.name
        }));
        await fetch('/api/collection/add_batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pokemonsParaSalvar)
        });

        // Renderiza os cards
        gridRevelacao.innerHTML = '';
        document.querySelector('.btn-voltar').classList.add('hidden-btn');

        resultados.forEach((p, index) => {
            const isLendario = IDS_LENDARIOS.includes(p.id);
            const isRaro     = IDS_RAROS.includes(p.id) && !isLendario;
            const classeRar  = isLendario ? 'efeito-lendario' : (isRaro ? 'raridade-raro' : 'raridade-comum');

            const tipo      = p.types[0].type.name;
            const corTipo   = COR_TIPO[tipo] || '#555';
            const artwork   = p.sprites.other['official-artwork'].front_default || p.sprites.front_default;
            const hp        = p.stats[0].base_stat;
            const idFmt     = p.id.toString().padStart(3, '0');

            const tipoLabel = (typeof t === 'function') ? t('tipo.' + tipo) : tipo.toUpperCase();
            const rarStar   = isLendario ? '★★★' : (isRaro ? '★★' : '★');

            const wrapper = document.createElement('div');
            wrapper.className = 'card-reveal-wrapper';
            wrapper.style.animationDelay = `${index * 0.08}s`;

            wrapper.innerHTML = `
                <div class="card-inner" onclick="this.classList.toggle('flipped')">
                    <div class="card-back">
                        <img src="/static/uploads/utilidade/tcg-card-back.jpg" alt="Verso" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">
                    </div>
                    <div class="card-front card-revelado ${classeRar}">
                        <div class="card-topo" style="background:linear-gradient(135deg,${corTipo}dd,${corTipo}88)">
                            <span class="card-nome">${p.name.toUpperCase()}</span>
                            <span class="card-hp">HP ${hp}</span>
                        </div>
                        <div class="card-arte">
                            <img src="${artwork}" alt="${p.name}">
                        </div>
                        <div class="card-rodape">
                            <span class="card-tipo-label" style="background:${corTipo}cc">${tipoLabel}</span>
                            <span class="card-numero">#${idFmt}</span>
                        </div>
                        <div class="card-raridade">${rarStar}</div>
                        <div class="holo-overlay"></div>
                    </div>
                </div>
            `;

            gridRevelacao.appendChild(wrapper);
        });

        // Auto-flip sequencial estilo TCG
        const allInners = gridRevelacao.querySelectorAll('.card-inner');
        const delayInicio = 800;
        const delayEntre  = 550;

        allInners.forEach((inner, i) => {
            setTimeout(() => inner.classList.add('flipped'), delayInicio + i * delayEntre);
        });

        // Mostra botão "Voltar" após todos flipparem
        const totalFlipTime = delayInicio + (allInners.length - 1) * delayEntre + 900;
        setTimeout(() => {
            const btnVoltar = document.querySelector('.btn-voltar');
            if (btnVoltar) btnVoltar.classList.remove('hidden-btn');
        }, totalFlipTime);

    } catch (error) {
        gridRevelacao.innerHTML = '<p class="pacotes-loading">Erro ao conectar com a PokéAPI!</p>';
        console.error(error);
    }
}

function voltarParaLoja() {
    areaRevelacao.classList.add('hidden');
    secaoEscolha.classList.remove('hidden');
}
