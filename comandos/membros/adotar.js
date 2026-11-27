// Gerado de index.js (case 'adotar', linha 9983)
export default {
  nomes: ["adotar"],
  async executar(__x) {
    const { shizukiUser, isGroup, msg, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
            if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: `!adotar @pessoa`' }, { quoted: msg }); return }
            if (alvo === sender) { await sock.sendMessage(from, { text: '😅 Você não pode se adotar!' }, { quoted: msg }); return }

            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            uEu.filhos = uEu.filhos || [];
            if (uEu.filhos.length >= 5) { await sock.sendMessage(from, { text: '❌ Você já tem 5 filhos (máximo)!' }, { quoted: msg }); return }
            if (uAlvo.pai || uAlvo.mae) { await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já tem família!`, mentions: [alvo] }, { quoted: msg }); return }

            const enviado = await sock.sendMessage(from, {
              text: `╭━━━〔 👶 𝐏𝐄𝐃𝐈𝐃𝐎 𝐃𝐄 𝐀𝐃𝐎𝐂̧𝐀̃𝐎! 〕━━━╮\n┃\n┃ 💜 @${sender.split('@')[0]} quer adotar\n┃    @${alvo.split('@')[0]}!\n┃\n┃ 💌 @${alvo.split('@')[0]}, você aceita?\n┃\n┃ ✍️ Responda *SIM* ou *NÃO*.\n┃ ⏰ 2 minutos.\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender, alvo]
            }, { quoted: msg });

            const stanzaId = enviado?.key?.id;
            const pendentes = globalThis.__pedidosCasar || (globalThis.__pedidosCasar = new Map());
            pendentes.set(stanzaId, {
              de: sender, para: alvo, tipo: 'adotar',
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
