// Gerado de index.js (case 'ativarspawn', linha 6545)
export default {
  nomes: ["ativarspawn"],
  async executar(__x) {
    const { getAdminFlag, pokeSpawnDB, salvarPokeSpawn, isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gm = await globalThis.__getGroupMetadata(from);
            const ehAdm = !!getAdminFlag(gm.participants, sender);
            if (!ehAdm && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins do grupo podem ativar o spawn!' }, { quoted: msg });
              return
            }
            const db = pokeSpawnDB();
            db[from] = { ativo: true, ultimoSpawn: 0 };
            salvarPokeSpawn(db);
            await sock.sendMessage(from, { text: '✅ *SPAWN ATIVADO!*\n\n🐾 Pokémons vão aparecer a cada 5 minutos.\n💡 Use *!capturar <nome>* pra pegar!' }, { quoted: msg });
          }
          return
    }
  }
};
