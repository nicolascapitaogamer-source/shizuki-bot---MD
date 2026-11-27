// Gerado de index.js (case 'soadm', linha 12228)
export default {
  nomes: ["soadm"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_BOTSTATE, salvarJSON, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            try {
              const gmSo = await globalThis.__getGroupMetadata(from);
              const admSo = getAdminFlag(gmSo.participants, sender);
              if (!admSo && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
                return
              }
              const estSo = carregarJSON(FILE_BOTSTATE);
              const gSo = estSo[from] || {};
              if (gSo.soadm) {
                delete gSo.soadm;
                if (Object.keys(gSo).length) estSo[from] = gSo;
                else delete estSo[from];
                salvarJSON(FILE_BOTSTATE, estSo);
                await sock.sendMessage(from, {
                  text: `🔓 *MODO SÓ ADM DESATIVADO!*\n\n` +
                        `🎉 Todos os membros já podem usar o bot novamente.`
                }, { quoted: msg });
              } else {
                gSo.soadm = true;
                estSo[from] = gSo;
                salvarJSON(FILE_BOTSTATE, estSo);
                await sock.sendMessage(from, {
                  text: `🛡️ *MODO SÓ ADM ATIVADO!*\n\n` +
                        `🔒 A partir de agora, somente administradores (além do dono e dos líderes) podem usar o bot neste grupo.\n\n` +
                        `Para desativar use !soadm novamente.`
                }, { quoted: msg });
              }
            } catch (err) {
              console.error('Erro no comando !soadm:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao alterar o modo só adm.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
