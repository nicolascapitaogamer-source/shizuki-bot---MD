// Gerado de index.js (case 'opengp', linha 5930)
export default {
  nomes: ["opengp"],
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
              await sock.sendMessage(from, { text: '⚠️ Por favor informe um horário válido! Exemplo: `!opengp 16:00`' }, { quoted: msg });
              return
            }

            let agendamentos = carregarJSON(FILE_SCHEDULES);
            agendamentos[`${from}_open`] = {
              type: 'open',
              groupId: from,
              horario: horaDesejada,
              tipo: 'open',
              adm: sender
            };
            salvarJSON(FILE_SCHEDULES, agendamentos);

            await sock.sendMessage(from, { text: `⏰ Abertura do grupo agendada para as ${horaDesejada}!` }, { quoted: msg });

          } catch (err) {
            console.error('Erro no comando !opengp:', err);
            await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao agendar abertura do grupo.' }, { quoted: msg });
          }
          return
    }
  }
};
