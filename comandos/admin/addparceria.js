// Gerado de index.js (case 'addparceria', linha 9208)
export default {
  nomes: ["addparceria"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, from, sender, config, isDono, sock, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            const ehLider = (config.lideres || []).some(l => l && String(l).split('@')[0] === sender.split('@')[0]);
            if (!ehAdm && !ehLider && !isDono) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Apenas *admins*, *líderes*\n┃    e o *dono* podem usar isso!\n┃\n┃ 🕊️ Peça ajuda a um deles~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }

            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) {
              await sock.sendMessage(from, { text: '⚠️ *Oops!* Marque a pessoa!\n\n💡 Ex: *!addparceria @pessoa 5*' }, { quoted: msg });
              return
            }
            const qtd = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
            if (!qtd || qtd < 1 || qtd > 999) {
              await sock.sendMessage(from, { text: '⚠️ *Oops!* Informe a quantidade de links (1 a 999)!\n\n💡 Ex: *!addparceria @pessoa 5*' }, { quoted: msg });
              return
            }

            const db = carregarJSON('./parcerias.json');
            db[from] = db[from] || { ativo: false, parceiros: {} };
            db[from].parceiros = db[from].parceiros || {};

            if (db[from].parceiros[alvo]) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 ⚠️ 𝐉𝐀́ 𝐓𝐄𝐌 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 〕━━━╮\n┃\n┃ 💜 @${alvo.split('@')[0]} já tem uma\n┃    parceria ativa! ✨\n┃\n┃ 📊 Links liberados: *${db[from].parceiros[alvo].total}*\n┃\n┃ 🕊️ Se quiser mudar, use\n┃    *!rmparceria* primeiro~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
                mentions: [alvo]
              }, { quoted: msg });
              return
            }

            db[from].parceiros[alvo] = { total: qtd, usados: 0, desde: Date.now() };
            salvarJSON('./parcerias.json', db);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🤝 𝐏𝐀𝐑𝐂𝐄𝐑𝐈𝐀 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐀 〕━━━╮\n┃\n┃ 💜 *Parceria criada com sucesso!* ✨\n┃\n┃ 👤 @${alvo.split('@')[0]}\n┃ 🔗 Links liberados: *${qtd}*\n┃\n┃ 🕊️ Enquanto tiver links,\n┃    pode divulgar no grupo~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [alvo]
            }, { quoted: msg });
          }
          return
    }
  }
};
