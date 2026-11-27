// Gerado de index.js (case 'closegp', linha 5970)
export default {
  nomes: ["closegp"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_SCHEDULES, salvarJSON, isGroup, sock, from, msg, sender, args } = Object.assign({}, __x.utils, __x);
    {
if (!isGroup) {
            await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
            return
          }

          try {
            const groupMetadata = await globalThis.__getGroupMetadata(from);
            const participants = groupMetadata.participants;
            const senderAdmin = getAdminFlag(participants, sender);

            if (!senderAdmin) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem usar este comando!' }, { quoted: msg });
              return
            }

            const horaDesejada = args[0];
            if (!horaDesejada || !/^\d{2}:\d{2}$/.test(horaDesejada)) {
              await sock.sendMessage(from, { text: '⚠️ Por favor informe um horário válido! Exemplo: `!closegp 22:00`' }, { quoted: msg });
              return
            }

            let agendamentos = carregarJSON(FILE_SCHEDULES);
            agendamentos[`${from}_close`] = {
              type: 'close',
              groupId: from,
              horario: horaDesejada,
              tipo: 'close',
              adm: sender
            };
            salvarJSON(FILE_SCHEDULES, agendamentos);

            await sock.sendMessage(from, { text: `⏰ Fechamento do grupo agendado para as ${horaDesejada}!` }, { quoted: msg });

          } catch (err) {
            console.error('Erro no comando !closegp:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao agendar fechamento do grupo.' }, { quoted: msg });
          }
          return
    }
  }
};
