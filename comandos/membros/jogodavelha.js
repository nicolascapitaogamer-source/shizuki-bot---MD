// Gerado de index.js (case 'jogodavelha', linha 12471)
export default {
  nomes: ["jogodavelha","velha"],
  async executar(__x) {
    const { velhaJogos, mesmoJid, getAdminFlag, velhaTexto, numDe, isGroup, sock, from, msg, args, isDono, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            const vlSub = (args[0] || '').toLowerCase();
            const vlAtual = velhaJogos.get(from);

            if (vlSub === 'parar' || vlSub === 'cancelar') {
              if (!vlAtual) {
                await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum jogo da velha rolando neste grupo.' }, { quoted: msg });
                return
              }
              let podeParar = isDono || vlAtual.j.some((x) => mesmoJid(x, sender));
              if (!podeParar) {
                try {
                  const gmVl = await globalThis.__getGroupMetadata(from);
                  podeParar = !!getAdminFlag(gmVl.participants, sender);
                } catch (e) {}
              }
              if (!podeParar) {
                await sock.sendMessage(from, { text: '🚫 Só os jogadores ou os admins podem cancelar o jogo!' }, { quoted: msg });
                return
              }
              velhaJogos.delete(from);
              await sock.sendMessage(from, { text: '🛑 *Jogo da velha cancelado!*' }, { quoted: msg });
              return
            }

            const vlAdv = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            if (!vlAdv) {
              await sock.sendMessage(from, { text: '⚠️ Marque quem você quer desafiar!\n\nEx: `!jogodavelha @pessoa`' }, { quoted: msg });
              return
            }
            if (mesmoJid(vlAdv, sender)) {
              await sock.sendMessage(from, { text: '😅 Você não pode jogar contra você mesmo(a)! Marque outra pessoa.' }, { quoted: msg });
              return
            }
            if (sock.user && mesmoJid(vlAdv, sock.user.id)) {
              await sock.sendMessage(from, { text: '🤖 Eu não jogo, só organizo a bagunça! Marque outra pessoa.' }, { quoted: msg });
              return
            }
            if (vlAtual && Date.now() - vlAtual.ultimo < 15 * 60 * 1000) {
              await sock.sendMessage(from, { text: '⚠️ Já tem um jogo da velha rolando neste grupo! Espere acabar ou use `!jogodavelha parar`.' }, { quoted: msg });
              return
            }

            const gVl = { j: [sender, vlAdv], pts: [0, 0], sim: ['X', 'O'], tab: Array(9).fill(null), vez: 0, inicia: 0, rodada: 1, ultimo: Date.now() };
            velhaJogos.set(from, gVl);
            await sock.sendMessage(from, {
              text: velhaTexto(gVl, `🎮 @${numDe(sender)} desafiou @${numDe(vlAdv)}!\n⚔️ Que vença o melhor!`),
              mentions: [sender, vlAdv]
            }, { quoted: msg });
          }
          return
    }
  }
};
