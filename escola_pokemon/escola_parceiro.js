import { getTipoPokemon } from "./ataques_pokemon.js";
import { getAluno, salvarEscola, carregarEscola, getParceiro } from './escola_core.js';
import fs from 'fs';

const pokePath = './pokemon_users.json';

export async function verParceiro(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    const parceiroNome = getParceiro(sender);
    
    if (!parceiroNome) {
        await sock.sendMessage(from, { 
            text: `╭━━━〔 🐾 𝐒𝐄𝐌 𝐏𝐀𝐑𝐂𝐄𝐈𝐑𝐎 〕━━━╮\n┃\n┃ 👨‍🏫 *Professor:*\n┃ "Você ainda não tem um parceiro!"\n┃\n┃ 💡 _Capture um Pokémon primeiro._\n┃ _Use *!capturar* quando aparecer._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━╯` 
        }, { quoted: msg });
        return;
    }

    // Puxa os dados EXATOS do JSON
    let nivel = "?", tipo = "Normal", hp = 100, hpMax = 100, felicidade = 50;
    let ataques = [];
    let timeLista = [];

    try {
        if (fs.existsSync(pokePath)) {
            const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
            const user = db[sender];
            if (user && user.time) {
                timeLista = user.time;
                const termo = parceiroNome.toLowerCase();
                let poke = user.time.find(p => (p.nome || p.name).toLowerCase() === termo);
                if (!poke) poke = user.time.find(p => (p.nome || p.name).toLowerCase().startsWith(termo));
                if (!poke) poke = user.time.find(p => (p.nome || p.name).toLowerCase().includes(termo));
                if (poke) {
                    nivel = poke.nivel || 1;
                    hp = poke.hp || 100;
                    hpMax = poke.hpMax || 100;
                    felicidade = poke.felicidade || 50;
                    ataques = poke.ataques || [];
                    
                    // Tipo: tenta pegar do JSON, se não tiver, usa a função
                    if (poke.tipo) {
                        tipo = poke.tipo;
                    } else {
                        tipo = getTipoPokemon(poke.nome);
                    }
                }
            }
        }
    } catch (e) {}

    if (!aluno.parceiro) {
        const dbEscola = carregarEscola();
        dbEscola[sender].parceiro = parceiroNome;
        salvarEscola(dbEscola);
    }

    // Lista o time se tiver mais de 1
    let listaTime = "";
    if (timeLista.length > 1) {
        listaTime = `\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 🎒 *Seu time:*\n` + timeLista.map((p, i) => `┃ ${i+1}️⃣ ${p.nome} (Nv.${p.nivel || 1})`).join('\n') + `\n┃\n┃ 💡 _Use !parceiro <nome> para trocar._\n`;
    }

    // Lista os ataques se tiver
    let listaAtaques = "";
    if (ataques.length > 0) {
        listaAtaques = `┃ ⚡ *Ataques:* ${ataques.map(a => a.comando).join(', ')}\n`;
    }

    await sock.sendMessage(from, {
        text: `╭━━━〔 🐾 𝐌𝐄𝐔 𝐏𝐀𝐑𝐂𝐄𝐈𝐑𝐎 〕━━━╮\n┃\n┃       ✨  ✨  ✨\n┃         ⚡\n┃       ${parceiroNome.toUpperCase()}\n┃       ✨  ✨  ✨\n┃\n┃ 💜 *Nome:* ${parceiroNome}\n┃ ⭐ *Nível:* ${nivel}\n┃ ❤️ *HP:* ${hp}/${hpMax}\n┃ 😊 *Felicidade:* ${felicidade}/100\n┃ ⚔️ *Tipo:* ${tipo}\n${listaAtaques}┃${listaTime}┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 💬 _"${parceiroNome} está feliz em te ver!"_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}

export async function trocarParceiro(sock, msg, from, sender, novoParceiro) {
    try {
        if (!fs.existsSync(pokePath)) {
            await sock.sendMessage(from, { text: '❌ Você não tem nenhum Pokémon capturado!' }, { quoted: msg });
            return;
        }
        const db = JSON.parse(fs.readFileSync(pokePath, 'utf8'));
        const user = db[sender];
        
        if (!user || !user.time || user.time.length === 0) {
            await sock.sendMessage(from, { text: '❌ Você não tem nenhum Pokémon capturado!' }, { quoted: msg });
            return;
        }

        // Procura o Pokémon pelo nome (ignorando maiúsculas/minúsculas)
        const poke = user.time.find(p => {
            const nomePoke = (p.nome || p.name || "").toLowerCase();
            return nomePoke === novoParceiro.toLowerCase();
        });

        if (!poke) {
            await sock.sendMessage(from, { text: `❌ Você não tem um Pokémon chamado *${novoParceiro}*!` }, { quoted: msg });
            return;
        }

        // Salva no JSON da escola
        const dbEscola = carregarEscola();
        dbEscola[sender].parceiro = poke.nome || poke.name;
        salvarEscola(dbEscola);

        await sock.sendMessage(from, { 
            text: `╭━━━〔 🐾 𝐏𝐀𝐑𝐂𝐄𝐈𝐑𝐎 𝐓𝐑𝐎𝐂𝐀𝐃𝐎 〕━━━╮\n┃\n┃ ✅ *${poke.nome || poke.name}* agora é seu parceiro!\n┃\n┃ 💜 _Cuide bem dele, treinador!_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯` 
        }, { quoted: msg });
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Erro ao trocar o parceiro. Tente novamente.' }, { quoted: msg });
    }
}
