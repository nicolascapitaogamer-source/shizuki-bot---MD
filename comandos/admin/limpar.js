// Gerado de index.js (case 'limpar', linha 5151)
export default {
  nomes: ["limpar","clearchat"],
  async executar(__x) {
    const { isGroup, sock, from, msg, sender, isDono } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Este comando só funciona em grupos!' }, { quoted: msg });
              return
            }
            let isAdmGrupo = false;
            try {
              const metadata = await globalThis.__getGroupMetadata(from);
              const part = metadata.participants.find(p => p.id === sender || p.id.split('@')[0] === sender.split('@')[0]);
              isAdmGrupo = part?.admin === 'admin' || part?.admin === 'superadmin';
            } catch (e) {}
            
            if (!isDono && !isAdmGrupo) {
              await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🚫 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎 🚫\n╰─────────────────────╯\n\n❌ Apenas administradores podem limpar o chat!\n💡 _Pede pra um adm usar o comando._\n\n╰━━━━━━━━━━━━━━━━━━⬣' }, { quoted: msg });
              return
            }
            
            try { await sock.sendMessage(from, { delete: msg.key }); } catch (e) {}
            
            const quebras = '\n'.repeat(300);
            await sock.sendMessage(from, { text: quebras });
            
            await sock.sendMessage(from, { text: '✨ 𝐂𝐡𝐚𝐭 𝐥𝐢𝐦𝐩𝐨! ✨\n✨ _Comando executado por: @' + sender.split('@')[0] + '_', mentions: [sender] });
          }
          return
    }
  }
};
