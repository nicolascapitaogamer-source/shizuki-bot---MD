import { getAluno, salvarEscola, carregarEscola } from './escola_core.js';
import fs from 'fs';

const bancoPath = './escola_pokemon/banco_perguntas.json';
function __getNumLimpo(id) { return String(id || '').split('@')[0]; }
const provasAtivas = new Map();

export async function iniciarProva(sock, msg, from, sender) {
    const aluno = getAluno(sender);
    
    if (provasAtivas.has(__getNumLimpo(sender))) {
        await sock.sendMessage(from, { text: '⚠️ Você já tem uma prova em andamento!' }, { quoted: msg });
        return;
    }

    let banco = [];
    try {
        banco = JSON.parse(fs.readFileSync(bancoPath, 'utf8'));
    } catch (e) {
        await sock.sendMessage(from, { text: '❌ Erro ao carregar o banco de perguntas.' }, { quoted: msg });
        return;
    }

    if (banco.length < 5) {
        await sock.sendMessage(from, { text: '❌ O banco de perguntas não tem 5 perguntas.' }, { quoted: msg });
        return;
    }

    const perguntas = banco.sort(() => Math.random() - 0.5).slice(0, 5);
    
    provasAtivas.set(__getNumLimpo(sender), {
        perguntas,
        indice: 0,
        acertos: 0,
        msgId: null
    });

    await enviarPerguntaProva(sock, from, sender);
}

async function enviarPerguntaProva(sock, from, sender) {
    const prova = provasAtivas.get(__getNumLimpo(sender));
    if (!prova) return;

    const p = prova.perguntas[prova.indice];
    const letras = ['A', 'B', 'C', 'D'];
    
    const embaralhadas = [...p.alternativas].sort(() => Math.random() - 0.5);
    prova.alternativasEmbaralhadas = embaralhadas;
    prova.respostaCerta = letras[embaralhadas.indexOf(p.r[0])];

    let alts = '';
    embaralhadas.forEach((alt, i) => {
        alts += `┃ ${letras[i]}) ${alt}\n`;
    });

    const enviado = await sock.sendMessage(from, {
        text: `╭━━━〔 📝 𝐏𝐑𝐎𝐕𝐀 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professor:* "Sente-se, jovem."\n┃\n┃ ❓ *Pergunta ${prova.indice + 1}/5:*\n┃ ${p.p}\n┃\n${alts}┃\n┃ ✍️ _Responda digitando a letra._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
    });
    
    prova.msgId = enviado.key.id;
}

// Removemos o stanzaId da assinatura da função
export async function processarRespostaProva(sock, msg, from, sender, text) {
    if (!provasAtivas.has(__getNumLimpo(sender))) return false;
    const prova = provasAtivas.get(__getNumLimpo(sender));

    const resposta = text.trim().toUpperCase();
    const letras = ['A', 'B', 'C', 'D'];
    
    if (!letras.includes(resposta)) {
        return false; // Se não for letra, ignora (deixa o bot processar como comando normal)
    }

    const p = prova.perguntas[prova.indice];
    const idxEscolhido = letras.indexOf(resposta);
    const escolhida = resposta === prova.respostaCerta ? p.r[0] : 'ERRADA';
    const correta = p.r[0];

    if (escolhida === correta) {
        prova.acertos++;
    }

    prova.indice++;

    if (prova.indice >= prova.perguntas.length) {
        provasAtivas.delete(__getNumLimpo(sender));
        const nota = (prova.acertos / 5) * 10;
        const passou = nota >= 6;

        const db = carregarEscola();
        if (passou) {
            db[sender].nota = Math.min(10, db[sender].nota + nota);
            db[sender].medo = Math.max(0, db[sender].medo - 10);
            salvarEscola(db);
            await sock.sendMessage(from, {
                text: `╭━━━〔 🎓 𝐀𝐏𝐑𝐎𝐕𝐀𝐃𝐎! 〕━━━╮\n┃\n┃ ✅ *Acertos:* ${prova.acertos}/5\n┃ 📝 *Nota:* ${nota.toFixed(1)}\n┃\n┃ 🎉 *Parabéns, você passou!*\n┃ 📈 *Nota aumentada:* +${nota.toFixed(1)}\n┃ 📉 *Medo reduzido:* -10\n┃\n╰━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
        } else {
            salvarEscola(db);
            await sock.sendMessage(from, {
                text: `╭━━━〔 😢 𝐑𝐄𝐏𝐑𝐎𝐕𝐀𝐃𝐎 〕━━━╮\n┃\n┃ ❌ *Acertos:* ${prova.acertos}/5\n┃ 📝 *Nota:* ${nota.toFixed(1)}\n┃\n┃ 😔 *Você não passou.*\n┃ 💡 _Estude mais e tente de novo._\n┃\n╰━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
        }
        return true;
    }

    await sock.sendMessage(from, { text: escolhida === correta ? '✅ *Acertou!* Próxima...' : '❌ *Errou!* Próxima...' }, { quoted: msg });
    await enviarPerguntaProva(sock, from, sender);
    return true;
}
