// Gerado de index.js (case 'desativarspawn', linha 6561)
export default {
  nomes: ["desativarspawn"],
  async executar(__x) {
    const { getAdminFlag, pokeSpawnDB, salvarPokeSpawn, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo podem desativar!' }, { quoted: msg });
              return
            }
            const db = pokeSpawnDB();
            if (db[from]) db[from].ativo = false;
            salvarPokeSpawn(db);
            await sock.sendMessage(from, { text: '❌ *SPAWN DESATIVADO!*\n\nPokémons não vão mais aparecer neste grupo.' }, { quoted: msg });
          }
          return
    }
  }
};
