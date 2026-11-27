// Gerado de index.js (case 'desativareventos', linha 7341)
export default {
  nomes: ["desativareventos"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, salvarJSON, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Só admins!' }, { quoted: msg }); return }
            const db = carregarJSON('./shizuki_eventos.json');
            if (db[from]) db[from].ativo = false;
            salvarJSON('./shizuki_eventos.json', db);
            await sock.sendMessage(from, { text: '❌ *EVENTOS DESATIVADOS!*\n\nSem festas por aqui... 😴' }, { quoted: msg });
          }
          return
    }
  }
};
