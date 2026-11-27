// Gerado de index.js (case 'promoverall', linha 9112)
export default {
  nomes: ["promoverall"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const naoAdm = gm.participants.filter(p => !p.admin).map(p => p.id);
            if (!naoAdm.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Todos já são admins!' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: `⏳ Promovendo *${naoAdm.length}* membros...` }, { quoted: msg });
            try {
              for (const jid of naoAdm) {
                try { await sock.groupParticipantsUpdate(from, [jid], 'promote'); } catch (e) {}
                await new Promise(r => setTimeout(r, 500));
              }
              await sock.sendMessage(from, { text: `✅ *${naoAdm.length}* membros promovidos!` }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Erro ao promover. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
