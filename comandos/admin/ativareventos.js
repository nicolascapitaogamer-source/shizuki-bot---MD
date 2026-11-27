// Gerado de index.js (case 'ativareventos', linha 7326)
export default {
  nomes: ["ativareventos"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Só admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./shizuki_eventos.json');
            db[from] = db[from] || {};
            db[from].ativo = true;
            db[from].ultimoEvento = 0;
            salvarJSON('./shizuki_eventos.json', db);
            await sock.sendMessage(from, { text: '🎉 *EVENTOS ATIVADOS!*\n\nVão rolar festas, baladas e aniversários por aqui!\n⏰ Fica atento!' }, { quoted: msg });
          }
          return
    }
  }
};
