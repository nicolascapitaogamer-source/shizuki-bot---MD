// Gerado de index.js (case 'cancelarbatalha', linha 14038)
export default {
  nomes: ["cancelarbatalha"],
  async executar(__x) {
    const { carregarArena, chaveArena, shizukiUser, salvarShizuki, salvarArena, from, sock, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const dbDs = carregarArena();
            const chvDs = chaveArena(from);
            const ds = dbDs[chvDs];
            if (!ds || ds.finalizada) { await sock.sendMessage(from, { text: '❌ Nenhum duelo rolando!' }, { quoted: msg }); return }
            if (ds.j1 !== sender && ds.j2 !== sender) { await sock.sendMessage(from, { text: '❌ Você não está nesse duelo!' }, { quoted: msg }); return }
            const oponente = ds.j1 === sender ? ds.j2 : ds.j1;
            const uDes = shizukiUser(sender);
            const uOp = shizukiUser(oponente);
            uDes.ultimaArena = Date.now();
            uOp.ultimaArena = Date.now();
            salvarShizuki(sender, uDes);
            salvarShizuki(oponente, uOp);
            delete dbDs[chvDs];
            salvarArena(dbDs);
            await sock.sendMessage(from, {
              text: '🏳️ @' + sender.split('@')[0] + ' desistiu!\n\n🏆 Vitória de @' + oponente.split('@')[0] + '! (só a aposta dele volta)',
              mentions: [sender, oponente]
            }, { quoted: msg });
          }
          return
    }
  }
};
