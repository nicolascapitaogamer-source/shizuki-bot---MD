// Gerado de index.js (case 'antibots', linha 5766)
export default {
  nomes: ["antibots"],
  async executar(__x) {
    const { carregarJSON, salvarJSON, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só funciona em grupos.' }, { quoted: msg }); return }
            let isAdmGrupo = false;
            try {
              const metadata = await globalThis.__getGroupMetadata(from);
              const part = metadata.participants.find(p => p.id === sender || p.id.split('@')[0] === sender.split('@')[0]);
              isAdmGrupo = part?.admin === 'admin' || part?.admin === 'superadmin';
            } catch (e) {}
            if (!isDono && !isAdmGrupo) { await sock.sendMessage(from, { text: '🚫 Apenas administradores.' }, { quoted: msg }); return }

            const op = (args[0] || '').trim().toLowerCase();
            if (!['on', 'off'].includes(op)) { await sock.sendMessage(from, { text: '❌ Uso: *!antibots on* ou *!antibots off*' }, { quoted: msg }); return }

            const dbAntibots = carregarJSON('./antibots.json') || {};
            dbAntibots[from] = op === 'on';
            salvarJSON('./antibots.json', dbAntibots);

            const texto = op === 'on'
              ? '╭─────────────────────╮\n   🤖 𝐀𝐍𝐓𝐈-𝐁𝐎𝐓𝐒 🤖\n╰─────────────────────╯\n\n💜 Oii @' + sender.split('@')[0] + ', proteção ativada!\n🛡️ Status: *LIGADO*\n\n⚠️ A partir de agora, qualquer outro bot\nque fizer comando será banido.\n\n╰━━━━━━━━━━━━━━━━━━⬣'
              : '╭─────────────────────╮\n   🤖 𝐀𝐍𝐓𝐈-𝐁𝐎𝐓𝐒 🤖\n╰─────────────────────╯\n\n💜 Oii @' + sender.split('@')[0] + ', proteção desativada!\n🛡️ Status: *DESLIGADO*\n\n✅ Outros bots podem fazer comandos\nno grupo em paz.\n\n╰━━━━━━━━━━━━━━━━━━⬣';

            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
