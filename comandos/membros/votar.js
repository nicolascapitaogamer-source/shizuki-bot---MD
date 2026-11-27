// Gerado de index.js (case 'votar', linha 13498)
export default {
  nomes: ["votar"],
  async executar(__x) {
    const { carregarEleicao, salvarEleicao, args, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const idV = args[0];
            if (!idV) { await sock.sendMessage(from, { text: '⚠️ Use: *!votar <id>*\n\nEx: !votar 001' }, { quoted: msg }); return }
            const dbVt = carregarEleicao();
            if (dbVt.fase !== 'votacao') { await sock.sendMessage(from, { text: '⏳ Não tem votação em andamento!' }, { quoted: msg }); return }
            const idVf = idV.startsWith('#') ? idV : '#' + idV.padStart(3, '0');
            const candsVt = dbVt.candidatos || {};
            const candAlvo = Object.values(candsVt).find(c => c.id === idVf);
            if (!candAlvo) { await sock.sendMessage(from, { text: '❌ Candidato ' + idVf + ' não encontrado!\n\nUse *!candidatos* pra ver a lista.' }, { quoted: msg }); return }
            dbVt.votos = dbVt.votos || {};
            if (dbVt.votos[sender]) { await sock.sendMessage(from, { text: '⚠️ Você já votou!\n\nSeu voto: *' + dbVt.votos[sender] + '*' }, { quoted: msg }); return }
            dbVt.votos[sender] = candAlvo.id;
            salvarEleicao(dbVt);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🗳️ 𝐕𝐎𝐓𝐎 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐎 🗳️ 〕━━━╮\n┃\n┃ ✅ Seu voto foi computado!\n┃\n┃ 👤 Candidato: @' + candAlvo.id + '\n┃ 📊 ID: *' + candAlvo.id + '*\n┃\n┃ 💜 Obrigado por participar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯'
            }, { quoted: msg });
          }
          return
    }
  }
};
