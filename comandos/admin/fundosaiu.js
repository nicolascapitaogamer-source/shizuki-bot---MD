// Gerado de index.js (case 'fundosaiu', linha 9467)
export default {
  nomes: ["fundosaiu","setbye"],
  async executar(__x) {
    const { getAdminFlag, downloadContentFromMessage, fs, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const q = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImg = q?.imageMessage || msg.message.imageMessage;
            if (!isImg) { await sock.sendMessage(from, { text: '⚠️ *Oops!* Marque uma *imagem* ou mande direto com legenda!\n\n💡 Ex: responda uma foto com *!fundosaiu*' }, { quoted: msg }); return }
            try {
              const stream = await downloadContentFromMessage(isImg, 'image');
              let buf = Buffer.from([]);
              for await (const c of stream) buf = Buffer.concat([buf, c]);
              fs.writeFileSync('./saiu_media.jpg', buf);
              await sock.sendMessage(from, {
                text: `╭━━━〔 📸 𝐅𝐎𝐓𝐎 𝐃𝐄 𝐒𝐀𝐈́𝐃𝐀 〕━━━╮\n┃\n┃ 💜 Foto salva com sucesso!\n┃\n┃ 🕊️ Quando alguém sair, o\n┃    bot vai mandar essa foto~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Erro ao salvar.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
