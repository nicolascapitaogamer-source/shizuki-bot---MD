// Gerado de index.js (case 'boton', linha 12199)
export default {
  nomes: ["boton"],
  async executar(__x) {
    const { carregarJSON, FILE_BOTSTATE, salvarJSON, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }
            const estOn = carregarJSON(FILE_BOTSTATE);
            let estavaOff = !!(estOn.__global && estOn.__global.off);
            delete estOn.__global;
            for (const k of Object.keys(estOn)) {
              if (estOn[k] && estOn[k].off) {
                estavaOff = true;
                delete estOn[k].off;
                if (!Object.keys(estOn[k]).length) delete estOn[k];
              }
            }
            if (!estavaOff) {
              await sock.sendMessage(from, { text: 'ℹ️ O bot já está ligado em todos os grupos.' }, { quoted: msg });
              return
            }
            salvarJSON(FILE_BOTSTATE, estOn);
            await sock.sendMessage(from, {
              text: `🔊 *BOT LIGADO EM TODOS OS GRUPOS!*\n\n` +
                    `⚡ O bot acordou e está pronto pra ação!\n` +
                    `✅ Todos os membros já podem usar os comandos novamente.`
            }, { quoted: msg });
          }
          return
    }
  }
};
