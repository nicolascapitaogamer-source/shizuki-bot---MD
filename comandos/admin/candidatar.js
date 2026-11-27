// Gerado de index.js (case 'candidatar', linha 13231)
export default {
  nomes: ["candidatar"],
  async executar(__x) {
    const { grupoTemAluguelAtivo, ehAdmDoGrupoP, carregarEleicao, proximoIdProposta, salvarEleicao, isGroup, sock, from, msg, sender, pushName, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            if (!grupoTemAluguelAtivo(from)) { await sock.sendMessage(from, { text: '❌ Este grupo não tem aluguel ativo do bot!' }, { quoted: msg }); return }
            console.log('[DEBUG] sender:', sender, '| from:', from, '| pushName:', pushName);
            const ehAdmC = await ehAdmDoGrupoP(sock, from, sender);
            console.log('[DEBUG] ehAdmC:', ehAdmC, '| isDono:', isDono);
            if (!ehAdmC && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas administradores do grupo podem se candidatar!' }, { quoted: msg }); return }

            const dbEle = carregarEleicao();
            dbEle.candidatos = dbEle.candidatos || {};

            const candsDoGrupo = Object.values(dbEle.candidatos).filter(c => c.grupo === from);
            if (candsDoGrupo.length >= 3) {
              await sock.sendMessage(from, { text: '⚠️ Este grupo já tem 3 candidatos (limite máximo)!' }, { quoted: msg });
              return
            }
            if (dbEle.candidatos[sender]) {
              await sock.sendMessage(from, { text: '⚠️ Você já é candidato!' }, { quoted: msg });
              return
            }

            const idCand = proximoIdProposta(dbEle.candidatos);
            dbEle.candidatos[sender] = {
              id: idCand,
              grupo: from,
              nome: pushName,
              propostas: [],
              desde: Date.now()
            };
            salvarEleicao(dbEle);

            const gmC = await globalThis.__getGroupMetadata(from);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐂𝐀𝐍𝐃𝐈𝐃𝐀𝐓𝐔𝐑𝐀 🗳️ 〕━━━╮\n' +
                    '┃\n' +
                    '┃ ✅ Você se candidatou!\n' +
                    '┃\n' +
                    '┃ 📊 ID: *' + idCand + '*\n' +
                    '┃ 👤 @' + sender.split('@')[0] + '\n' +
                    '┃ 👥 Grupo: ' + gmC.subject + '\n' +
                    '┃ 📝 Propostas: *0/4*\n' +
                    '┃\n' +
                    '┃ 💡 Use: *!enviarproposta <texto>*\n' +
                    '┃\n' +
                    '╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
