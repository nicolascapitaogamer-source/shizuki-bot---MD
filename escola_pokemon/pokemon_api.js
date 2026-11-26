import fs from 'fs';

const CACHE_PATH = './pokemon_api_cache.json';

// Carrega o cache (se existir)
function carregarCache() {
    if (!fs.existsSync(CACHE_PATH)) return {};
    try { return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')); } catch(e) { return {}; }
}

function salvarCache(cache) {
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

// Traduz tipos da API pra português
const traduzirTipo = (tipoIngles) => {
    const mapa = {
        'normal': 'normal', 'fire': 'fogo', 'water': 'água', 'grass': 'grama',
        'electric': 'elétrico', 'ice': 'gelo', 'fighting': 'lutador', 'poison': 'venenoso',
        'ground': 'terra', 'flying': 'voador', 'psychic': 'psíquico', 'bug': 'inseto',
        'rock': 'pedra', 'ghost': 'fantasma', 'dragon': 'dragão', 'dark': 'sombrio',
        'steel': 'aço', 'fairy': 'fada'
    };
    return mapa[tipoIngles] || 'normal';
};

// Pega os ataques da API
async function buscarAtaques(nomePokemon) {
    const cache = carregarCache();
    const nomeLower = nomePokemon.toLowerCase().split(' (')[0];
    
    if (cache[nomeLower] && cache[nomeLower].ataques) {
        return cache[nomeLower].ataques;
    }

    try {
        // 1. Busca os dados do Pokémon
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomeLower}`);
        if (!res.ok) throw new Error('Pokémon não encontrado na API');
        const data = await res.json();
        
        // 2. Pega os 3 primeiros ataques (os mais básicos)
        const moves = data.moves.slice(0, 3).map(m => ({
            nome: m.move.name.replace('-', ' '),
            comando: m.move.name.replace('-', ''),
            dano: 'medio'
        }));
        
        // 3. Salva no cache
        if (!cache[nomeLower]) cache[nomeLower] = {};
        cache[nomeLower].ataques = moves;
        cache[nomeLower].tipo = traduzirTipo(data.types[0].type.name);
        salvarCache(cache);
        
        return moves;
    } catch (e) {
        // Fallback: ataques genéricos
        return [
            { nome: 'investida', comando: 'investida', dano: 'fraco' },
            { nome: 'rapido', comando: 'rapido', dano: 'medio' },
            { nome: 'hiper', comando: 'hiper', dano: 'especial' }
        ];
    }
}

// Pega a evolução da API
async function buscarEvolucao(nomePokemon) {
    const cache = carregarCache();
    const nomeLower = nomePokemon.toLowerCase().split(' (')[0];
    
    if (cache[nomeLower] && cache[nomeLower].evolucao) {
        return cache[nomeLower].evolucao;
    }

    try {
        // 1. Busca a espécie do Pokémon
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${nomeLower}`);
        if (!res.ok) throw new Error('Espécie não encontrada');
        const data = await res.json();
        
        // 2. Busca a cadeia de evolução
        const evoRes = await fetch(data.evolution_chain.url);
        const evoData = await evoRes.json();
        
        // 3. Extrai a evolução (próximo na cadeia)
        let atual = evoData.chain;
        let proximo = null;
        let nivelEvolucao = 16; // padrão
        
        while (atual) {
            if (atual.species.name.toLowerCase() === nomeLower) {
                if (atual.evolves_to.length > 0) {
                    proximo = atual.evolves_to[0].species.name;
                    // Tenta pegar o nível de evolução
                    const detalhes = atual.evolves_to[0].evolution_details[0];
                    if (detalhes && detalhes.min_level) {
                        nivelEvolucao = detalhes.min_level;
                    }
                }
                break;
            }
            atual = atual.evolves_to[0];
        }
        
        const resultado = {
            proximo: proximo ? proximo.charAt(0).toUpperCase() + proximo.slice(1) : null,
            nivelEvolucao: proximo ? nivelEvolucao : null
        };
        
        // Salva no cache
        if (!cache[nomeLower]) cache[nomeLower] = {};
        cache[nomeLower].evolucao = resultado;
        salvarCache(cache);
        
        return resultado;
    } catch (e) {
        return { proximo: null, nivelEvolucao: null };
    }
}

export { buscarAtaques, buscarEvolucao };
