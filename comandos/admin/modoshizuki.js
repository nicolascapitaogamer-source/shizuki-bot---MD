// Gerado de index.js (case 'modoshizuki', linha 15216)
export default {
  nomes: ["modoshizuki"],
  async executar(__x) {
    const { carregarJSON, salvarJSON, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{

            let isAdmGrupo = false;
            if (isGroup) {
              try {
                const metadata = await globalThis.__getGroupMetadata(from);
                const part = metadata.participants.find(p => p.id === sender || p.id.split('@')[0] === sender.split('@')[0]);
                isAdmGrupo = part?.admin === 'admin' || part?.admin === 'superadmin';
              } catch (e) {}
            }

            if (!isDono && !isAdmGrupo) {
              await sock.sendMessage(from, { text: '🚫 Apenas administradores podem ativar/desativar o Modo Shizuki!' }, { quoted: msg });
              return
            }

            const dbModo = carregarJSON('./modo_shizuki.json') || {};
            
            // Se for a primeira vez, o padrão é ativado (true)
            if (dbModo[from] === undefined) dbModo[from] = true; 
            dbModo[from] = !dbModo[from]; // Inverte o status PARA ESTE GRUPO
            
            salvarJSON('./modo_shizuki.json', dbModo);
            
            await sock.sendMessage(from, { 
              text: '╭─────────────────────╮\n   ⚙️ 𝐌𝐎𝐃𝐎 𝐑𝐏𝐆 ⚙️\n╰─────────────────────╯\n\n' + (dbModo[from] ? '✅ O Modo RPG Shizuki foi *ATIVADO* com sucesso!\n✨ Agora todos podem usar os comandos.' : '🔒 O Modo RPG Shizuki foi *DESATIVADO*!\n💡 _Ninguém poderá usar os comandos agora._') + '\n\n╰━━━━━━━━━━━━━━━━━━⬣' 
            }, { quoted: msg });
          }
          return
    }
  }
};
