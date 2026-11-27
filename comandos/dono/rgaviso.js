// Gerado de index.js (case 'rgaviso', linha 12269)
export default {
  nomes: ["rgaviso"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_AVISOS, salvarJSON, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só pode ser usado em grupos!' }, { quoted: msg });
              return
            }
            try {
              const gmAv = await globalThis.__getGroupMetadata(from);
              const admAv = getAdminFlag(gmAv.participants, sender);
              if (!admAv && !isDono) {
                await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem programar avisos!' }, { quoted: msg });
                return
              }

              const mHora = /^(\d{1,2}):(\d{2})$/.exec(args[0] || '');
              const hhAv = mHora ? parseInt(mHora[1], 10) : -1;
              const mmAv = mHora ? parseInt(mHora[2], 10) : -1;
              if (hhAv < 0 || hhAv > 23 || mmAv < 0 || mmAv > 59) {
                await sock.sendMessage(from, { text: '⚠️ Informe o horário e a mensagem.\n\nEx: `!rgaviso 18:00 Reunião começando, pessoal!`' }, { quoted: msg });
                return
              }
              const horaAv = String(hhAv).padStart(2, '0') + ':' + String(mmAv).padStart(2, '0');

              const qAv = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
              const textoAv = (args.slice(1).join(' ') || qAv?.conversation || qAv?.extendedTextMessage?.text || '').trim();
              if (!textoAv) {
                await sock.sendMessage(from, { text: '⚠️ Escreva a mensagem do aviso depois do horário.\n\nEx: `!rgaviso 18:00 Reunião começando, pessoal!`' }, { quoted: msg });
                return
              }
              if (textoAv.length > 1000) {
                await sock.sendMessage(from, { text: '⚠️ O aviso pode ter no máximo 1000 caracteres!' }, { quoted: msg });
                return
              }

              const avisosReg = carregarJSON(FILE_AVISOS);
              const pendentesGrupo = Object.values(avisosReg).filter(a => a.groupId === from).length;
              if (pendentesGrupo >= 10) {
                await sock.sendMessage(from, { text: '⚠️ Este grupo já tem 10 avisos aguardando. Espere algum ser enviado!' }, { quoted: msg });
                return
              }

              const idAv = Date.now() + '_' + Math.floor(Math.random() * 1000);
              avisosReg[idAv] = { groupId: from, horario: horaAv, texto: textoAv, adm: sender };
              salvarJSON(FILE_AVISOS, avisosReg);

              await sock.sendMessage(from, {
                text: `⏰ *AVISO PROGRAMADO!*\n\n` +
                      `🕒 *Horário:* ${horaAv}\n` +
                      `💬 *Mensagem:* ${textoAv}\n` +
                      `👤 *Agendado por:* @${sender.split('@')[0]}\n\n` +
                      `✅ Pode deixar, vou avisar o grupo na hora certa!`,
                mentions: [sender]
              }, { quoted: msg });
            } catch (err) {
              console.error('Erro no comando !rgaviso:', err);
              await sock.sendMessage(from, { text: '❌ Ocorreu um erro ao programar o aviso.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
