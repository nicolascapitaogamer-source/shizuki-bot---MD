// Gerado de index.js (case 'memoria', linha 14764)
export default {
  nomes: ["memoria"],
  async executar(__x) {
    const { memoriaJogos, MEMORIA_EMOJIS, isGroup, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const ctxM = msg.message.extendedTextMessage?.contextInfo;
            const alvoM = ctxM?.mentionedJid?.[0];
            if (!alvoM) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!memoria @pessoa*' }, { quoted: msg }); return }
            if (memoriaJogos.has(from)) { await sock.sendMessage(from, { text: '⚠️ Já tem um jogo da memória rolando!' }, { quoted: msg }); return }
            const emojisEscolhidos = [...MEMORIA_EMOJIS].sort(() => Math.random() - 0.5).slice(0, 4);
            const msgMostra = await sock.sendMessage(from, {
              text: '╭━━━〔 🧠 𝐌𝐄𝐌𝐎𝐑𝐈𝐀 🧠 〕━━━╮\n┃\n┃ 🎯 Memorize a ordem:\n┃\n┃ ' + emojisEscolhidos.join(' ') + '\n┃\n┃ ⏰ 5 segundos...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [alvoM]
            }, { quoted: msg });
            memoriaJogos.set(from, {
              ordem: emojisEscolhidos,
              jogador: alvoM,
              rodada: 1,
              pontos: 0,
              criadoEm: Date.now(),
              fase: 'mostrando',
              msgMostraId: msgMostra?.key?.id
            });
            setTimeout(async () => {
              const jogoM = memoriaJogos.get(from);
              if (!jogoM || jogoM.fase !== 'mostrando') return;
              // APAGA a mensagem com os emojis
              try {
                await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: true, id: jogoM.msgMostraId, participant: sender } });
              } catch (e) {}
              jogoM.fase = 'respondendo';
              memoriaJogos.set(from, jogoM);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🧠 𝐌𝐄𝐌𝐎𝐑𝐈𝐀 🧠 〕━━━╮\n┃\n┃ 🎯 Qual era a ordem?\n┃\n┃ 1️⃣ ? \n┃ 2️⃣ ? \n┃ 3️⃣ ? \n┃ 4️⃣ ? \n┃\n┃ 🎯 @' + alvoM.split('@')[0] + ', responda:\n┃    (marque esta mensagem)\n┃\n┃ 💡 Ex: 🍎🍌🍇🍓\n┃ ⏰ 30 segundos!\n┃\n┃ 💤 Cancelar: !cancelarmemoria\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [alvoM]
              }, { quoted: msg });
            }, 5000);
          }
          return
    }
  }
};
