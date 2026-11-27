// Gerado de index.js (case 'desistir', linha 6789)
export default {
  nomes: ["desistir"],
  async executar(__x) {
    const { pokeBatalhaDB, chaveBatalha, salvarPokeBatalha, from, sock, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const db = pokeBatalhaDB();
            const bt = db[chaveBatalha(from)];
            if (!bt) { await sock.sendMessage(from, { text: '❌ Nenhuma batalha rolando!' }, { quoted: msg }); return }
            if (bt.j1 !== sender && bt.j2 !== sender) { await sock.sendMessage(from, { text: '❌ Você não está nessa batalha!' }, { quoted: msg }); return }
            const oponente = bt.j1 === sender ? bt.j2 : bt.j1;
            delete db[chaveBatalha(from)];
            salvarPokeBatalha(db);
            await sock.sendMessage(from, {
              text: `🏳️ @${sender.split('@')[0]} desistiu!\n\n🏆 Vitória de @${oponente.split('@')[0]}!`,
              mentions: [sender, oponente]
            }, { quoted: msg });
          }
          return
    }
  }
};
