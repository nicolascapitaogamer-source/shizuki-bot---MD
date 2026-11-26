import fs from 'fs';
const FILE_PREFIXO = './prefixo.json';

export function getPrefixo(from = null) {
    const db = JSON.parse(fs.readFileSync(FILE_PREFIXO, 'utf8'));
    if (from && db.grupos && db.grupos[from] && db.grupos[from].ativo) {
        return db.grupos[from].prefixo || db.global;
    }
    return db.global;
}

export function getStatusMulti(from) {
    const db = JSON.parse(fs.readFileSync(FILE_PREFIXO, 'utf8'));
    return db.grupos[from] ? db.grupos[from].ativo === true : false;
}

export function toggleMulti(from, ativo) {
    const db = JSON.parse(fs.readFileSync(FILE_PREFIXO, 'utf8'));
    if (!db.grupos[from]) db.grupos[from] = { ativo: false, prefixo: null };
    db.grupos[from].ativo = ativo;
    fs.writeFileSync(FILE_PREFIXO, JSON.stringify(db, null, 2));
}

export function setPrefixoGrupo(from, novo) {
    const db = JSON.parse(fs.readFileSync(FILE_PREFIXO, 'utf8'));
    if (!db.grupos[from]) db.grupos[from] = { ativo: true, prefixo: novo };
    else db.grupos[from].prefixo = novo;
    db.grupos[from].ativo = true;
    fs.writeFileSync(FILE_PREFIXO, JSON.stringify(db, null, 2));
}

export async function multiprefixo(sock, msg, from, sender, args, isDono, isGroup) {
    if (!isGroup) return;
    const gm = await sock.groupMetadata(from);
    const ehAdm = ehAdmGrupo(gm.participants, sender);
    if (!ehAdm && !isDono) {
        await sock.sendMessage(from, { text: '🚫 Apenas admins ou donos!' }, { quoted: msg });
        return;
    }
    const opcao = (args[0] || '').toLowerCase();
    const p = getPrefixo(from);
    const ativo = getStatusMulti(from);
    if (!['on', 'off'].includes(opcao)) {
        await sock.sendMessage(from, {
            text: `╭━━━〔 ⚙️ 𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎 〕━━━╮\n┃\n┃ 🟢 *Status:* ${ativo ? 'ATIVADO' : 'DESATIVADO'}\n┃\n┃ 📋 *Comandos:*\n┃ ➜ ${p}multiprefixo on/off\n┃ ➜ ${p}setprefixo <novo>\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯`
        }, { quoted: msg });
        return;
    }
    toggleMulti(from, opcao === 'on');
    await sock.sendMessage(from, {
        text: `╭━━━〔 ⚙️ 𝐌𝐔𝐋𝐓𝐈𝐏𝐑𝐄𝐅𝐈𝐗𝐎 〕━━━╮\n┃\n┃ ${opcao === 'on' ? '🟢 *ATIVADO!*' : '🔴 *DESATIVADO*'}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯`
    }, { quoted: msg });
}

export async function setprefixo(sock, msg, from, sender, args, isDono, isGroup) {
    if (!isGroup) return;
    const gm = await sock.groupMetadata(from);
    const ehAdm = ehAdmGrupo(gm.participants, sender);
    if (!ehAdm && !isDono) {
        await sock.sendMessage(from, { text: '🚫 Apenas admins ou donos!' }, { quoted: msg });
        return;
    }
    const p = getPrefixo(from);
    const ativo = getStatusMulti(from);
    if (!ativo) {
        await sock.sendMessage(from, { text: `❌ Ative o multiprefixo primeiro: ${p}multiprefixo on` }, { quoted: msg });
        return;
    }
    const novo = args[0];
    if (!novo || novo.length > 3) {
        await sock.sendMessage(from, { text: `⚠️ Use: ${p}setprefixo <símbolo> (máx 3 caracteres)` }, { quoted: msg });
        return;
    }
    setPrefixoGrupo(from, novo);
    await sock.sendMessage(from, { text: `✅ Prefixo do grupo alterado para: *${novo}*` }, { quoted: msg });
}

function ehAdmGrupo(participants, id) {
    const n = j => (j || '').split(':')[0].split('@')[0];
    return (participants || []).some(p =>
        (p.admin === 'admin' || p.admin === 'superadmin') &&
        [p.id, p.lid, p.jid, p.phoneNumber].filter(Boolean).map(n).includes(n(id))
    );
}
