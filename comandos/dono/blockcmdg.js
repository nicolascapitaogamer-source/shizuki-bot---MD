// Gerado de index.js (case 'blockcmdg', linha 11809)
export default {
  nomes: ["blockcmdg","blockcmd"],
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

            const blocks = carregarJSON(FILE_BLOCK);
            const bloqGrupo = Array.isArray(blocks[from]) ? blocks[from] : [];

            if (!args[0]) {
              const textoBloq = bloqGrupo.length
                ? `🔒 *COMANDOS BLOQUEADOS NESTE GRUPO*\n\n` + bloqGrupo.map(x => `❌ !${x}`).join('\n') + `\n\nPara desbloquear: !unblockcmdg [comando]`
                : `ℹ️ Nenhum comando bloqueado neste grupo.\n\nPara bloquear: !blockcmdg [comando]\nExemplo: !blockcmdg s`;
              await sock.sendMessage(from, { text: textoBloq }, { quoted: msg });
              return
            }

            const cmdBloq = canonicoCmd(args[0]);

            if (cmdBloq === 'blockcmdg' || cmdBloq === 'unblockcmdg') {
              await sock.sendMessage(from, { text: '⚠️ Esse comando não pode ser bloqueado.' }, { quoted: msg });
              return
            }

            if (bloqGrupo.includes(cmdBloq)) {
              await sock.sendMessage(from, { text: `ℹ️ O comando *!${cmdBloq}* já está bloqueado. Para liberar use: !unblockcmdg ${cmdBloq}` }, { quoted: msg });
              return
            }

            bloqGrupo.push(cmdBloq);
            blocks[from] = bloqGrupo;
            salvarJSON(FILE_BLOCK, blocks);
            await sock.sendMessage(from, { text: 'Comando bloqueado com sucesso! Agora, apenas os líderes e dono podem usar!' }, { quoted: msg });
          }
          return
    }
  }
};
