// ============================================================
// SOCIAL.JS — POKÉDLE DIÁRIO
// 3 modos: Clássico (comparação de atributos), Silhueta,
//          Pixel (imagem pixelada progressivamente revelada)
// ============================================================

// ── Cores por tipo ──────────────────────────────────────────
const COR_TIPO_S = {
    normal:'#A8A878', fire:'#F08030', water:'#6890F0', electric:'#F8D030',
    grass:'#78C850', ice:'#98D8D8', fighting:'#C03028', poison:'#A040A0',
    ground:'#E0C068', flying:'#A890F0', psychic:'#F85888', bug:'#A8B820',
    rock:'#B8A038', ghost:'#705898', dragon:'#7038F8', dark:'#705848',
    steel:'#B8B8D0', fairy:'#EE99AC'
};

// ── Cores das espécies (campo color.name da PokeAPI) ────────
const COR_ESPECIE_BG = {
    black: '#444', blue: '#4d7fd0', brown: '#8B5A2B', gray: '#7a7a7a',
    green: '#3a8a3a', pink: '#d0608a', purple: '#7a45a0', red: '#c03838',
    white: '#b0b0b0', yellow: '#b8960a'
};
const COR_ESPECIE_LABEL = {
    black:'Preta', blue:'Azul', brown:'Marrom', gray:'Cinza',
    green:'Verde', pink:'Rosa', purple:'Roxa', red:'Vermelha',
    white:'Branca', yellow:'Amarela'
};
const COR_ESPECIE_LABEL_EN = {
    black:'Black', blue:'Blue', brown:'Brown', gray:'Gray',
    green:'Green', pink:'Pink', purple:'Purple', red:'Red',
    white:'White', yellow:'Yellow'
};

// ── Passos de pixelação (px renderizados → escalados para 180px)
// Índice 0 = mais pixelado, índice 6 = imagem completa
const PIXEL_STEPS = [5, 8, 13, 22, 38, 68, 180];
const MAX_TENT    = 6;

// ── Estado por modo ─────────────────────────────────────────
const gs = {
    classic:    { target:null, species:null, guesses:[], done:false },
    silhouette: { target:null, species:null, guesses:[], done:false, wrong:0 },
    pixel:      { target:null, species:null, guesses:[], done:false, wrong:0 }
};

let modoAtual   = 'classic';
let pkList      = [];      // Nomes para autocomplete
let pixelImgEl  = null;    // Elemento <img> do canvas

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', async function () {
    mostrarLoading(true);
    try {
        await Promise.all([carregarListaPK(), carregarTargets()]);
    } catch (err) {
        console.error('[Pokédle] Erro na inicialização:', err);
    }
    mostrarLoading(false);
    renderizarModo('classic');
    configurarInput();
});

function mostrarLoading(sim) {
    var gc = document.getElementById('guesses-container');
    if (!gc) return;
    gc.innerHTML = sim ? '<p class="social-loading">Carregando Pokédle</p>' : '';
}

// ── Lista de Pokémon (gen 1–2 com fallback hardcoded) ───────
async function carregarListaPK() {
    var chave = 'social_pk_list_v3';
    try {
        var cached = localStorage.getItem(chave);
        if (cached) { pkList = JSON.parse(cached); return; }
        var res  = await fetch('https://pokeapi.co/api/v2/pokemon?limit=251&offset=0');
        var data = await res.json();
        pkList = data.results.map(function (p) { return p.name; });
        localStorage.setItem(chave, JSON.stringify(pkList));
    } catch (e) {
        pkList = [
            'bulbasaur','ivysaur','venusaur','charmander','charmeleon','charizard',
            'squirtle','wartortle','blastoise','caterpie','metapod','butterfree',
            'weedle','kakuna','beedrill','pidgey','pidgeotto','pidgeot','rattata',
            'raticate','spearow','fearow','ekans','arbok','pikachu','raichu',
            'sandshrew','sandslash','nidoran-f','nidorina','nidoqueen','nidoran-m',
            'nidorino','nidoking','clefairy','clefable','vulpix','ninetales',
            'jigglypuff','wigglytuff','zubat','golbat','oddish','gloom','vileplume',
            'paras','parasect','venonat','venomoth','diglett','dugtrio','meowth',
            'persian','psyduck','golduck','mankey','primeape','growlithe','arcanine',
            'poliwag','poliwhirl','poliwrath','abra','kadabra','alakazam','machop',
            'machoke','machamp','bellsprout','weepinbell','victreebel','tentacool',
            'tentacruel','geodude','graveler','golem','ponyta','rapidash','slowpoke',
            'slowbro','magnemite','magneton','farfetchd','doduo','dodrio','seel',
            'dewgong','grimer','muk','shellder','cloyster','gastly','haunter',
            'gengar','onix','drowzee','hypno','krabby','kingler','voltorb',
            'electrode','exeggcute','exeggutor','cubone','marowak','hitmonlee',
            'hitmonchan','lickitung','koffing','weezing','rhyhorn','rhydon','chansey',
            'tangela','kangaskhan','horsea','seadra','goldeen','seaking','staryu',
            'starmie','mr-mime','scyther','jynx','electabuzz','magmar','pinsir',
            'tauros','magikarp','gyarados','lapras','ditto','eevee','vaporeon',
            'jolteon','flareon','porygon','omanyte','omastar','kabuto','kabutops',
            'aerodactyl','snorlax','articuno','zapdos','moltres','dratini',
            'dragonair','dragonite','mewtwo','mew',
            // Gen 2
            'chikorita','bayleef','meganium','cyndaquil','quilava','typhlosion',
            'totodile','croconaw','feraligatr','sentret','furret','hoothoot',
            'noctowl','ledyba','ledian','spinarak','ariados','crobat','chinchou',
            'lanturn','pichu','cleffa','igglybuff','togepi','togetic','natu',
            'xatu','mareep','flaaffy','ampharos','bellossom','marill','azumarill',
            'sudowoodo','politoed','hoppip','skiploom','jumpluff','aipom','sunkern',
            'sunflora','yanma','wooper','quagsire','espeon','umbreon','murkrow',
            'slowking','misdreavus','unown','wobbuffet','girafarig','pineco',
            'forretress','dunsparce','gligar','steelix','snubbull','granbull',
            'qwilfish','scizor','shuckle','heracross','sneasel','teddiursa',
            'ursaring','slugma','magcargo','swinub','piloswine','corsola','remoraid',
            'octillery','delibird','mantine','skarmory','houndour','houndoom',
            'kingdra','phanpy','donphan','porygon2','stantler','smeargle',
            'tyrogue','hitmontop','smoochum','elekid','magby','miltank','blissey',
            'raikou','entei','suicune','larvitar','pupitar','tyranitar',
            'lugia','ho-oh','celebi'
        ];
    }
}

// ── Carregar targets via API do admin ────────────────────────
async function carregarTargets() {
    var config = {};
    try {
        var res = await fetch('/admin/config/games');
        if (res.ok) config = await res.json();
    } catch (e) { /* sem target configurado */ }

    // Cada modo tem seu próprio Pokémon — admin configura clássico e silhueta;
    // pixel sempre usa seed diária independente (offset 3 → ID distinto do dia)
    var classicId = config.classic_id    || seedDiario(0);
    var silhId    = config.silhouette_id || seedDiario(1);
    var pixelId   = seedDiario(3); // sempre diferente dos outros dois

    await Promise.all([
        fetchTarget('classic',    classicId),
        fetchTarget('silhouette', silhId),
        fetchTarget('pixel',      pixelId)
    ]);
}

async function fetchTarget(modo, idOuNome) {
    try {
        var pokeRes = await fetch('https://pokeapi.co/api/v2/pokemon/' + idOuNome);
        if (!pokeRes.ok) throw new Error('pk not found');
        var poke = await pokeRes.json();
        var specRes = await fetch(poke.species.url);
        gs[modo].target  = poke;
        gs[modo].species = await specRes.json();
    } catch (e) {
        // Fallback: Pikachu
        try {
            var r = await fetch('https://pokeapi.co/api/v2/pokemon/25');
            var p = await r.json();
            var s = await fetch(p.species.url);
            gs[modo].target  = p;
            gs[modo].species = await s.json();
        } catch (_) { /* silencioso */ }
    }
}

function aleatorioGen1() { return Math.floor(Math.random() * 151) + 1; }

// ── Seed diário determinístico: mesmo número para todos no dia,
//    mas diferente a cada offset → garante Pokémon distintos por modo
function seedDiario(offset) {
    var d = new Date();
    var n = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    // LCG simples — offsets bem separados para evitar colisões
    var h = ((n + offset * 9973) * 1664525 + 1013904223) >>> 0;
    return (h % 251) + 1; // ID 1–251
}

// ============================================================
// RENDERIZAÇÃO POR MODO
// ============================================================

function renderizarModo(modo) {
    modoAtual = modo;

    // Ativar aba
    ['classic', 'silhouette', 'pixel'].forEach(function (m) {
        var btn = document.getElementById('tab-' + m);
        if (btn) btn.classList.toggle('active', m === modo);
    });

    // Mostrar / ocultar wrappers visuais
    toggle('silhouette-wrapper', modo === 'silhouette');
    toggle('pixel-wrapper',      modo === 'pixel');
    toggle('classic-header',     modo === 'classic');

    // Limpar estado da UI
    document.getElementById('guesses-container').innerHTML = '';
    document.getElementById('resultado-overlay').classList.add('hidden');

    var inp = document.getElementById('game-input');
    var btn = document.getElementById('btn-adivinhar');
    inp.value = '';
    inp.disabled = false;
    btn.disabled = false;

    // Reiniciar dots
    for (var i = 0; i < MAX_TENT; i++) {
        var dot = document.getElementById('dot-' + i);
        if (dot) dot.className = 'dot';
    }

    // Inicializar visual do modo
    if (modo === 'silhouette') iniciarSilhueta();
    if (modo === 'pixel')      iniciarPixel();

    // Re-renderizar palpites já feitos (ao trocar de aba)
    var state = gs[modo];
    state.guesses.forEach(function (g, i) {
        adicionarLinha(g, modo);
        var d = document.getElementById('dot-' + i);
        if (d) d.classList.add(g.correto ? 'acerto' : 'usado');
    });

    // Se já terminou, reexibir resultado
    if (state.done) {
        var ganhou = state.guesses.some(function (g) { return g.correto; });
        setTimeout(function () { mostrarResultado(ganhou, modo); }, 100);
        inp.disabled = true;
        btn.disabled = true;
    }
}

// ── Silhueta: exibir imagem como sombra ─────────────────────
function iniciarSilhueta() {
    var state = gs.silhouette;
    if (!state.target) return;

    var img = document.getElementById('silhouette-img');
    var url = artwork(state.target);
    if (url) img.src = url;

    // Nível de revelação baseado em erros
    atualizarSilhueta();

    // Hint: traços representando as letras do nome
    document.getElementById('silhouette-hint').textContent = nomeParaTracos(state.target.name);
}

function atualizarSilhueta() {
    var state = gs.silhouette;
    var img = document.getElementById('silhouette-img');
    if (!img) return;

    if (state.done) {
        img.style.filter = 'brightness(1)';
        var hint = document.getElementById('silhouette-hint');
        if (hint) hint.textContent = capitalize(state.target.name);
        return;
    }

    // brightness de 0 (sombra total) → 0.8 (quase revelado) ao longo de 6 erros
    var levels = [0, 0.12, 0.25, 0.4, 0.58, 0.78];
    var b = levels[Math.min(state.wrong, levels.length - 1)];
    img.style.filter = 'brightness(' + b + ')';
}

// ── Pixel: canvas com efeito pixelado ───────────────────────
function iniciarPixel() {
    var state = gs.pixel;
    if (!state.target) return;

    var hint = document.getElementById('pixel-hint');
    if (hint) hint.textContent = nomeParaTracos(state.target.name);

    var url = artwork(state.target);
    if (!url) return;

    var canvas = document.getElementById('pixel-canvas');

    // Se já temos a imagem carregada, só redesenhar
    if (pixelImgEl && pixelImgEl.src === url && pixelImgEl.complete) {
        var step = state.done ? PIXEL_STEPS[PIXEL_STEPS.length - 1] : PIXEL_STEPS[state.wrong] || PIXEL_STEPS[0];
        desenharPixelado(canvas, pixelImgEl, step);
        return;
    }

    var imgEl = new Image();
    imgEl.crossOrigin = 'anonymous';
    imgEl.onload = function () {
        pixelImgEl = imgEl;
        var step = state.done ? PIXEL_STEPS[PIXEL_STEPS.length - 1] : PIXEL_STEPS[state.wrong] || PIXEL_STEPS[0];
        desenharPixelado(canvas, imgEl, step);
    };
    imgEl.onerror = function () {
        // CORS fallback: tentar sprite menor (front_default)
        var fallback = state.target.sprites.front_default;
        if (fallback && imgEl.src !== fallback) {
            imgEl.crossOrigin = 'anonymous';
            imgEl.src = fallback;
        }
    };
    imgEl.src = url;
}

function desenharPixelado(canvas, img, pixelSize) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (pixelSize >= W) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, W, H);
        return;
    }

    // Renderizar pequeno e escalar com pixelização
    var tmp    = document.createElement('canvas');
    tmp.width  = pixelSize;
    tmp.height = pixelSize;
    var tCtx = tmp.getContext('2d');
    tCtx.drawImage(img, 0, 0, pixelSize, pixelSize);

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, 0, 0, W, H);
}

function atualizarPixel() {
    var state = gs.pixel;
    if (!pixelImgEl || !pixelImgEl.complete) { iniciarPixel(); return; }
    var step = state.done ? PIXEL_STEPS[PIXEL_STEPS.length - 1] : PIXEL_STEPS[Math.min(state.wrong, PIXEL_STEPS.length - 2)];
    desenharPixelado(document.getElementById('pixel-canvas'), pixelImgEl, step);

    if (state.done) {
        var hint = document.getElementById('pixel-hint');
        if (hint) hint.textContent = capitalize(state.target.name);
    }
}

// ============================================================
// INPUT E AUTOCOMPLETE
// ============================================================

function configurarInput() {
    var input = document.getElementById('game-input');
    var lista = document.getElementById('social-autocomplete-list');
    if (!input || !lista) return;

    input.addEventListener('input', function () {
        var val = input.value.toLowerCase().trim();
        lista.innerHTML = '';
        if (val.length < 2) return;

        var sugestoes = pkList.filter(function (n) {
            return n.toLowerCase().includes(val);
        }).slice(0, 8);

        sugestoes.forEach(function (nome) {
            var div = document.createElement('div');
            div.textContent = nome;
            div.addEventListener('mousedown', function (e) {
                e.preventDefault();
                input.value = nome;
                lista.innerHTML = '';
            });
            lista.appendChild(div);
        });
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { lista.innerHTML = ''; tentarAdivinhar(); }
        if (e.key === 'Escape') lista.innerHTML = '';
    });

    document.addEventListener('click', function (e) {
        if (e.target !== input) lista.innerHTML = '';
    });
}

// ============================================================
// ADIVINHAR
// ============================================================

async function tentarAdivinhar() {
    var input = document.getElementById('game-input');
    var state = gs[modoAtual];
    var nome  = input.value.trim().toLowerCase().replace(/\s+/g, '-');

    if (!nome || !state.target || state.done) return;

    // Verificar duplicata
    if (state.guesses.some(function (g) { return g.data.name === nome; })) {
        piscarErro(input, 'Você já tentou esse Pokémon!');
        return;
    }

    // Desabilitar enquanto busca
    var btnAdv = document.getElementById('btn-adivinhar');
    input.disabled = true;
    btnAdv.disabled = true;

    var guessData = null, guessSpecies = null;
    try {
        var pokeRes = await fetch('https://pokeapi.co/api/v2/pokemon/' + nome);
        if (!pokeRes.ok) throw new Error('not found');
        guessData = await pokeRes.json();
        var specRes = await fetch(guessData.species.url);
        guessSpecies = await specRes.json();
    } catch (e) {
        piscarErro(input, 'Pokémon não encontrado. Verifique o nome!');
        input.disabled = false;
        btnAdv.disabled = false;
        return;
    }

    var correto = guessData.id === state.target.id;
    var tentIdx = state.guesses.length;

    var palpite = { nome: guessData.name, data: guessData, species: guessSpecies, correto: correto };
    state.guesses.push(palpite);

    // Atualizar dot
    var dot = document.getElementById('dot-' + tentIdx);
    if (dot) dot.classList.add(correto ? 'acerto' : 'usado');

    // Adicionar linha ao container
    adicionarLinha(palpite, modoAtual);

    // Atualizar visual dos modos imersivos
    if (!correto) {
        if (modoAtual === 'silhouette') { state.wrong++; atualizarSilhueta(); }
        if (modoAtual === 'pixel')      { state.wrong++; atualizarPixel(); }
    }

    // Checar fim de jogo
    var maxAtingido = state.guesses.length >= MAX_TENT;
    if (correto || maxAtingido) {
        state.done = true;

        if (!correto) {
            // Revelar target nos modos visuais
            if (modoAtual === 'silhouette') atualizarSilhueta();
            if (modoAtual === 'pixel')      atualizarPixel();
        }

        setTimeout(function () { mostrarResultado(correto, modoAtual); }, correto ? 600 : 900);
        input.disabled = true;
        btnAdv.disabled = true;
    } else {
        input.disabled = false;
        btnAdv.disabled = false;
    }

    input.value = '';
    if (!state.done) input.focus();
}

function piscarErro(input, msg) {
    var orig = input.placeholder;
    input.style.borderColor = '#ef5350';
    input.style.boxShadow   = '0 0 12px rgba(239,83,80,0.35)';
    input.value       = '';
    input.placeholder = msg;
    setTimeout(function () {
        input.style.borderColor = '';
        input.style.boxShadow   = '';
        input.placeholder = orig;
    }, 2600);
}

// ============================================================
// LINHAS DE PALPITE
// ============================================================

function adicionarLinha(palpite, modo) {
    var container = document.getElementById('guesses-container');
    if (modo === 'classic') {
        container.appendChild(linhaClassica(palpite));
    } else {
        container.appendChild(linhaSimples(palpite));
    }
}

// Linha simples para Silhueta / Pixel
function linhaSimples(palpite) {
    var div = document.createElement('div');
    div.className = 'guess-simples';

    var sprite = palpite.data.sprites.front_default || '';
    var imgHtml = sprite ? '<img src="' + sprite + '" style="width:38px;height:38px;object-fit:contain;image-rendering:pixelated;">' : '';

    div.innerHTML = imgHtml +
        '<span class="gs-nome">' + palpite.nome + '</span>' +
        '<span class="gs-badge ' + (palpite.correto ? 'certo' : 'errado') + '">' +
        (palpite.correto ? '✓ CERTO' : '✗ ERRADO') + '</span>';

    return div;
}

// Linha com 5 células coloridas para Clássico
// Colunas: Sprite | Nome | Tipo | Cor | Gen | Peso | Lendário
function linhaClassica(palpite) {
    var g        = palpite.data;
    var gsp      = palpite.species;
    var target   = gs.classic.target;
    var targetSp = gs.classic.species;

    // ── Tipo ────────────────────────────────────────────────
    var gTypes = g.types.map(function (t) { return t.type.name; });
    var tTypes = target.types.map(function (t) { return t.type.name; });
    var tipoClass;
    if (arrIguais(gTypes, tTypes))                                        tipoClass = 'verde';
    else if (gTypes.some(function (tp) { return tTypes.includes(tp); })) tipoClass = 'amarelo';
    else                                                                   tipoClass = 'vermelho';

    var tipoPills = gTypes.map(function (tp) {
        var bg    = COR_TIPO_S[tp] || '#888';
        var label = (typeof t === 'function') ? (t('tipo.' + tp) || tp) : tp;
        return '<span class="type-pill" style="background:' + bg + '">' + label + '</span>';
    }).join('');

    // ── Cor da espécie ───────────────────────────────────────
    var gCor = gsp.color ? gsp.color.name : '';
    var tCor = targetSp.color ? targetSp.color.name : '';
    var corClass = (gCor && gCor === tCor) ? 'verde' : 'vermelho';
    var corBg    = COR_ESPECIE_BG[gCor] || '#888';
    var corLabel = (typeof t === 'function' && t('cor.' + gCor) !== 'cor.' + gCor)
        ? t('cor.' + gCor)
        : (COR_ESPECIE_LABEL[gCor] || gCor);

    // ── Geração ─────────────────────────────────────────────
    var gGen = genDaEspecie(gsp);
    var tGen = genDaEspecie(targetSp);
    var genClass = gGen === tGen ? 'verde' : Math.abs(gGen - tGen) === 1 ? 'amarelo' : 'vermelho';
    // ▲ = alvo está numa geração maior; ▼ = alvo está numa geração menor
    var genSeta = gGen === tGen ? '' : (tGen > gGen ? '▲' : '▼');

    // ── Peso (PokeAPI em hectogramas → dividir por 10 = kg) ──
    var gPeso = g.weight;       // hg
    var tPeso = target.weight;  // hg
    var pesoDiff  = Math.abs(gPeso - tPeso);
    var pesoClass = pesoDiff === 0 ? 'verde' : pesoDiff <= 100 ? 'amarelo' : 'vermelho'; // ±10 kg
    // ▲ = alvo é mais pesado; ▼ = alvo é mais leve
    var pesoSeta  = gPeso === tPeso ? '' : (tPeso > gPeso ? '▲' : '▼');
    var pesoLabel = (gPeso / 10).toFixed(1) + ' kg';

    // ── Lendário / Mítico ────────────────────────────────────
    var gLend = gsp.is_legendary || gsp.is_mythical;
    var tLend = targetSp.is_legendary || targetSp.is_mythical;
    var lendClass = gLend === tLend ? 'verde' : 'vermelho';
    var lendTxt   = gLend ? 'SIM' : 'NÃO';

    var sprite = g.sprites.front_default || '';

    // Monta célula com valor e seta em linhas separadas
    function celula(cls, conteudo, seta) {
        return '<div class="gc cell-' + cls + '">' + conteudo +
               (seta ? '<span class="gc-seta">' + seta + '</span>' : '') + '</div>';
    }

    var row = document.createElement('div');
    row.className = 'guess-row';
    row.innerHTML =
        '<div class="gc gc-sprite">' + (sprite ? '<img src="' + sprite + '" alt="' + g.name + '">' : '') + '</div>' +
        '<div class="gc gc-nome">' + g.name + '</div>' +
        celula(tipoClass, tipoPills, '') +
        '<div class="gc cell-' + corClass + '">' +
            '<span class="cor-dot" style="background:' + corBg + '"></span>' +
            '<span class="gc-val">' + corLabel + '</span>' +
        '</div>' +
        celula(genClass, '<span class="gc-val">GEN ' + gGen + '</span>', genSeta) +
        celula(pesoClass, '<span class="gc-val">' + pesoLabel + '</span>', pesoSeta) +
        '<div class="gc cell-' + lendClass + '"><span class="gc-val lend-txt">' + lendTxt + '</span></div>';

    return row;
}

// ============================================================
// RESULTADO
// ============================================================

function mostrarResultado(ganhou, modo) {
    var state  = gs[modo];
    var target = state.target;
    var nTent  = state.guesses.length;
    var art    = artwork(target);
    var nomeT  = target.name;

    // Grade de emojis para compartilhar
    var emojiGrid = gerarEmojiGrid(modo);

    var modeLabel = { classic:'Clássico', silhouette:'Silhueta', pixel:'Pixel' }[modo] || modo;

    var card = document.getElementById('resultado-card');
    card.className = 'resultado-card ' + (ganhou ? 'vitoria' : 'derrota');

    var artHtml  = art ? '<img src="' + art + '" class="resultado-art" alt="' + nomeT + '">' : '';
    var titleHtml = '<h2 class="' + (ganhou ? 'vit' : 'der') + '">' + (ganhou ? '🎉 ACERTOU!' : '😔 GAME OVER') + '</h2>';
    var descHtml;
    if (ganhou) {
        descHtml = '<p>Você acertou em <strong>' + nTent + '</strong> tentativa' + (nTent !== 1 ? 's' : '') + '!</p>';
    } else {
        descHtml = '<p>O Pokémon era:</p><p class="nome-pokemon">' + nomeT + '</p>';
    }
    var emojiHtml  = emojiGrid ? '<div class="resultado-emoji-grid">' + emojiGrid + '</div>' : '';

    var proximoM   = proximoModo(modo);
    var proxLabel  = { classic:'Clássico', silhouette:'Silhueta', pixel:'Pixel' }[proximoM];

    // Codificar dados para o botão inline
    var emojiEsc = emojiGrid.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    var tentStr  = ganhou ? String(nTent) : 'X';

    card.innerHTML =
        artHtml + titleHtml + descHtml + emojiHtml +
        '<div class="resultado-btns">' +
            '<button class="btn-resultado compartilhar" onclick="compartilhar(\'' + modeLabel + '\',\'' + tentStr + '\')">' +
            '📋 Compartilhar</button>' +
            '<button class="btn-resultado proxima" onclick="switchGame(\'' + proximoM + '\')">' +
            'Tentar ' + proxLabel + ' →</button>' +
        '</div>';

    // Guardar emoji grid no dataset do card para usar no compartilhar
    card.dataset.emojiGrid = emojiGrid;

    document.getElementById('resultado-overlay').classList.remove('hidden');
}

function compartilhar(modeLabel, tentStr) {
    var card = document.getElementById('resultado-card');
    var grid = card.dataset.emojiGrid || '';
    var txt  = '🎮 Pokédle ' + modeLabel + ' — ' + tentStr + '/' + MAX_TENT + '\n' + grid;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () {
            alert('Resultado copiado para a área de transferência!');
        }).catch(function () { fallbackCopy(txt); });
    } else {
        fallbackCopy(txt);
    }
}

function fallbackCopy(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('Resultado copiado!');
}

function gerarEmojiGrid(modo) {
    var state    = gs[modo];
    var target   = state.target;
    var targetSp = state.species;

    if (modo === 'classic') {
        // Ordem: Tipo | Cor | Gen | Peso | Lendário
        return state.guesses.map(function (p) {
            if (p.correto) return '🟢🟢🟢🟢🟢';
            var g   = p.data;
            var gsp = p.species;
            // Tipo
            var gT  = g.types.map(function (x) { return x.type.name; });
            var tT  = target.types.map(function (x) { return x.type.name; });
            var e1  = arrIguais(gT, tT) ? '🟢' : gT.some(function (x) { return tT.includes(x); }) ? '🟡' : '🔴';
            // Cor
            var gC  = gsp.color ? gsp.color.name : '';
            var tC  = targetSp.color ? targetSp.color.name : '';
            var e2  = gC === tC ? '🟢' : '🔴';
            // Geração
            var gG  = genDaEspecie(gsp), tG = genDaEspecie(targetSp);
            var e3  = gG === tG ? '🟢' : Math.abs(gG - tG) === 1 ? '🟡' : '🔴';
            // Peso
            var pesoDiff = Math.abs(g.weight - target.weight);
            var e4  = pesoDiff === 0 ? '🟢' : pesoDiff <= 100 ? '🟡' : '🔴';
            // Lendário
            var gL  = gsp.is_legendary || gsp.is_mythical;
            var tL  = targetSp.is_legendary || targetSp.is_mythical;
            var e5  = gL === tL ? '🟢' : '🔴';
            return e1 + e2 + e3 + e4 + e5;
        }).join('\n');
    }

    // Silhueta / Pixel — linha simples de emojis
    return state.guesses.map(function (p) { return p.correto ? '🟢' : '🔴'; }).join('');
}

// ============================================================
// UTILITÁRIOS
// ============================================================

function switchGame(modo) {
    document.getElementById('social-autocomplete-list').innerHTML = '';
    renderizarModo(modo);
}

function proximoModo(modo) {
    var ordem = ['classic', 'silhouette', 'pixel'];
    return ordem[(ordem.indexOf(modo) + 1) % ordem.length];
}

function genDaEspecie(species) {
    var map = {
        'generation-i':1, 'generation-ii':2, 'generation-iii':3,
        'generation-iv':4, 'generation-v':5, 'generation-vi':6,
        'generation-vii':7, 'generation-viii':8, 'generation-ix':9
    };
    return (species && species.generation) ? (map[species.generation.name] || 1) : 1;
}

function arrIguais(a, b) {
    var sa = a.slice().sort(), sb = b.slice().sort();
    return sa.length === sb.length && sa.every(function (v, i) { return v === sb[i]; });
}

function artwork(pokemon) {
    return (pokemon.sprites.other &&
            pokemon.sprites.other['official-artwork'] &&
            pokemon.sprites.other['official-artwork'].front_default) ||
           pokemon.sprites.front_default || '';
}

function nomeParaTracos(nome) {
    return nome.split('').map(function (c) { return c === '-' ? ' – ' : '＿'; }).join(' ');
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggle(id, visible) {
    var el = document.getElementById(id);
    if (!el) return;
    if (visible) el.classList.remove('hidden');
    else         el.classList.add('hidden');
}
