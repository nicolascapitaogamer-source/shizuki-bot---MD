// Gerado de index.js (case 'comprararmadura', linha 5248)
export default {
  nomes: ["comprararmadura"],
  async executar(__x) {
    const { ARMADURAS_ARENA, pokeUser, verificarArmadura, salvarPokeUser, salvarArmadura, args, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const id = (args[0] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const arm = ARMADURAS_ARENA[id];
            if (!arm) { await sock.sendMessage(from, { text: '⚠️ Armadura inválida! Use !lojaarena' }, { quoted: msg }); return }
            const u = pokeUser(sender);
            if (u.pokecoins < arm.preco) { await sock.sendMessage(from, { text: '💰 Saldo insuficiente!' }, { quoted: msg }); return }
            const inv = verificarArmadura(sender);
            if (inv.inventario.includes(id)) { await sock.sendMessage(from, { text: '⚠️ Você já tem essa armadura!' }, { quoted: msg }); return }
            u.pokecoins -= arm.preco; salvarPokeUser(sender, u);
            inv.inventario.push(id); inv.equipada = id; salvarArmadura(sender, inv);
            await sock.sendMessage(from, { text: '✅ Você comprou e equipou *' + arm.nome + '*!' }, { quoted: msg });
          }
          return
    }
  }
};
