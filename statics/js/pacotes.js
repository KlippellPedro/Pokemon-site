const secaoEscolha = document.getElementById('secao-escolha');
const areaRevelacao = document.getElementById('area-revelacao');
const gridRevelacao = document.getElementById('grid-revelacao');

// Configuração de IDs por raridade
const IDS_LENDARIOS = [144, 145, 146, 150, 151, 243, 244, 245, 249, 250, 251, 382, 383, 384, 483, 484, 487, 493];
const IDS_RAROS = [1, 4, 7, 25, 133, 147, 148, 149, 152, 155, 158, 252, 255, 258]; // Iniciais e Pseudo-lendários
const IDS_COMUNS = Array.from({ length: 493 }, (_, i) => i + 1).filter(id => !IDS_LENDARIOS.includes(id) && !IDS_RAROS.includes(id));

// Configuração de "Sorte" por pacote (Peso de probabilidade)
// cardIndex 4 é a última carta (mais chance de ser foda)
function getSortudoId(boosterId, isLastCard) {
    const sorte = Math.random() * 100;

    if (boosterId === 'booster-lendario') return IDS_LENDARIOS[Math.floor(Math.random() * IDS_LENDARIOS.length)];

    if (boosterId === 'booster-epico') {
        if (isLastCard) {
            return IDS_RAROS[Math.floor(Math.random() * IDS_RAROS.length)]; // 100% Raro no último card do épico
        }
        if (sorte > 80) return IDS_RAROS[Math.floor(Math.random() * IDS_RAROS.length)]; // 20% Raro nas primeiras
        return IDS_COMUNS[Math.floor(Math.random() * IDS_COMUNS.length)];
    }

    // Booster Básico
    if (isLastCard) {
        if (sorte > 50) return IDS_RAROS[Math.floor(Math.random() * IDS_RAROS.length)]; // 40% Raro
        return IDS_COMUNS[Math.floor(Math.random() * IDS_COMUNS.length)];
    }
    return IDS_COMUNS[Math.floor(Math.random() * IDS_COMUNS.length)];
}

document.querySelectorAll('.booster-option').forEach(option => {
    option.addEventListener('click', () => abrirPacote(option.id));
});

async function abrirPacote(boosterId) {
    secaoEscolha.classList.add('hidden');
    areaRevelacao.classList.remove('hidden');
    gridRevelacao.innerHTML = '<p class="subtitulo" style="color:white; grid-column: 1/-1;">Abrindo pacote... ✨</p>';

    const idsParaSortear = [];
    const totalCards = boosterId === 'booster-lendario' ? 1 : 5;

    for (let i = 0; i < totalCards; i++) {
        console.log(`Booster ID: ${boosterId}, Total Cards: ${totalCards}, Card Index: ${i}`); // Linha adicionada para depuração
        idsParaSortear.push(getSortudoId(boosterId, i === (totalCards - 1)));
    }

    try {
        const promessas = idsParaSortear.map(id => fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(r => r.json()));
        const resultados = await Promise.all(promessas);

        const pokemonsParaSalvar = resultados.map(p => ({
            id: p.id,
            nome: p.name,
            imagem: p.sprites.other['official-artwork'].front_default,
            tipo: p.types[0].type.name
        }));

        // Salva tudo de uma vez
        await fetch('/api/collection/add_batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pokemonsParaSalvar)
        });

        gridRevelacao.innerHTML = '';
        resultados.forEach((p, index) => {
            const isLendario = IDS_LENDARIOS.includes(p.id);
            const isRaro = IDS_RAROS.includes(p.id);
            const classeRaridade = isLendario ? 'efeito-lendario' : (isRaro ? 'raridade-raro' : 'raridade-comum');

            gridRevelacao.innerHTML += `
                <div class="card-reveal-wrapper" style="animation-delay: ${index * 0.1}s" onclick="this.querySelector('.card-inner').classList.toggle('flipped')">
                    <div class="card-inner">
                        <div class="card-back">
                            <img src="/static/uploads/utilidade/tcg-card-back.jpg" alt="Verso da Carta" style="width: 100%; height: 100%; object-fit: cover; border-radius: 10px;">
                        </div>
                        <div class="card-front card-revelado ${classeRaridade}">
                            <img src="${p.sprites.other['official-artwork'].front_default}" alt="${p.name}">
                            <h3 style="font-size: 10px; margin-top: 10px;">${p.name.toUpperCase()}</h3>
                            <p style="color: #ffeb3b; font-size: 8px; margin-top: 5px;">${isLendario ? 'LENDÁRIO' : (isRaro ? 'RARO' : 'COMUM')}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        gridRevelacao.innerHTML = '<p class="subtitulo">Erro ao conectar com a PokéAPI!</p>';
    }
}

function voltarParaLoja() {
    areaRevelacao.classList.add('hidden');
    secaoEscolha.classList.remove('hidden');
}