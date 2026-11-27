// Gerado de index.js (case 'casar', linha 9926)
export default {
  nomes: ["casar"],
  async executar(__x) {
    const { shizukiUser, isGroup, msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!casar @pessoa`' }, { quoted: msg }); return }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Você não pode casar consigo mesmo(a)!' }, { quoted: msg }); return }

            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            if (uEu.casado) { await sock.sendMessage(from, { text: `❌ Você já é casado(a) com @${uEu.casado.split('@')[0]}!`, mentions: [uEu.casado] }, { quoted: msg }); return }
            if (uAlvo.casado) { await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já é casado(a)!`, mentions: [alvo] }, { quoted: msg }); return }

            const enviado = await sock.sendMessage(from, {
              text: `╭━━━〔 💍 𝐏𝐄𝐃𝐈𝐃𝐎 𝐃𝐄 𝐂𝐀𝐒𝐀𝐌𝐄𝐍𝐓𝐎! 〕━━━╮\n┃\n┃ 💜 @${sender.split('@')[0]} está pedindo\n┃    @${alvo.split('@')[0]} em casamento!\n┃\n┃ 💌 @${alvo.split('@')[0]}, você aceita?\n┃\n┃ ✍️ Responda *SIM* ou *NÃO*\n┃    marcando esta mensagem.\n┃ ⏰ 2 minutos.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender, alvo]
            }, { quoted: msg });

            const stanzaId = enviado?.key?.id;
            const pendentes = globalThis.__pedidosCasar || (globalThis.__pedidosCasar = new Map());
            pendentes.set(stanzaId, {
              de: sender, para: alvo, tipo: 'casar',
              timer: setTimeout(async () => {
                if (pendentes.has(stanzaId)) {
                  pendentes.delete(stanzaId);
                  try { await sock.sendMessage(from, { text: `⏰ @${alvo.split('@')[0]} não respondeu...\n\n💔 O pedido expirou.`, mentions: [alvo] }); } catch (e) {}
                }
              }, 120000)
            });
          }
          return
    }
  }
};
