// Gerado de index.js (case 'rgaluguel', linha 11970)
export default {
  nomes: ["rgaluguel"],
  async executar(__x) {
    const { carregarJSON, FILE_ALUGUEIS, dataAlug, salvarJSON, formatarDataBR, isDono, sock, from, msg, isGroup, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Use este comando dentro do grupo que será alugado!' }, { quoted: msg });
              return
            }
            const diasAlug = parseInt(args[0], 10);
            if (!diasAlug || diasAlug < 1 || diasAlug > 3650) {
              await sock.sendMessage(from, { text: '⚠️ Informe os dias do aluguel. Ex: `!rgaluguel 30`' }, { quoted: msg });
              return
            }

            let nomeGpAlug = 'Grupo';
            let linkAlug = 'Indisponível (o bot precisa ser ADM)';
            try {
              const gmAlug = await globalThis.__getGroupMetadata(from);
              nomeGpAlug = gmAlug.subject;
            } catch (e) {}
            try {
              const codAlug = await sock.groupInviteCode(from);
              if (codAlug) linkAlug = `https://chat.whatsapp.com/${codAlug}`;
            } catch (e) {}

            const alugueisReg = carregarJSON(FILE_ALUGUEIS);
            alugueisReg[from] = {
              nome: nomeGpAlug,
              inicio: dataAlug(0),
              expira: dataAlug(diasAlug),
              link: linkAlug
            };
            salvarJSON(FILE_ALUGUEIS, alugueisReg);

            await sock.sendMessage(from, {
              text: `✅ *ALUGUEL REGISTRADO!*\n\n` +
                    `👥 *Grupo:* ${nomeGpAlug}\n` +
                    `📅 *Início:* ${formatarDataBR(alugueisReg[from].inicio)}\n` +
                    `⏳ *Expira:* ${formatarDataBR(alugueisReg[from].expira)}\n` +
                    `🕒 *Duração:* ${diasAlug} dia(s)`
            }, { quoted: msg });
          }
          return
    }
  }
};
