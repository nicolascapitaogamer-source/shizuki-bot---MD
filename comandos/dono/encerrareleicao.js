// Gerado de index.js (case 'encerrareleicao', linha 13529)
export default {
  nomes: ["encerrareleicao"],
  async executar(__x) {
    const { carregarEleicao, salvarEleicao, carregarPresidente, salvarPresidente, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono!' }, { quoted: msg }); return }
            const dbEn = carregarEleicao();
            if (dbEn.fase !== 'votacao') { await sock.sendMessage(from, { text: '⚠️ Não tem votação em andamento!' }, { quoted: msg }); return }
            const votosEn = dbEn.votos || {};
            const contagem = {};
            for (const v of Object.values(votosEn)) { contagem[v] = (contagem[v] || 0) + 1; }
            const candsEn = Object.values(dbEn.candidatos || {});
            let vencedor = null;
            let maxVotos = 0;
            for (const c of candsEn) {
              const q = contagem[c.id] || 0;
              if (q > maxVotos) { maxVotos = q; vencedor = c; }
            }
            if (!vencedor) { await sock.sendMessage(from, { text: '❌ Nenhum voto foi computado!' }, { quoted: msg }); return }
            dbEn.fase = 'encerrada';
            dbEn.vencedor = vencedor;
            dbEn.encerradaEm = Date.now();
            salvarEleicao(dbEn);
            const dbPres = carregarPresidente();
            dbPres.grupos = dbPres.grupos || {};
            dbPres.grupos[from] = {
              jid: Object.keys(dbEn.candidatos).find(k => dbEn.candidatos[k].id === vencedor.id),
              id: vencedor.id,
              nome: vencedor.nome,
              grupo: vencedor.grupo,
              votos: maxVotos,
              eleitoEm: Date.now(),
              expiraEm: Date.now() + 7 * 24 * 3600000
            };
            dbPres.historico = dbPres.historico || [];
            dbPres.historico.push(dbPres.grupos[from]);
            salvarPresidente(dbPres);
            await sock.sendMessage(from, {
              text: '╭━━━〔 🏆 𝐄𝐋𝐄𝐈𝐂̧𝐀̃𝐎 𝐄𝐍𝐂𝐄𝐑𝐑𝐀𝐃𝐀 🏆 〕━━━╮\n┃\n┃ 👑 NOVO PRESIDENTE:\n┃    @' + dbPres.grupos[from].jid.split('@')[0] + '\n┃ 📅 Mandato: 7 dias\n┃ 🗳️ Votos: *' + maxVotos + '*\n┃\n┃ 💜 Parabéns, presidente!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [dbPres.grupos[from].jid]
            }, { quoted: msg });
          }
          return
    }
  }
};
