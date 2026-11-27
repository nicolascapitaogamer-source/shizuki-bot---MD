// Gerado de index.js (case 'unblockcmdg', linha 11851)
export default {
  nomes: ["unblockcmdg","unblockcmd"],
  async executar(__x) {
    const { carregarJSON, FILE_BLOCK, canonicoCmd, salvarJSON, isDono, sock, from, msg, isGroup, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            if (!args[0]) {
              await sock.sendMessage(from, { text: '⚠️ Informe o comando que quer desbloquear. Ex: `!unblockcmdg s`' }, { quoted: msg });
              return
            }

            const blocksU = carregarJSON(FILE_BLOCK);
            const bloqU = Array.isArray(blocksU[from]) ? blocksU[from] : [];
            const cmdU = canonicoCmd(args[0]);

            if (!bloqU.includes(cmdU)) {
              await sock.sendMessage(from, { text: `ℹ️ O comando *!${cmdU}* não está bloqueado neste grupo.` }, { quoted: msg });
              return
            }

            const novaU = bloqU.filter(x => x !== cmdU);
            if (novaU.length) blocksU[from] = novaU;
            else delete blocksU[from];
            salvarJSON(FILE_BLOCK, blocksU);
            await sock.sendMessage(from, { text: 'Comando desbloqueado com sucesso! Agora, todos podem usar esse comando!' }, { quoted: msg });
          }
          return
    }
  }
};
