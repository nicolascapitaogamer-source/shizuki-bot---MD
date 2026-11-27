// Gerado de index.js (case 'historico', linha 9333)
export default {
  nomes: ["historico","hist"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_ADVS, FILE_MUTES, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) return
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const ctxH = msg.message.extendedTextMessage?.contextInfo;
            const alvoH = ctxH?.mentionedJid?.[0] || ctxH?.participant;
            if (!alvoH) { await sock.sendMessage(from, { text: '⚠️ Marque a pessoa!\n\nEx: *!historico @pessoa*' }, { quoted: msg }); return }

            const advsH = carregarJSON(FILE_ADVS);
            const mutesH = carregarJSON(FILE_MUTES);
            const qtdAdvH = (advsH[from] && advsH[from][alvoH]) || 0;
            const mutadoH = mutesH[from] && mutesH[from][alvoH];
            const motivos = (advsH[from + '_motivos'] && advsH[from + '_motivos'][alvoH]) || [];

            let textoH = '╭━━━〔 📜 𝐇𝐈𝐒𝐓𝐎́𝐑𝐈𝐂𝐎 📜 〕━━━╮\n' +
              '┃\n' +
              '┃ 👤 Membro: @' + alvoH.split('@')[0] + '\n' +
              '┃ ⚠️ Advertências: *' + qtdAdvH + '/3*\n' +
              '┃ 🔇 Mutado: *' + (mutadoH ? '✅ Sim' : '❌ Não') + '*\n' +
              '┃\n';

            if (motivos.length > 0) {
              textoH += '┣━━━〔 📝 𝐔́𝐋𝐓𝐈𝐌𝐀𝐒 𝐀𝐃𝐕 〕━━━\n' + '┃\n';
              const ultimas = motivos.slice(-5).reverse();
              for (const m of ultimas) {
                const data = new Date(m.data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
                const hora = new Date(m.data).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
                textoH += '┃ 📅 ' + data + ' às ' + hora + '\n' +
                  '┃ ┗ ⚠️ ' + m.motivo + '\n' +
                  '┃    👮 @' + m.por.split('@')[0] + '\n' +
                  '┃\n';
              }
            } else {
              textoH += '┃ 💜 Sem advertências no histórico~\n┃\n';
            }

            textoH += '╰━━━━━━━━━━━━━━━━━━╯';

            const mencoesH = [alvoH];
            for (const m of motivos) mencoesH.push(m.por);

            await sock.sendMessage(from, { text: textoH, mentions: mencoesH }, { quoted: msg });
          }
          return
    }
  }
};
