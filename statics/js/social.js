// ============================================================
// VARIÁVEIS GLOBAIS DO JOGO
// ============================================================
let pokemonAlvo = null; // Pokémon atualmente ativo no jogo
let alvoClassic = null; // Armazena o Pokémon diário
let alvoSilhouette = null; // Armazena o Pokémon aleatório da silhueta
let listaNomesSocial = [];
let chutesRealizados = [];
let contadorTentativas = 0;

const inputGame = document.getElementById('game-input');
const autocompleteList = document.getElementById('social-autocomplete-list');
const containerChutes = document.getElementById('guesses-container');
const silhouetteImg = document.getElementById('silhouette-img');
const silhouetteWrapper = document.getElementById('silhouette-wrapper');

let currentGameMode = 'classic'; // 'classic' ou 'silhouette'

// Dicionário de tradução para os tipos
const traducaoTipos = {
    normal: 'NORMAL', fire: 'FOGO', water: 'ÁGUA', electric: 'ELÉTRICO',
    grass: 'GRAMA', ice: 'GELO', fighting: 'LUTADOR', poison: 'VENENO',
    ground: 'TERRA', flying: 'VOADOR', psychic: 'PSÍQUICO', bug: 'INSETO',
    rock: 'PEDRA', ghost: 'FANTASMA', dragon: 'DRAGÃO', dark: 'SOMBRIO',
    steel: 'AÇO', fairy: 'FADA'
};

// ============================================================
// 1. INICIALIZAÇÃO
// ============================================================

// Função para gerar um ID fixo baseado no dia (Semente Diária)
function getDailySeed(total) {
    const hoje = new Date();
    const seedStr = hoje.getFullYear().toString() + hoje.getMonth() + hoje.getDate();
    const seed = parseInt(seedStr);
    // Algoritmo simples de "random" determinístico
    const x = Math.sin(seed) * 10000;
    return Math.floor((x - Math.floor(x)) * total) + 1;
}

function switchGame(mode) {
    currentGameMode = mode;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    resetGameState();

    if (mode === 'silhouette') {
        silhouetteWrapper.classList.remove('hidden');
        pokemonAlvo = alvoSilhouette;
        // Atualiza a imagem da silhueta para o alvo correto
        silhouetteImg.src = pokemonAlvo.sprites.other['official-artwork'].front_default;
    } else {
        silhouetteWrapper.classList.add('hidden');
        pokemonAlvo = alvoClassic;
    }

    containerChutes.classList.remove('hidden');
}

function resetGameState() {
    chutesRealizados = [];
    contadorTentativas = 0;
    document.getElementById('tentativas').innerText = "0";
    containerChutes.innerHTML = "";
    if (silhouetteImg) silhouetteImg.classList.remove('revealed');
}

async function iniciarJogo() {
    try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10000');
        const data = await res.json();
        listaNomesSocial = data.results;

        // Busca configurações do Admin para os jogos
        const resAdmin = await fetch('/admin/config/games');
        let configAdmin = {};
        if (resAdmin.ok) configAdmin = await resAdmin.json();

        // 1. Configura o Pokémon CLÁSSICO (Diário)
        // Prioridade: ID do Admin > Seed Diária
        const idSorteado = configAdmin.classic_id || getDailySeed(1025);
        const resClassic = await fetch(`https://pokeapi.co/api/v2/pokemon/${idSorteado}`);
        alvoClassic = await resClassic.json();

        const resEspClassic = await fetch(alvoClassic.species.url);
        const dataEspClassic = await resEspClassic.json();
        alvoClassic.geracao = extrairNumeroGeracao(dataEspClassic.generation.name);

        // 2. Configura o Pokémon SILHUETA (Independente e Aleatório)
        // Sorteia um ID que seja diferente do clássico
        let idAleatorio;
        do {
            idAleatorio = Math.floor(Math.random() * 1025) + 1;
        } while (idAleatorio === idSorteado);

        const resSil = await fetch(`https://pokeapi.co/api/v2/pokemon/${idAleatorio}`);
        alvoSilhouette = await resSil.json();

        const resEspSil = await fetch(alvoSilhouette.species.url);
        const dataEspSil = await resEspSil.json();
        alvoSilhouette.geracao = extrairNumeroGeracao(dataEspSil.generation.name);

        // Define o alvo inicial (Classic por padrão)
        pokemonAlvo = alvoClassic;

        console.log("Jogo Inicializado!");
        console.log("Dica Clássico:", alvoClassic.name);
        console.log("Dica Silhueta:", alvoSilhouette.name);

    } catch (error) {
        console.error("Erro ao iniciar o jogo:", error);
    }
}

function extrairNumeroGeracao(genNome) {
    const romanos = { i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6, vii: 7, viii: 8, ix: 9 };
    const parteRomana = genNome.split('-')[1];
    return romanos[parteRomana] || "?";
}

// ============================================================
// 2. AUTOCOMPLETE
// ============================================================

inputGame.addEventListener('input', function () {
    const valor = this.value.toLowerCase().trim();
    autocompleteList.innerHTML = '';
    if (!valor) return;

    const filtrados = listaNomesSocial.filter(p => p.name.startsWith(valor));
    const sugestoesLimitadas = filtrados.slice(0, 15);

    sugestoesLimitadas.forEach(pokemon => {
        const item = document.createElement('div');
        // Extrai o ID da URL da PokéAPI para montar o link da imagem
        const id = pokemon.url.split('/').filter(Boolean).pop();
        const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

        item.innerHTML = `
            <img src="${spriteUrl}" class="autocomplete-icon">
            <span><strong>${pokemon.name.substr(0, valor.length)}</strong>${pokemon.name.substr(valor.length)}</span>
        `;
        item.addEventListener('click', () => realizarChute(pokemon.name));
        autocompleteList.appendChild(item);
    });
});

// ============================================================
// 3. LÓGICA DO CHUTE
// ============================================================

async function realizarChute(nome) {
    const nomeLimpo = nome.toLowerCase();
    autocompleteList.innerHTML = '';
    inputGame.value = "";

    if (chutesRealizados.includes(nomeLimpo)) {
        inputGame.classList.add('erro-shake'); //
        setTimeout(() => inputGame.classList.remove('erro-shake'), 500);
        return;
    }

    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomeLimpo}`);
        const dataChute = await res.json();

        const resEspecie = await fetch(dataChute.species.url);
        const dataEspecie = await resEspecie.json();
        const genChute = extrairNumeroGeracao(dataEspecie.generation.name);

        chutesRealizados.push(nomeLimpo);
        contadorTentativas++;
        document.getElementById('tentativas').innerText = contadorTentativas;

        exibirComparacao(dataChute, genChute);
    } catch (e) {
        console.error("Erro ao processar chute");
    }
}

function exibirComparacao(chute, genChute) {
    const row = document.createElement('div');
    row.className = 'guess-row'; // Estilizado no CSS responsivo

    if (currentGameMode === 'silhouette') {
        const isCorrect = chute.name === pokemonAlvo.name;
        row.innerHTML = `
            <div class="pokemon-info">
                <img src="${chute.sprites.front_default}" alt="${chute.name}">
                <span>${chute.name.toUpperCase()}</span>
            </div>
            <div class="attributes">
                <div class="circle ${isCorrect ? 'correct' : ''}" style="width: 120px; border-radius: 10px;">
                    ${isCorrect ? 'CORRETO!' : 'ERRADO'}
                </div>
            </div>
        `;
    } else {
        const tiposAlvo = pokemonAlvo.types.map(t => t.type.name);

        // Tipos
        const htmlTipos = chute.types.map(slot => {
            const tipoIngles = slot.type.name;
            const tipoPt = traducaoTipos[tipoIngles] || tipoIngles.toUpperCase();
            const classeCor = tiposAlvo.includes(tipoIngles) ? 'correct' : '';
            return `<div class="circle ${classeCor}">${tipoPt}</div>`;
        }).join('');

        // Setas
        // No Flask, caminhos em JS devem apontar para a rota estática configurada (geralmente /static/)
        const imgSetaCima = `<img src="/static/uploads/utilidade/seta-cima.png" class="arrow-icon">`;
        const imgSetaBaixo = `<img src="/static/uploads/utilidade/seta-baixo.png" class="arrow-icon">`;

        let setaGen = genChute < pokemonAlvo.geracao ? imgSetaCima : genChute > pokemonAlvo.geracao ? imgSetaBaixo : '';
        let setaAltura = chute.height < pokemonAlvo.height ? imgSetaCima : chute.height > pokemonAlvo.height ? imgSetaBaixo : '';
        let setaPeso = chute.weight < pokemonAlvo.weight ? imgSetaCima : chute.weight > pokemonAlvo.weight ? imgSetaBaixo : '';

        row.innerHTML = `
            <div class="pokemon-info">
                <img src="${chute.sprites.front_default}" alt="${chute.name}">
                <span>${chute.name.toUpperCase()}</span>
            </div>
            <div class="attributes">
                <div class="circle ${genChute === pokemonAlvo.geracao ? 'correct' : ''}">
                    ${genChute}º ${setaGen}<br>GEN
                </div>
                ${htmlTipos} 
                <div class="circle ${chute.height === pokemonAlvo.height ? 'correct' : ''}">
                    ${chute.height / 10}M ${setaAltura}
                </div>
                <div class="circle ${chute.weight === pokemonAlvo.weight ? 'correct' : ''}">
                    ${chute.weight / 10}KG ${setaPeso}
                </div>
            </div>
        `;
    }

    containerChutes.prepend(row);

    if (chute.name === pokemonAlvo.name) {
        if (currentGameMode === 'silhouette') {
            silhouetteImg.classList.add('revealed');
        }
        setTimeout(() => mostrarModalVitoria(pokemonAlvo), 500);
    }
}

function mostrarModalVitoria(pokemon) {
    const modalHtml = `
        <div class="modal-overlay" id="modal-vitoria">
            <div class="modal-vitoria">
                <h2>PARABÉNS!</h2>
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
                <p>Você encontrou o <strong>${pokemon.name.toUpperCase()}</strong>!</p>
                <p>Tentativas: <strong>${contadorTentativas}</strong></p>
                <button class="btn-modal" onclick="location.reload()">JOGAR NOVAMENTE</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

document.addEventListener('click', (e) => {
    if (e.target !== inputGame) autocompleteList.innerHTML = '';
});

iniciarJogo();