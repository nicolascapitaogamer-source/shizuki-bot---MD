// Gerado de index.js (case 'quiz', linha 12531)
export default {
  nomes: ["quiz"],
  async executar(__x) {
    const { quizJogos, mesmoJid, getAdminFlag, QUIZ_META, getPrefixo, esperar, quizProxima, isGroup, sock, from, msg, args, isDono, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            const qzSub = (args[0] || '').toLowerCase();
            const qzAtual = quizJogos.get(from);

            if (qzSub === 'parar' || qzSub === 'stop') {
              if (!qzAtual) {
                await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum quiz rolando neste grupo.' }, { quoted: msg });
                return
              }
              let podeQz = isDono || mesmoJid(qzAtual.dono, sender);
              if (!podeQz) {
                try {
                  const gmQz = await globalThis.__getGroupMetadata(from);
                  podeQz = !!getAdminFlag(gmQz.participants, sender);
                } catch (e) {}
              }
              if (!podeQz) {
                await sock.sendMessage(from, { text: '🚫 Só quem iniciou o quiz ou os admins podem cancelar!' }, { quoted: msg });
                return
              }
              clearTimeout(qzAtual.timer);
              quizJogos.delete(from);
              await sock.sendMessage(from, { text: '🛑 *Quiz cancelado!*' }, { quoted: msg });
              return
            }

            if (qzAtual && Date.now() - qzAtual.ultimo < 10 * 60 * 1000) {
              await sock.sendMessage(from, { text: '⚠️ Já tem um quiz rolando neste grupo! Responda a pergunta ou use `!quiz parar`.' }, { quoted: msg });
              return
            }
            if (qzAtual) clearTimeout(qzAtual.timer);

            const qzNovo = { dono: sender, pts: {}, num: 0, fila: null, atual: null, timer: null, ultimo: Date.now() };
            quizJogos.set(from, qzNovo);

            await sock.sendMessage(from, {
              text: `╭━━━〔 🧠 𝐐𝐔𝐈𝐙 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🧠 〕━━━╮\n┃\n` +
                    `┃ 🎯 Animais, anime, filmes,\n┃ desenhos e séries!\n┃\n` +
                    `┃ 🏁 Quem fizer *${QUIZ_META} pontos* vence!\n` +
                    `┃ ✍️ Responda *marcando a pergunta*,\n┃ sem prefixo.\n┃\n` +
                    `┃ 🛑 Para cancelar: *${getPrefixo(from)}encerrarquiz*\n` +
                    `┃ ⏳ Prepare-se...\n` +
                    `╰━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });

            for (const n of ['1️⃣', '2️⃣', '3️⃣']) {
              await esperar(1200);
              await sock.sendMessage(from, { text: n });
            }
            await esperar(1200);
            await sock.sendMessage(from, { text: '🚀 *VALENDO!*' });
            await quizProxima(from);
          }
          return
    }
  }
};
