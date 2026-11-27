// Gerado de index.js (case 'rmopengp', linha 7292)
export default {
  nomes: ["rmopengp"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_SCHEDULES, salvarJSON, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo!' }, { quoted: msg });
              return
            }
            let agendamentos = carregarJSON(FILE_SCHEDULES);
            const chaveOpen = `${from}_open`;
            let removido = false;
            if (agendamentos[chaveOpen]) { delete agendamentos[chaveOpen]; removido = true; }
            for (const k of Object.keys(agendamentos)) {
              if (agendamentos[k].groupId === from && agendamentos[k].tipo === 'open') {
                delete agendamentos[k];
                removido = true;
              }
            }
            if (removido) {
              salvarJSON(FILE_SCHEDULES, agendamentos);
              await sock.sendMessage(from, { text: '🗑️ *Agendamento de abertura REMOVIDO!*\n\nO grupo não vai mais abrir sozinho.' }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: 'ℹ️ Não há nenhum agendamento de abertura neste grupo.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
