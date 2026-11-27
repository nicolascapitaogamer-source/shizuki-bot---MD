// Gerado de index.js (case 'rebaixarall', linha 9136)
export default {
  nomes: ["rebaixarall"],
  async executar(__x) {
    const { getAdminFlag, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas admins!' }, { quoted: msg }); return }
            const criadorGp = gm.owner || (gm.participants.find(p => p.admin === 'superadmin')?.id);
            const admins = gm.participants.filter(p => p.admin && p.id !== criadorGp).map(p => p.id);
            if (!admins.length) {
              await sock.sendMessage(from, { text: 'ℹ️ Nenhum admin pra rebaixar (fora o criador).' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: `⏳ Rebaixando *${admins.length}* admins...` }, { quoted: msg });
            try {
              for (const jid of admins) {
                try { await sock.groupParticipantsUpdate(from, [jid], 'demote'); } catch (e) {}
                await new Promise(r => setTimeout(r, 500));
              }
              await sock.sendMessage(from, { text: `✅ *${admins.length}* admins rebaixados!` }, { quoted: msg });
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Erro. O bot precisa ser admin!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
