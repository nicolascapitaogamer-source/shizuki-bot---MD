import { getAluno, salvarEscola, carregarEscola, getParceiro } from './escola_core.js';
import { ataquesPorTipo, getTipoPokemon } from './ataques_pokemon.js';
import { ataquesPokemon } from './ataques_db.js';
import { missoes } from './missoes_db.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

const bosses = [
    { nome: "Onix Furioso", hp: 100, dano: 15, recompensa: 500, xp: 50, tipo: "normal" },
    { nome: "Gyarados Sombrio", hp: 120, dano: 20, recompensa: 800, xp: 70, tipo: "água" },
    { nome: "Charizard Selvagem", hp: 150, dano: 25, recompensa: 1200, xp: 100, tipo: "fogo" },
    { nome: "Mewtwo Corrompido", hp: 200, dano: 35, recompensa: 2000, xp: 150, tipo: "psíquico" }
];

const escolhendoMissao = new Map();

function getTime(sender) {
    try {
        if (!fs.existsSync(pokePath)) return [];
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const user = db[sender];
        if (!user || !user.time) return [];
        return user.time;
    } catch (e) { return []; }
}

function darDanoPokemon(sender, nomePokemon, dano) {
    try {
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const user = db[sender];
        if (!user || !user.time) return;
        const poke = user.time.find(p => (p.nome || p.name).toLowerCase() === nomePokemon.toLowerCase());
        if (poke) {
            poke.hp = Math.max(0, (poke.hp || 100) - dano);
            fs.writeFileSync(pokePath, JSON.stringify(db, null, 2));
        }
    } catch (e) {}
}

function validarAtaque(pokemon, comandoAtaque) {
    if (pokemon.ataques && Array.isArray(pokemon.ataques) && pokemon.ataques.length > 0) {
        return pokemon.ataques.find(a => a.comando === comandoAtaque);
    }
    const tipo = getTipoPokemon(pokemon.nome);
    const ataquesTipo = ataquesPorTipo[tipo] || ataquesPorTipo["normal"];
    return ataquesTipo.find(a => a.comando === comandoAtaque);
}

export async function iniciarMissao(sock, msg, from, sender, args) {
    const aluno = getAluno(sender);
    const db = carregarEscola();
    
    if (aluno.medo > 10) {
        await sock.sendMessage(from, { text: `╭━━━〔 😨 𝐌𝐄𝐃𝐎 𝐀𝐋𝐓𝐎 〕━━━╮\n┃\n┃ 👨‍🏫 *Professor:*\n┃ "Calma, jovem! Seu coração\n┃ ainda está tremendo."\n┃\n┃ 🧠 *Seu medo:* ${aluno.medo}% (Máximo: 10%)\n┃ ❌ *Você não pode enfrentar Bosses!*\n┃\n┃ 💡 _Estude na escola até o medo_\n┃ _chegar a 10% ou menos._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━╯` }, { quoted: msg });
        return;
    }

    // Se não passou argumento, mostra o menu de dificuldades
    if (!args || args.length === 0) {
        const enviado = await sock.sendMessage(from, {
            text: `╭━━━〔 📜 𝐌𝐈𝐒𝐒𝐎̃𝐄𝐒 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ 🎒 *Treinador:* @${sender.split('@')[0]}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 🎯 *Escolha a dificuldade:*\n┃\n┃ 🟢 1️⃣ *Fácil*\n┃    ➜ Boss: 100 HP / 15 Dano\n┃\n┃ 🔵 2️⃣ *Normal*\n┃    ➜ Boss: 150 HP / 25 Dano\n┃\n┃ 🟣 3️⃣ *Difícil*\n┃    ➜ Boss: 250 HP / 40 Dano\n┃\n┃ 🟡 4️⃣ *Lendária*\n┃    ➜ Boss: 400 HP / 60 Dano\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ ✍️ *Marque esta mensagem e responda com o número.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
            mentions: [sender]
        }, { quoted: msg });
        
        // Salva o estado de escolha de dificuldade
        db[sender].escolhendoDificuldade = { msgId: enviado.key.id };
        salvarEscola(db);
        return;
    }

    // Se passou um número de 1 a 4, escolhe a dificuldade
    const difNum = parseInt(args[0]);
    console.log('DEBUG: Dificuldade escolhida:', difNum, '| args:', args);
    if (!isNaN(difNum) && difNum >= 1 && difNum <= 4) {
        const dificuldades = ['facil', 'normal', 'dificil', 'lendario'];
        const difNome = dificuldades[difNum - 1];
        const listaMissoes = missoes[difNome];
        
        if (!listaMissoes || listaMissoes.length === 0) {
            await sock.sendMessage(from, { text: '❌ Nenhuma missão disponível nessa dificuldade.' }, { quoted: msg });
            return;
        }

        const missao = listaMissoes[Math.floor(Math.random() * listaMissoes.length)];
        
        const infos = {
            facil: { emoji: '🟢', nome: 'Fácil', hp: 100, dano: 15 },
            normal: { emoji: '🔵', nome: 'Normal', hp: 150, dano: 25 },
            dificil: { emoji: '🟣', nome: 'Difícil', hp: 250, dano: 40 },
            lendario: { emoji: '🟡', nome: 'Lendária', hp: 400, dano: 60 }
        };
        const info = infos[difNome];

        const enviado = await sock.sendMessage(from, {
            text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃    📜 𝐌𝐈𝐒𝐒𝐀̃𝐎 𝐃𝐄𝐒𝐂𝐎𝐁𝐄𝐑𝐓𝐀    ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n┃\n┃ ${info.emoji} *Dificuldade:* ${info.nome}\n┃ 🏷️ *Categoria:* ${missao.categoria}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 🌟 *${missao.titulo}*\n┃\n┃ ${missao.historia}\n┃\n┃ 🎯 *Objetivo:* ${missao.objetivo}\n┃\n┃ ⚔️ *BOSS:* HP ${info.hp} / Dano ${info.dano}\n┃\n┃ 🎁 *Recompensa:*\n┃ 💰 ${missao.recompensa.pokecoins} PokéCoins\n┃ ⭐ ${missao.recompensa.xp} XP\n${missao.recompensa.itens.length > 0 ? `┃ 🎒 ${missao.recompensa.itens.join(', ')}\n` : ''}┃\n┃ ✍️ *Marque esta mensagem e responda:*\n┃ ✅ *aceitar* ou ❌ *recusar*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
            mentions: [sender]
        }, { quoted: msg });

        // Salva a missão ativa
        db[sender].missaoAtiva = {
            ...missao,
            dificuldade: difNome,
            hp: info.hp,
            dano: info.dano,
            msgId: enviado.key.id,
            aceita: false,
            nomeBoss: difNome === 'lendario' ? "Mewtwo Corrompido" : difNome === 'dificil' ? "Charizard Selvagem" : difNome === 'normal' ? "Gyarados Sombrio" : "Onix Furioso"
        };
        salvarEscola(db);
        return;
    }
}

export async function processarAcaoPorMarcacao(sock, msg, from, sender, text, stanzaId) {
    const db = carregarEscola();
    const aluno = db[sender];
    
    if (!aluno || !aluno.batalha || !aluno.batalha.ativo) return false;
    if (!stanzaId || !aluno.batalha.msgId || stanzaId !== aluno.batalha.msgId) return false;

    const comando = text.trim().toLowerCase();
    const batalha = aluno.batalha;
    
    // Pega os dados ATUAIS do JSON
    const dbPoke = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
    const userPoke = dbPoke[sender];
    const pokeAtual = userPoke.time.find(p => p.nome === batalha.pokeNome);
    
    // Pega os ataques EXATOS que estão salvos no JSON do Pokémon
    const ataquesPoke = pokeAtual.ataques || [];
    const ataqueValido = ataquesPoke.find(a => a.comando === comando);

    if (comando === 'fugir') {
        batalha.ativo = false;
        aluno.medo = Math.min(100, aluno.medo + 10);
        salvarEscola(db);
        await sock.sendMessage(from, { text: `╭━━━〔 🏃 𝐅𝐔𝐆𝐈𝐔! 〕━━━╮\n┃\n┃ 🏃 *Você fugiu da batalha!*\n┃\n┃ 👹 O Boss ficou rindo...\n┃ 😨 *Medo aumentou:* +10%\n┃ 🧠 *Medo Atual:* ${aluno.medo}%\n┃\n╰━━━━━━━━━━━━━━━━━━━╯` }, { quoted: msg });
        return true;
    }

    if (comando === 'defender') {
        batalha.defendendo = true;
        const novoEnviado = await sock.sendMessage(from, {
            text: `╭━━━〔 🛡️ 𝐃𝐄𝐅𝐄𝐒𝐀 〕━━━╮\n┃\n┃ 🛡️ *Você se defendeu!*\n┃ O próximo ataque do Boss causará metade do dano.\n┃\n┃ ✍️ *Marque esta mensagem e responda com um ataque.*\n┃\n╰━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        db[sender].batalha.msgId = novoEnviado.key.id;
        salvarEscola(db);
        return true;
    }

    if (!ataqueValido) {
        // Monta a lista de ataques disponíveis pra mostrar no erro
        const listaErro = ataquesPoke.map(a => `┃ ⚡ *${a.comando}*`).join('\n');
        await sock.sendMessage(from, {
            text: `╭━━━〔 ⚠️ 𝐀𝐓𝐀𝐐𝐔𝐄 𝐈𝐍𝐕𝐀́𝐋𝐈𝐃𝐎 〕━━━╮\n┃\n┃ ❌ *${batalha.pokeNome} não sabe usar ${comando}!*\n┃\n┃ 💡 *Ataques disponíveis:*\n${listaErro}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        return false;
    }

    // Dano
    const danoBase = { fraco: 15, medio: 30, especial: 50 };
    const dano = danoBase[ataqueValido.dano] + Math.floor(Math.random() * 10);
    batalha.bossHp -= dano;

    if (batalha.bossHp <= 0) {
        batalha.ativo = false;
        aluno.nota = Math.min(10, aluno.nota + 1);
        aluno.medo = Math.max(0, aluno.medo - 5);
        
        // Salva no histórico se for missão
        if (batalha.missao && aluno.missaoAtiva) {
            if (!db[sender].historico) db[sender].historico = [];
            db[sender].historico.push({
                titulo: aluno.missaoAtiva.titulo,
                dificuldade: aluno.missaoAtiva.dificuldade,
                data: new Date().toLocaleDateString('pt-BR')
            });
            
            // Se for diária, marca como feita hoje
            if (aluno.missaoAtiva.diaria) {
                db[sender].ultimaMissaoDiaria = new Date().toLocaleDateString('pt-BR');
            }
            
            delete db[sender].missaoAtiva;
        }
        
        salvarEscola(db);
        await sock.sendMessage(from, {
            text: `╭━━━〔 🏆 𝐕𝐈𝐓𝐎́𝐑𝐈𝐀! 〕━━━╮\n┃\n┃ 🎉 *Você derrotou ${batalha.bossNome}!*\n┃\n┃ 💰 *Recompensa:* R$ ${batalha.recompensa}\n┃ ⭐ *XP:* +${batalha.xp}\n┃ 📈 *Nota:* +1.0\n┃ 📉 *Medo reduzido:* -5%\n┃\n┃ 💜 *${batalha.pokeNome} está orgulhoso!*\n┃ _"Nós somos uma equipe!"_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        return true;
    }

    // Boss revida
    let danoBoss = batalha.bossDano;
    if (batalha.defendendo) {
        danoBoss = Math.floor(danoBoss / 2);
        batalha.defendendo = false;
    }

    batalha.pokeHp = Math.max(0, batalha.pokeHp - danoBoss);
    darDanoPokemon(sender, batalha.pokeNome, danoBoss);

    if (batalha.pokeHp <= 0) {
        batalha.ativo = false;
        aluno.medo = Math.min(100, aluno.medo + 20);
        salvarEscola(db);
        await sock.sendMessage(from, {
            text: `╭━━━〔 💀 𝐃𝐄𝐑𝐑𝐎𝐓𝐀 〕━━━╮\n┃\n┃ 💔 *${batalha.pokeNome} desmaiou!*\n┃\n┃ 👹 O ${batalha.bossNome} foi muito forte...\n┃ 😨 *Medo aumentou:* +20%\n┃ 🧠 *Medo Atual:* ${aluno.medo}%\n┃\n╰━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        return true;
    }

    // Lista os ataques EXATOS do Pokémon na próxima tela
    const listaAtaques = ataquesPoke.map(a => `┃ ⚡ *${a.comando}* - ${a.nome}`).join('\n');

    const novoEnviado = await sock.sendMessage(from, {
        text: `╭━━━〔 ⚔️ 𝐂𝐎𝐌𝐁𝐀𝐓𝐄 〕━━━╮\n┃\n┃ ⚡ *${batalha.pokeNome} usou ${ataqueValido.nome}!*\n┃ 💥 Dano causado: *${dano}*\n┃\n┃ 👹 *${batalha.bossNome}*\n┃ ❤️ HP: *${batalha.bossHp}/${batalha.bossHpMax}*\n┃\n┃ 🐾 *${batalha.pokeNome}*\n┃ ❤️ HP: *${batalha.pokeHp}/${batalha.pokeHpMax}*\n┃\n┃ ━━━━━━━━━━━━━━━━━━━\n┃\n┃ 💢 *O Boss revidou!*\n┃ 🩸 Dano recebido: *${danoBoss}*\n┃\n┃ ━━━━━━━━━━━━━━━━━━━\n┃\n┃ 🎯 *Escolha um ataque:*\n${listaAtaques}\n┃\n┃ 🛡️ *defender* - Reduzir dano\n┃ 🏃 *fugir* - Fugir da batalha\n┃\n┃ ✍️ _Marque esta mensagem e responda com o ataque._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });

    db[sender].batalha.msgId = novoEnviado.key.id;
    salvarEscola(db);
    return true;
}

export async function processarEscolhaMissao(sock, msg, from, sender, text, stanzaId) {
    if (!escolhendoMissao.has(sender)) return false;
    const estado = escolhendoMissao.get(sender);
    if (stanzaId !== estado.msgId) return false;

    const numero = parseInt(text.trim());
    if (isNaN(numero) || numero < 1) return false;

    escolhendoMissao.delete(sender);
    await iniciarMissao(sock, msg, from, sender, [String(numero)]);
    return true;
}


export async function processarRespostaMissao(sock, msg, from, sender, text, stanzaId) {
    const db = carregarEscola();
    const aluno = db[sender];
    
    // Se o aluno não existe, cria um (pra não dar erro)
    if (!aluno) {
        db[sender] = { matriculado: true, medo: 100, nota: 0, aulas: 0, intervalo_liberado: false, parceiro: null, ultimaAula: 0 };
        salvarEscola(db);
        return false;
    }
    
    // 1. Verifica se tá no menu de dificuldade
    if (aluno.escolhendoDificuldade && aluno.escolhendoDificuldade.msgId === stanzaId) {
        const num = parseInt(text.trim());
        if (!isNaN(num) && num >= 1 && num <= 4) {
            delete db[sender].escolhendoDificuldade;
            salvarEscola(db);
            await iniciarMissao(sock, msg, from, sender, [String(num)]);
            return true;
        }
    }

    // 2. Verifica se tá na missão ativa (aceitar/recusar)
    if (aluno.missaoAtiva && aluno.missaoAtiva.msgId === stanzaId && !aluno.missaoAtiva.aceita) {
        const resposta = text.trim().toLowerCase();
        
        if (resposta === 'aceitar' || resposta === 'sim') {
            db[sender].missaoAtiva.aceita = true;
            db[sender].missaoAtiva.msgId = null;
            salvarEscola(db);

            // Pega o time do jogador
            const time = getTime(sender);
            if (time.length === 0) {
                await sock.sendMessage(from, { text: '❌ Você precisa de um Pokémon pra lutar!' }, { quoted: msg });
                return true;
            }

            let lista = '';
            time.forEach((p, i) => {
                lista += `┃ ${i + 1}️⃣ *${p.nome}* (Nv.${p.nivel || 1})\n`;
            });

            const enviadoLista = await sock.sendMessage(from, {
                text: `╭━━━〔 🎯 𝐄𝐒𝐂𝐎𝐋𝐇𝐀 𝐎 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ ⚔️ *Qual Pokémon vai lutar?*\n┃\n${lista}┃\n┃ ✍️ *Marque esta mensagem e responda com o número.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });

            db[sender].missaoAtiva.msgIdLista = enviadoLista.key.id;
            salvarEscola(db);
            return true;
        }

        if (resposta === 'recusar' || resposta === 'não' || resposta === 'nao') {
            delete db[sender].missaoAtiva;
            salvarEscola(db);
            await sock.sendMessage(from, { text: '🏳️ *Missão recusada.* Use *!missao* para tentar outra.' }, { quoted: msg });
            return true;
        }
    }

    
    // Processa a escolha do Pokémon
    if (aluno.missaoAtiva && aluno.missaoAtiva.msgIdLista === stanzaId) {
        const num = parseInt(text.trim());
        const time = getTime(sender);
        
        if (!isNaN(num) && num >= 1 && num <= time.length) {
            const pokemon = time[num - 1];
            const m = aluno.missaoAtiva;
            
            delete db[sender].missaoAtiva.msgIdLista;
            salvarEscola(db);
            
            const boss = {
                nome: m.nomeBoss || "Boss Selvagem",
                hp: m.hp,
                dano: m.dano,
                recompensa: m.recompensa.pokecoins,
                xp: m.recompensa.xp
            };
            
            db[sender].batalha = {
                bossNome: boss.nome,
                bossHp: boss.hp,
                bossHpMax: boss.hp,
                bossDano: boss.dano,
                recompensa: boss.recompensa,
                xp: boss.xp,
                ativo: true,
                msgId: null,
                missao: true,
                pokeNome: pokemon.nome,
                pokeHp: pokemon.hp || 100,
                pokeHpMax: pokemon.hpMax || 100
            };
            salvarEscola(db);
            
            const ataquesPoke = pokemon.ataques || [];
            const listaAtaques = ataquesPoke.map(a => `┃ ⚡ *${a.comando}* - ${a.nome}`).join('\n');
            
            const enviadoBatalha = await sock.sendMessage(from, {
                text: `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n┃    🌋 𝐀𝐋𝐄𝐑𝐓𝐀 𝐃𝐄 𝐁𝐎𝐒𝐒! 🌋    ┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯\n┃\n┃ 👹 *${boss.nome}* apareceu!\n┃\n┃ ❤️ *HP:* ${boss.hp}/${boss.hp}\n┃ ⚔️ *Dano:* ${boss.dano}\n┃\n┃ 🐾 *Seu Pokémon:* ${pokemon.nome} (Nv.${pokemon.nivel || 1})\n┃ ❤️ *HP:* ${pokemon.hp || 100}/${pokemon.hpMax || 100}\n┃\n┃ 🎯 *Escolha um ataque:*\n${listaAtaques}\n┃\n┃ ✍️ *Marque esta mensagem e responda com o ataque.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
            
            db[sender].batalha.msgId = enviadoBatalha.key.id;
            salvarEscola(db);
            return true;
        }
    }

    return false;
}
