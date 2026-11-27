// Gerado de index.js (case 'forca', linha 14735)
export default {
  nomes: ["forca"],
  async executar(__x) {
    const { forcaJogos, FORCA_PALAVRAS, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const ctxF = msg.message.extendedTextMessage?.contextInfo;
            const alvoF = ctxF?.mentionedJid?.[0];
            if (!alvoF) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!forca @pessoa*' }, { quoted: msg }); return }
            if (alvoF === sender) { await sock.sendMessage(from, { text: '😅 Não pode jogar sozinho!' }, { quoted: msg }); return }
            if (forcaJogos.has(from)) { await sock.sendMessage(from, { text: '⚠️ Já tem um jogo da forca rolando!' }, { quoted: msg }); return }
            const palavraF = FORCA_PALAVRAS[Math.floor(Math.random() * FORCA_PALAVRAS.length)];
            forcaJogos.set(from, {
              palavra: palavraF.palavra,
              categoria: palavraF.categoria,
              letrasCertas: [],
              letrasErradas: [],
              acertos1: 0, acertos2: 0,
              erros1: 0, erros2: 0,
              j1: alvoF,
              j2: sender,
              vez: 1,
              criadoEm: Date.now()
            });
            const ocultoF = palavraF.palavra.split('').map(() => '＿').join(' ');
            await sock.sendMessage(from, {
              text: '╭━━━〔 🎮 𝐅𝐎𝐑𝐂𝐀 🎮 〕━━━╮\n┃\n┃ 👤 @' + sender.split('@')[0] + ' vs @' + alvoF.split('@')[0] + '\n┃\n┃ 📚 Categoria: *' + palavraF.categoria + '*\n┃\n┃ ' + ocultoF + '\n┃\n┃ 📊 PLACAR:\n┃ 👤 @' + alvoF.split('@')[0] + ': ✅ 0 | ❌ 0\n┃ 👤 @' + sender.split('@')[0] + ': ✅ 0 | ❌ 0\n┃\n┃ 🎯 Vez de @' + alvoF.split('@')[0] + '!\n┃    (marque esta mensagem)\n┃\n┃ 💡 Cancelar: !cancelarforca\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoF, sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
