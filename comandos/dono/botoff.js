// Gerado de index.js (case 'botoff', linha 12176)
export default {
  nomes: ["botoff"],
  async executar(__x) {
    const { carregarJSON, FILE_BOTSTATE, salvarJSON, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }
            const estOff = carregarJSON(FILE_BOTSTATE);
            if (estOff.__global && estOff.__global.off) {
              await sock.sendMessage(from, { text: 'ℹ️ O bot já está desligado em todos os grupos. Para ligar use: !boton' }, { quoted: msg });
              return
            }
            estOff.__global = { off: true };
            salvarJSON(FILE_BOTSTATE, estOff);
            await sock.sendMessage(from, {
              text: `🔇 *BOT DESLIGADO EM TODOS OS GRUPOS!*\n\n` +
                    `😴 O bot foi colocado para dormir em todos os grupos.\n` +
                    `🚫 Os membros não conseguem usar nenhum comando.\n` +
                    `👑 Só o dono e os líderes continuam com acesso.\n\n` +
                    `Para acordar o bot use: !boton`
            }, { quoted: msg });
          }
          return
    }
  }
};
