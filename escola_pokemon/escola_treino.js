import { evolucoes } from './evolucoes.js';
import { ataquesPokemon } from './ataques_db.js';
import { buscarAtaques, buscarEvolucao } from './pokemon_api.js';
import { getAluno, salvarEscola, carregarEscola, getParceiro } from './escola_core.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

async function getPokemon(sender, nome) {
    try {
        if (!fs.existsSync(pokePath)) return null;
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const user = db[sender];
        if (!user || !user.time) return null;
        
        const termo = nome.toLowerCase();
        let poke = user.time.find(p => (p.nome || p.name).toLowerCase() === termo);
        if (!poke) poke = user.time.find(p => (p.nome || p.name).toLowerCase().startsWith(termo));
        if (!poke) poke = user.time.find(p => (p.nome || p.name).toLowerCase().includes(termo));
        
        if (!poke) return null;

        // Se não tiver ataques, busca da API
        if (!poke.ataques || !Array.isArray(poke.ataques) || poke.ataques.length === 0) {
            const nomeBase = poke.nome.split(' (')[0];
            const ataquesBase = ataquesPokemon[nomeBase];
            
            if (ataquesBase) {
                poke.ataques = ataquesBase.map(cmd => ({ nome: cmd, comando: cmd, dano: 'medio' }));
            } else {
                // Busca da API
                poke.ataques = await buscarAtaques(nomeBase);
            }
            
            // Salva no JSON
            const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
            const idxP = dbPoke[sender].time.findIndex(p => p.nome === poke.nome);
            if (idxP !== -1) {
                dbPoke[sender].time[idxP].ataques = poke.ataques;
                fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
            }
        }
        
        return poke;
    } catch (e) { return null; }
}

// ============ TREINAR ============
export async function treinarPokemon(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    const parceiroNome = getParceiro(sender);
    
    if (!parceiroNome) {
        await sock.sendMessage(from, { text: '❌ Você não tem um parceiro pra treinar!' }, { quoted: msg });
        return;
    }

    const agora = Date.now();
    const dbEscola = carregarEscola();
    const ultimoTreino = dbEscola[sender].ultimoTreino || 0;

    if (agora - ultimoTreino < 5 * 60 * 1000) {
        const restante = Math.ceil((5 * 60 * 1000 - (agora - ultimoTreino)) / 60000);
        await sock.sendMessage(from, { text: `⏳ *Calma, treinador!*\n\nSeu parceiro precisa descansar.\n⏰ *Tempo restante:* ${restante} minuto(s)` }, { quoted: msg });
        return;
    }

    const poke = getPokemon(sender, parceiroNome);
    if (!poke) {
        await sock.sendMessage(from, { text: '❌ Erro ao carregar seu Pokémon.' }, { quoted: msg });
        return;
    }

    const xpGanho = Math.floor(Math.random() * 30) + 30; // 30 a 60
    let xpAtual = (poke.xp || 0) + xpGanho;
    let nivelAtual = poke.nivel || 1;
    let subiuNivel = false;
    let evoluiu = false;
    let evoData = null;
    
    const xpNecessario = nivelAtual * 100;
    if (xpAtual >= xpNecessario) {
        nivelAtual++;
        xpAtual -= xpNecessario;
        subiuNivel = true;
    }

    let evo = evolucoes[poke.nome];
    
    // Se não tiver no banco local, busca da API
    if (!evo) {
        try {
            const apiEvo = await buscarEvolucao(poke.nome);
            if (apiEvo.proximo) {
                evo = {
                    proximo: apiEvo.proximo,
                    nivelEvolucao: apiEvo.nivelEvolucao,
                    bonus: { hp: 50, ataque: 20, defesa: 15, felicidade: 10 },
                    novosAtaques: await buscarAtaques(apiEvo.proximo)
                };
            }
        } catch (e) {}
    }
    if (evo && evo.nivelEvolucao && nivelAtual >= evo.nivelEvolucao && evo.proximo) {
        poke.nome = evo.proximo;
        poke.hpMax = (poke.hpMax || 100) + (evo.bonus?.hp || 50);
        poke.ataque = (poke.ataque || 50) + (evo.bonus?.ataque || 20);
        poke.defesa = (poke.defesa || 30) + (evo.bonus?.defesa || 15);
        poke.hp = poke.hpMax;
        poke.felicidade = Math.min(100, (poke.felicidade || 50) + (evo.bonus?.felicidade || 10));
        poke.ataques = evo.novosAtaques;
        evoluiu = true;
        evoData = evo;
    }

    try {
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const u = db[sender];
        const pIdx = u.time.findIndex(p => (p.nome || p.name).toLowerCase() === parceiroNome.toLowerCase());
        if (pIdx !== -1) {
            u.time[pIdx].xp = xpAtual;
            u.time[pIdx].nivel = nivelAtual;
            if (subiuNivel) {
                u.time[pIdx].hpMax = (u.time[pIdx].hpMax || 100) + 10;
                u.time[pIdx].ataque = (u.time[pIdx].ataque || 50) + 5;
                u.time[pIdx].defesa = (u.time[pIdx].defesa || 30) + 3;
                u.time[pIdx].hp = u.time[pIdx].hpMax;
            }
            if (evoluiu) {
                u.time[pIdx] = poke;
            }
            db[sender] = u;
            fs.writeFileSync(pokePath, JSON.stringify(db, null, 2));
        }
    } catch (e) { console.log('Erro no treinar:', e); }
    
    dbEscola[sender].medo = Math.max(0, dbEscola[sender].medo - 1);
    dbEscola[sender].ultimoTreino = agora;
    salvarEscola(dbEscola);

    if (evoluiu) {
        await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃    ✨ 𝐄𝐕𝐎𝐋𝐔𝐂̧𝐀̃𝐎! ✨    ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n┃\n┃ 🐾 *${parceiroNome}* está brilhando!\n┃\n┃ 🌟 *O que é isso?*\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 🆙 *${poke.nome}!*\n┃\n┃ 📊 *Nível:* ${nivelAtual}\n┃ ❤️ *HP Máx:* ${poke.hpMax}\n┃ ⚔️ *Ataque:* ${poke.ataque}\n┃ 🛡️ *Defesa:* ${poke.defesa}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 🔥 *Novos Ataques:*\n${evoData.novosAtaques.map(a => `┃ ⚡ ${a.comando} - ${a.nome}`).join('\n')}\n┃\n┃ 💜 _"${poke.nome} está pronto pra lutar!"_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
    } else {
        const xpNecessarioAtual = nivelAtual * 100;
        const porcentagem = Math.min(100, Math.floor((xpAtual / xpNecessarioAtual) * 100));
        const barras = '█'.repeat(Math.floor(porcentagem / 10)) + '░'.repeat(10 - Math.floor(porcentagem / 10));

        if (subiuNivel) {
            await sock.sendMessage(from, {
                text: `╭━━━〔 🏋️ 𝐓𝐑𝐄𝐈𝐍𝐀𝐌𝐄𝐍𝐓𝐎 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professor Kukui:*\n┃ "Você está ficando mais forte!"\n┃\n┃ 🐾 *Parceiro:* ${poke.nome}\n┃ 📈 *XP Ganho:* +${xpGanho}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━\n┃\n┃ 🎉 *SUBIU DE NÍVEL!*\n┃ 📊 *Nível:* ${nivelAtual - 1} ➜ ${nivelAtual}\n┃ ❤️ *HP Máx:* +${poke.hpMax}\n┃ ⚔️ *Ataque:* +${poke.ataque}\n┃ 🛡️ *Defesa:* +${poke.defesa}\n┃\n┃ 😨 *Seu medo diminuiu:* -1%\n┃\n┃ 💡 _Treine novamente em 5min._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, {
                text: `╭━━━〔 🏋️ 𝐓𝐑𝐄𝐈𝐍𝐀𝐌𝐄𝐍𝐓𝐎 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professor Kukui:*\n┃ "Vamos fortalecer esse laço!"\n┃\n┃ 🐾 *Parceiro:* ${poke.nome}\n┃ 📊 *Nível:* ${nivelAtual}\n┃ 📈 *XP Ganho:* +${xpGanho}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━\n┃\n┃ 📉 *Progresso:* ${xpAtual}/${xpNecessarioAtual} XP\n┃ [${barras}] ${porcentagem}%\n┃\n┃ 😨 *Seu medo diminuiu:* -1%\n┃\n┃ 💡 _Treine novamente em 5min._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
        }
    }
}

// ============ ALIMENTAR ============
export async function alimentarPokemon(sock, msg, from, sender, args) {
    if (!args || args.length < 2) {
        await sock.sendMessage(from, {
            text: `╭━━━〔 🍖 𝐂𝐎𝐌𝐎 𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑 〕━━━╮\n┃\n┃ 🐾 *Uso correto:*\n┃ *!alimentar <pokémon> <comida>*\n┃\n┃ 🎒 *Comidas:*\n┃ berry, cheri, pecha, oran, sitrus\n┃ pokefood, racao, bolo\n┃ pocao, superpocao, pocaomax\n┃ revive, doce, pedra, amuleto\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        return;
    }

    const nomePokemon = args[0];
    const nomeComida = args[1].toLowerCase();

    const poke = getPokemon(sender, nomePokemon);
    if (!poke) {
        await sock.sendMessage(from, { text: `❌ Você não tem um Pokémon chamado *${nomePokemon}*!` }, { quoted: msg });
        return;
    }

    const itens = {
        'berry': { emoji: '🍇', fel: 15, hp: 0, nome: 'Berry', tipo: 'comida' },
        'cheri': { emoji: '🍒', fel: 20, hp: 0, nome: 'Cheri Berry', tipo: 'comida' },
        'pecha': { emoji: '🍑', fel: 20, hp: 0, nome: 'Pecha Berry', tipo: 'comida' },
        'oran': { emoji: '🍊', fel: 0, hp: 20, nome: 'Oran Berry', tipo: 'comida' },
        'sitrus': { emoji: '🍋', fel: 0, hp: 50, nome: 'Sitrus Berry', tipo: 'comida' },
        'pokefood': { emoji: '🍖', fel: 30, hp: 0, nome: 'Pokéfood', tipo: 'comida' },
        'racao': { emoji: '🥩', fel: 50, hp: 0, nome: 'Ração Premium', tipo: 'comida' },
        'bolo': { emoji: '🍰', fel: 80, hp: 0, nome: 'Bolo de Poffin', tipo: 'comida' },
        'pocao': { emoji: '🧪', fel: 0, hp: 30, nome: 'Poção', tipo: 'comida' },
        'superpocao': { emoji: '💊', fel: 0, hp: 60, nome: 'Super Poção', tipo: 'comida' },
        'pocaomax': { emoji: '💊', fel: 10, hp: 100, nome: 'Poção Máxima', tipo: 'comida' },
        'revive': { emoji: '💫', fel: 0, hp: 0, nome: 'Revive', tipo: 'revive' },
        'doce': { emoji: '🍬', fel: 0, hp: 0, nome: 'Doce Raro', tipo: 'doce' },
        'pedra': { emoji: '🧬', fel: 0, hp: 0, nome: 'Pedra de Evolução', tipo: 'pedra' },
        'amuleto': { emoji: '💎', fel: 0, hp: 0, nome: 'Amuleto da Sorte', tipo: 'amuleto' }
    };

    const comida = itens[nomeComida];
    if (!comida) {
        await sock.sendMessage(from, { text: `❌ Item *${nomeComida}* inválido!` }, { quoted: msg });
        return;
    }

    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const user = dbPoke[sender];
    
    if (!user.cosmeticos || !user.cosmeticos[nomeComida] || user.cosmeticos[nomeComida] <= 0) {
        await sock.sendMessage(from, { text: `❌ Você não tem *${comida.nome}*!\n\n💡 Compre com *!lojapokemon*.` }, { quoted: msg });
        return;
    }

    user.cosmeticos[nomeComida] -= 1;

    // Pega o Pokémon atualizado do JSON
    const termo = nomePokemon.toLowerCase();
    let idxPoke = user.time.findIndex(p => (p.nome || p.name).toLowerCase() === termo);
    if (idxPoke === -1) idxPoke = user.time.findIndex(p => (p.nome || p.name).toLowerCase().startsWith(termo));
    if (idxPoke === -1) idxPoke = user.time.findIndex(p => (p.nome || p.name).toLowerCase().includes(termo));
    
    if (idxPoke === -1) {
        await sock.sendMessage(from, { text: `❌ Pokémon não encontrado!` }, { quoted: msg });
        return;
    }
    const pokeDB = user.time[idxPoke];

    // === DOCE RARO ===
    if (comida.tipo === 'doce') {
        pokeDB.nivel = (pokeDB.nivel || 1) + 1;
        pokeDB.xp = 0;
        pokeDB.hpMax = (pokeDB.hpMax || 100) + 10;
        pokeDB.ataque = (pokeDB.ataque || 50) + 5;
        pokeDB.defesa = (pokeDB.defesa || 30) + 3;
        pokeDB.hp = pokeDB.hpMax;
        
        user.time[idxPoke] = pokeDB;
        dbPoke[sender] = user;
        fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
        
        await sock.sendMessage(from, {
            text: `╭━━━〔 🍬 𝐃𝐎𝐂𝐄 𝐑𝐀𝐑𝐎 〕━━━╮\n┃\n┃ 🐾 *Pokémon:* ${pokeDB.nome}\n┃ ✨ *NÍVEL AUMENTADO!*\n┃ 📊 *Nível:* ${pokeDB.nivel}\n┃ ❤️ *HP Máx:* ${pokeDB.hpMax}\n┃ ⚔️ *Ataque:* ${pokeDB.ataque}\n┃ 🛡️ *Defesa:* ${pokeDB.defesa}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        return;
    }

    // === PEDRA DE EVOLUÇÃO ===
    if (comida.tipo === 'pedra') {
        const nomeAtual = pokeDB.nome;
        let evo = evolucoes[nomeAtual];
        
        // Se não tiver no banco local, busca da API
        if (!evo) {
            try {
                const apiEvo = await buscarEvolucao(nomeAtual);
                if (apiEvo.proximo) {
                    evo = {
                        proximo: apiEvo.proximo,
                        nivelEvolucao: apiEvo.nivelEvolucao,
                        bonus: { hp: 50, ataque: 20, defesa: 15, felicidade: 10 },
                        novosAtaques: await buscarAtaques(apiEvo.proximo)
                    };
                } else {
                    await sock.sendMessage(from, { text: `╭━━━〔 🏆 𝐅𝐎𝐑𝐌𝐀 𝐅𝐈𝐍𝐀𝐋 〕━━━╮\n┃\n┃ 🐾 *Pokémon:* ${nomeAtual}\n┃\n┃ ⭐ *Este Pokémon NÃO tem evolução!*\n┃ 💡 _No anime, ele é a forma final._\n┃\n┃ 🎒 _A Pedra de Evolução não foi consumida._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯` }, { quoted: msg });
                    user.cosmeticos[nomeComida] += 1;
                    dbPoke[sender] = user;
                    fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
                    return;
                }
            } catch (e) {
                await sock.sendMessage(from, { text: `❌ Erro ao buscar evolução de *${nomeAtual}*. Tente novamente.` }, { quoted: msg });
                return;
            }
        }
        
        // Se for forma final (proximo === null)
        if (!evo.proximo) {
            await sock.sendMessage(from, { text: `╭━━━〔 🏆 𝐅𝐎𝐑𝐌𝐀 𝐅𝐈𝐍𝐀𝐋 〕━━━╮\n┃\n┃ 🐾 *Pokémon:* ${nomeAtual}\n┃\n┃ ⭐ *Este Pokémon NÃO tem evolução!*\n┃ 💡 _No anime, ele é a forma final._\n┃\n┃ 🎒 _A Pedra de Evolução não foi consumida._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯` }, { quoted: msg });
            user.cosmeticos[nomeComida] += 1;
            dbPoke[sender] = user;
            fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
            return;
        }
        
        // Evolui!
        pokeDB.nome = evo.proximo;
        pokeDB.nivel = (pokeDB.nivel || 1) + (evo.bonus?.nivel || 5);
        pokeDB.hpMax = (pokeDB.hpMax || 100) + (evo.bonus?.hp || 50);
        pokeDB.ataque = (pokeDB.ataque || 50) + (evo.bonus?.ataque || 20);
        pokeDB.defesa = (pokeDB.defesa || 30) + (evo.bonus?.defesa || 15);
        pokeDB.hp = pokeDB.hpMax;
        pokeDB.felicidade = Math.min(100, (pokeDB.felicidade || 50) + (evo.bonus?.felicidade || 10));
        
        if (evo.novosAtaques) {
            pokeDB.ataques = evo.novosAtaques;
        } else {
            pokeDB.ataques = await buscarAtaques(evo.proximo);
        }
        
        user.time[idxPoke] = pokeDB;
        dbPoke[sender] = user;
        fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
        
        await sock.sendMessage(from, {
            text: `╭━━━〔 🧬 𝐄𝐕𝐎𝐋𝐔𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 🐾 *Pokémon:* ${nomeAtual}\n┃ ✨ *EVOLUIU!*\n┃ 🆙 *Novo nome:* ${evo.proximo}\n┃ 📊 *Nível:* ${pokeDB.nivel}\n┃ ❤️ *HP Máx:* ${pokeDB.hpMax}\n┃ ⚔️ *Ataque:* ${pokeDB.ataque}\n┃ 🛡️ *Defesa:* ${pokeDB.defesa}\n┃\n┃ ⚡ *Novos ataques:*\n${(pokeDB.ataques || []).map(a => `┃ 🔥 ${a.comando}`).join('\n')}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        return;
    }

    if (comida.tipo === 'amuleto') {
        pokeDB.amuletoAtivo = true;
        user.time[idxPoke] = pokeDB;
        dbPoke[sender] = user;
        fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
        await sock.sendMessage(from, { text: `💎 *Amuleto ativado!* +10% XP no próximo treino.` }, { quoted: msg });
        return;
    }

    // === REVIVE ===
    if (comida.tipo === 'revive') {
        if (pokeDB.hp > 0) {
            await sock.sendMessage(from, { text: `❌ *${pokeDB.nome}* não está desmaiado!` }, { quoted: msg });
            user.cosmeticos[nomeComida] += 1;
            dbPoke[sender] = user;
            fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
            return;
        }
        pokeDB.hp = pokeDB.hpMax;
        user.time[idxPoke] = pokeDB;
        dbPoke[sender] = user;
        fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));
        await sock.sendMessage(from, { text: `💫 *${pokeDB.nome} reviveu!* HP: ${pokeDB.hp}/${pokeDB.hpMax}` }, { quoted: msg });
        return;
    }

    // === COMIDA NORMAL ===
    const hpAntes = pokeDB.hp || 100;
    const felAntes = pokeDB.felicidade || 50;
    pokeDB.felicidade = Math.min(100, felAntes + comida.fel);
    pokeDB.hp = Math.min(pokeDB.hpMax || 100, hpAntes + comida.hp);
    
    user.time[idxPoke] = pokeDB;
    dbPoke[sender] = user;
    fs.writeFileSync(pokePath, JSON.stringify(dbPoke, null, 2));

    await sock.sendMessage(from, {
        text: `╭━━━〔 ${comida.emoji} 𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐑 〕━━━╮\n┃\n┃ 🐾 *Pokémon:* ${pokeDB.nome}\n┃ ${comida.emoji} *Item:* ${comida.nome}\n┃\n┃ ❤️ *HP:* ${hpAntes} ➜ ${pokeDB.hp}/${pokeDB.hpMax}\n┃ 😊 *Felicidade:* ${felAntes} ➜ ${pokeDB.felicidade}/100\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}
