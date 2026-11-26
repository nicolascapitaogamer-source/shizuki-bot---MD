// Banco de ataques por tipo de Pokémon
export const ataquesPorTipo = {
    "elétrico": [
        { nome: "Choque do Trovão", comando: "choque", dano: "fraco", desc: "Um raio rápido atinge o inimigo." },
        { nome: "Trovão", comando: "trovao", dano: "medio", desc: "Um poderoso trovão cai sobre o Boss." },
        { nome: "Tempestade Elétrica", comando: "tempestade", dano: "especial", desc: "Uma tempestade devastadora atinge o campo." }
    ],
    "fogo": [
        { nome: "Brasa", comando: "brasa", dano: "fraco", desc: "Pequenas chamas atingem o inimigo." },
        { nome: "Lança-Chamas", comando: "lanca", dano: "medio", desc: "Um jato de fogo poderoso." },
        { nome: "Explosão de Fogo", comando: "explosao", dano: "especial", desc: "Uma explosão flamejante massiva." }
    ],
    "água": [
        { nome: "Jato d'Água", comando: "jato", dano: "fraco", desc: "Um jato de água atinge o inimigo." },
        { nome: "Surf", comando: "surf", dano: "medio", desc: "Uma onda gigante atinge o Boss." },
        { nome: "Hidro Bomba", comando: "hidro", dano: "especial", desc: "Uma explosão de água devastadora." }
    ],
    "grama": [
        { nome: "Chicote de Vinha", comando: "chicote", dano: "fraco", desc: "Vinhas batem no inimigo." },
        { nome: "Folha Navalha", comando: "folha", dano: "medio", desc: "Folhas cortantes voam na direção do Boss." },
        { nome: "Raio Solar", comando: "solar", dano: "especial", desc: "Um feixe de luz solar atinge o inimigo." }
    ],
    "normal": [
        { nome: "Investida", comando: "investida", dano: "fraco", desc: "Um ataque físico simples." },
        { nome: "Ataque Rápido", comando: "rapido", dano: "medio", desc: "Um ataque veloz e certeiro." },
        { nome: "Hiper Raio", comando: "hiper", dano: "especial", desc: "Um poderoso raio de energia." }
    ],
    "lutador": [
        { nome: "Golpe Baixo", comando: "golpe", dano: "fraco", desc: "Um golpe rápido." },
        { nome: "Soco Dinâmico", comando: "soco", dano: "medio", desc: "Um soco poderoso." },
        { nome: "Golpe Fatal", comando: "fatal", dano: "especial", desc: "Um golpe que derruba qualquer um." }
    ],
    "psíquico": [
        { nome: "Confusão", comando: "confusao", dano: "fraco", desc: "Um ataque mental fraco." },
        { nome: "Psíquico", comando: "psiquico", dano: "medio", desc: "Um ataque mental poderoso." },
        { nome: "Psico Boost", comando: "psicoboost", dano: "especial", desc: "Uma explosão de energia mental." }
    ],
    "dragão": [
        { nome: "Presas do Dragão", comando: "presas", dano: "fraco", desc: "Uma mordida dracônica." },
        { nome: "Garra do Dragão", comando: "garra", dano: "medio", desc: "Garras afiadas atacam o Boss." },
        { nome: "Fúria do Dragão", comando: "furia", dano: "especial", desc: "A fúria de um dragão lendário." }
    ]
};

// Função pra pegar o tipo do Pokémon
export function getTipoPokemon(nome) {
    const tipos = {
        "zapdos": "elétrico",
        "pikachu": "elétrico",
        "raichu": "elétrico",
        "charizard": "fogo",
        "charmander": "fogo",
        "charmeleon": "fogo",
        "squirtle": "água",
        "wartortle": "água",
        "blastoise": "água",
        "bulbasaur": "grama",
        "ivysaur": "grama",
        "venusaur": "grama",
        "mewtwo": "psíquico",
        "mew": "psíquico",
        "dragonite": "dragão",
        "gyarados": "água",
        "onix": "normal"
    };
    return tipos[nome.toLowerCase()] || "normal";
}
