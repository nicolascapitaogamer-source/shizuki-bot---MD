import { getAluno, salvarEscola, carregarEscola } from './escola_core.js';
import { ataquesPokemon } from './ataques_db.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

// ============ CRIAR MISSÃO EM GRUPO ============
export async function criarMissaoGrupo(sock, msg, from, sender) {
    const db = carregarEscola();
    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const userPoke = dbPoke[sender];
    
    if (!userPoke || !userPoke.time || userPoke.time.length === 0) {
        await sock.sendMessage(from, { 
            text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ ❌ *Você não pode criar uma missão* \n┃ *em grupo sem Pokémon!*\n┃\n┃ 🎯 *Capture um antes de começar.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯` 
        }, { quoted: msg });
        return;
    }

    if (db[from] && db[from].missaoGrupoAtiva) {
        await sock.sendMessage(from, { text: '⚠️ Já tem uma missão em grupo rolando neste grupo!' }, { quoted: msg });
        return;
    }

    const boss = {
        nome: "Mewtwo Corrompido",
        hp: 1000,
        dano: 50,
        recompensa: 5000,
        xp: 1000
    };

    const enviado = await sock.sendMessage(from, {
        text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃    🤝 𝐌𝐈𝐒𝐒𝐀̃𝐎 𝐄𝐌 𝐆𝐑𝐔𝐏𝐎    ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n┃\n┃ 🌋 *Um Boss lendário apareceu!*\n┃\n┃ 👹 *${boss.nome}*\n┃ ❤️ *HP:* ${boss.hp}/${boss.hp}\n┃ ⚔️ *Dano:* ${boss.dano}\n┃\n┃ 🎯 *Precisamos de 3 treinadores!*\n┃\n┃ 👥 *Participantes:* 1/3\n┃\n┃ ✍️ *Marque esta mensagem e responda:*\n┃ 🙋 *participar*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    db[from] = {
        ...db[from],
        missaoGrupoAtiva: {
            bossNome: boss.nome,
            bossHp: boss.hp,
            bossHpMax: boss.hp,
            bossDano: boss.dano,
            recompensa: boss.recompensa,
            xp: boss.xp,
            participantes: [sender],
            msgId: enviado.key.id,
            ativo: false,
            turno: 0,
            pokesEscolhidos: {},
            escolhendoPoke: null,
            msgIdLista: null
        }
    };
    salvarEscola(db);
}

// ============ ENTRAR NA MISSÃO EM GRUPO ============
export async function entrarMissaoGrupo(sock, msg, from, sender, text, stanzaId) {
    const db = carregarEscola();
    const missao = db[from]?.missaoGrupoAtiva;
    if (!missao || missao.msgId !== stanzaId) return false;
    if (text.toLowerCase() !== 'participar') return false;

    if (missao.participantes.includes(sender)) {
        await sock.sendMessage(from, { text: '⚠️ Você já tá participando!' }, { quoted: msg });
        return true;
    }

    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const userPoke = dbPoke[sender];
    if (!userPoke || !userPoke.time || userPoke.time.length === 0) {
        await sock.sendMessage(from, { 
            text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ ❌ *@${sender.split('@')[0]}, você* \n┃ *não tem nenhum Pokémon!*\n┃\n┃ 🎯 *Capture um antes de entrar.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`,
            mentions: [sender]
        }, { quoted: msg });
        return true;
    }

    missao.participantes.push(sender);
    salvarEscola(db);
    
    if (missao.participantes.length >= 3) {
        // Começa a escolha de Pokémon
        missao.ativo = true;
        missao.turno = 0;
        await pedirEscolhaPokemon(sock, from, missao.participantes[0], db, msg);
    } else {
        await sock.sendMessage(from, { 
            text: `╭━━━〔 ✅ 𝐏𝐀𝐑𝐓𝐈𝐂𝐈𝐏𝐀𝐍𝐓𝐄 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 〕━━━╮\n┃\n┃ 🎉 *@${sender.split('@')[0]} entrou na missão!*\n┃\n┃ 👥 *Participantes:* ${missao.participantes.length}/3\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
            mentions: [sender]
        }, { quoted: msg });
    }
    return true;
}

// ============ PEDIR ESCOLHA DE POKÉMON ============
async function pedirEscolhaPokemon(sock, from, sender, db, msg) {
    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const time = dbPoke[sender].time;
    
    let lista = '';
    time.forEach((p, i) => {
        lista += `┃ ${i + 1}️⃣ *${p.nome}* (Nv.${p.nivel || 1})\\n`;
    });
    
    const enviado = await sock.sendMessage(from, {
        text: `╭━━━〔 🎯 𝐄𝐒𝐂𝐎𝐋𝐇𝐀 𝐎 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ @${sender.split('@')[0]}, escolha seu Pokémon:\\n┃\n${lista}┃\n┃ ✍️ *Marque esta mensagem e responda com o número.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`,
        mentions: [sender]
    }, { quoted: msg || undefined });
    
    db[from].missaoGrupoAtiva.escolhendoPoke = sender;
    db[from].missaoGrupoAtiva.msgIdLista = enviado.key.id;
    salvarEscola(db);
}

// ============ PROCESSAR AÇÃO (ESCOLHA OU ATAQUE) ============
export async function processarAcaoGrupo(sock, msg, from, sender, text, stanzaId) {
    const db = carregarEscola();
    const missao = db[from]?.missaoGrupoAtiva;
    if (!missao) return false;

    // ===== 1. ESCOLHA DE POKÉMON =====
    if (missao.escolhendoPoke === sender && missao.msgIdLista === stanzaId) {
        const num = parseInt(text.trim());
        const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const time = dbPoke[sender].time;
        
        if (!isNaN(num) && num >= 1 && num <= time.length) {
            const pokemon = time[num - 1];
            missao.pokesEscolhidos[sender] = pokemon.nome;
            
            missao.turno++;
            if (missao.turno < missao.participantes.length) {
                // Pede pro próximo
                const proximo = missao.participantes[missao.turno];
                missao.escolhendoPoke = proximo;
                missao.msgIdLista = null;
                salvarEscola(db);
                await pedirEscolhaPokemon(sock, from, proximo, db, msg);
            } else {
                // Todos escolheram, começa a batalha!
                missao.turno = 0;
                missao.escolhendoPoke = null;
                missao.msgIdLista = null;
                salvarEscola(db);
                await iniciarBatalhaGrupo(sock, from, missao, dbPoke);
            }
            return true;
        }
    }

    // ===== 2. ATAQUE NA BATALHA =====
    if (missao.msgIdBatalha === stanzaId) {
        const participanteAtual = missao.participantes[missao.turno];
        if (participanteAtual !== sender) {
            await sock.sendMessage(from, { text: '⚠️ Não é sua vez de atacar!' }, { quoted: msg });
            return true;
        }
        
        const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        
        // Verifica se o jogador já escolheu o Pokémon
        if (!missao.pokesEscolhidos || !missao.pokesEscolhidos[sender]) {
            await sock.sendMessage(from, { text: '⚠️ Você ainda não escolheu seu Pokémon! Aguarde sua vez.' }, { quoted: msg });
            return true;
        }
        
        const nomePoke = missao.pokesEscolhidos[sender];
        const pokemon = dbPoke[sender]?.time?.find(p => p.nome === nomePoke);
        
        if (!pokemon) {
            await sock.sendMessage(from, { text: '❌ Erro ao encontrar seu Pokémon. Tente novamente.' }, { quoted: msg });
            return true;
        }
        
        // Pega os ataques
        let ataques = pokemon.ataques;
        if (!ataques || !ataques.length) {
            const nomeBase = pokemon.nome.split(' (')[0];
            const ataquesBase = ataquesPokemon[nomeBase];
            ataques = ataquesBase ? ataquesBase.map(cmd => ({ nome: cmd, comando: cmd, dano: 'medio' })) : [{ nome: 'investida', comando: 'investida', dano: 'fraco' }];
        }
        
        const comando = text.trim().toLowerCase();
        const ataqueValido = ataques.find(a => a.comando === comando);
        
        if (!ataqueValido) {
            const listaErro = ataques.map(a => `┃ ⚡ *${a.comando}*`).join('\\n');
            await sock.sendMessage(from, {
                text: `╭━━━〔 ⚠️ 𝐀𝐓𝐀𝐐𝐔𝐄 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 〕━━━╮\n┃\n┃ ❌ *${pokemon.nome} não sabe usar ${comando}!*\n┃\n┃ 💡 *Ataques disponíveis:*\n${listaErro}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
            return true;
        }
        
        const danoBase = { fraco: 15, medio: 30, especial: 50 };
        const dano = danoBase[ataqueValido.dano] + Math.floor(Math.random() * 10);
        missao.bossHp -= dano;
        
        if (missao.bossHp <= 0) {
            // Vitória!
            missao.ativo = false;
            for (const p of missao.participantes) {
                dbPoke[p].pokecoins = (dbPoke[p].pokecoins || 0) + missao.recompensa;
            }
            fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
            delete db[from].missaoGrupoAtiva;
            salvarEscola(db);
            
            await sock.sendMessage(from, {
                text: `╭━━━〔 🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀 𝐄𝐌 𝐆𝐑𝐔𝐏𝐎! 〕━━━╮\n┃\n┃ 🎉 *Vocês derrotaram ${missao.bossNome}!*\n┃\n┃ 💰 *Recompensa:* +${missao.recompensa} PokéCoins pra cada\n┃ ⭐ *XP:* +${missao.xp}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                mentions: missao.participantes
            }, { quoted: msg });
            return true;
        }
        
        // Passa o turno
        missao.turno = (missao.turno + 1) % missao.participantes.length;
        salvarEscola(db);
        await iniciarBatalhaGrupo(sock, from, missao, dbPoke);
        return true;
    }
    
    return false;
}

// ============ INICIAR BATALHA ============
async function iniciarBatalhaGrupo(sock, from, missao, dbPoke) {
    const participanteAtual = missao.participantes[missao.turno];
    const nomePoke = missao.pokesEscolhidos[participanteAtual];
    const pokemon = dbPoke[participanteAtual].time.find(p => p.nome === nomePoke);
    
    // Pega os ataques EXATOS do Pokémon da vez
    let ataques = pokemon.ataques;
    if (!ataques || !ataques.length) {
        const nomeBase = pokemon.nome.split(' (')[0];
        const ataquesBase = ataquesPokemon[nomeBase];
        ataques = ataquesBase ? ataquesBase.map(cmd => ({ nome: cmd, comando: cmd, dano: 'medio' })) : [{ nome: 'investida', comando: 'investida', dano: 'fraco' }];
    }
    
    const listaAtaques = ataques.map(a => `┃ ⚡ *${a.comando}* - ${a.nome}`).join('\\n');
    
    // Lista de participantes com @menção
    let listaParticipantes = '';
    for (const p of missao.participantes) {
        listaParticipantes += `┃ ➜ @${p.split('@')[0]} (${missao.pokesEscolhidos[p] || 'Escolhendo...'})\\n`;
    }
    
    const enviado = await sock.sendMessage(from, {
        text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃    ⚔️ 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 𝐄𝐌 𝐆𝐑𝐔𝐏𝐎    ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n┃\n┃ 👹 *${missao.bossNome}*\n┃ ❤️ *HP:* ${missao.bossHp}/${missao.bossHpMax}\n┃ ⚔️ *Dano:* ${missao.bossDano}\n┃\n┃ 👥 *Participantes:*\n${listaParticipantes}┃\n┃ 🎯 *Vez de:* @${participanteAtual.split('@')[0]}\n┃\n┃ ⚡ *Ataques de ${pokemon.nome}:*\n${listaAtaques}\n┃\n┃ ✍️ *Marque esta mensagem e responda* \n┃ *com o ataque.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        mentions: [participanteAtual, ...missao.participantes]
    }, { quoted: msg });
    
    const db = carregarEscola();
    db[from].missaoGrupoAtiva.msgIdBatalha = enviado.key.id;
    salvarEscola(db);
}
