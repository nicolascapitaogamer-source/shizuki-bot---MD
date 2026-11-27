// Gerado de index.js (case 'enviarproposta', linha 13306)
export default {
  nomes: ["enviarproposta"],
  async executar(__x) {
    const { carregarEleicao, carregarPropostas, proximoIdProposta, salvarPropostas, salvarEleicao, isGroup, sock, from, msg, args, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const textoProp = args.join(' ').trim();
            if (!textoProp) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!enviarproposta <texto>*' }, { quoted: msg });
              return
            }
            const dbEl = carregarEleicao();
            dbEl.candidatos = dbEl.candidatos || {};
            if (!dbEl.candidatos[sender]) {
              await sock.sendMessage(from, { text: '❌ Você não é candidato! Use *!candidatar* primeiro.' }, { quoted: msg });
              return
            }
            if (dbEl.candidatos[sender].propostas.length >= 4) {
              await sock.sendMessage(from, { text: '⚠️ Você já enviou 4 propostas (máximo)!' }, { quoted: msg });
              return
            }
            const dbProps = carregarPropostas();
            const idProp = proximoIdProposta(dbProps);
            dbProps[idProp] = {
              id: idProp,
              candidato: sender,
              grupo: from,
              texto: textoProp,
              status: 'pendente',
              criadoEm: Date.now()
            };
            salvarPropostas(dbProps);
            dbEl.candidatos[sender].propostas.push(idProp);
            salvarEleicao(dbEl);

            await sock.sendMessage(from, {
              text: '╭━━━〔 📜 𝐏𝐑𝐎𝐏𝐎𝐒𝐓𝐀 𝐄𝐍𝐕𝐈𝐀𝐃𝐀 📜 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ✅ Proposta registrada!\n' +
                    '┃\n' +
                    '┃ 📜 ID: *' + idProp + '*\n' +
                    '┃ 👤 De: @' + sender.split('@')[0] + '\n' +
                    '┃ 📝 "' + textoProp + '"\n' +
                    '┃ 📊 Propostas: *' + dbEl.candidatos[sender].propostas.length + '/4*\n' +
                    '┃\n' +
                    '┃ 💡 Aguardando aprovação do dono!\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
