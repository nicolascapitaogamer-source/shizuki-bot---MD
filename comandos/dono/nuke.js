// Gerado de index.js (case 'nuke', linha 6196)
export default {
  nomes: ["nuke"],
  async executar(__x) {
    const { isGroup, sock, from, msg, isDono, sender, pushName } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Só funciona em grupos.' }, { quoted: msg });
              return
            }
            if (!isDono) {
              await sock.sendMessage(from, { text: '❌ Apenas o Dono Principal pode usar este comando.' }, { quoted: msg });
              return
            }

            let meta;
            try {
              meta = await globalThis.__getGroupMetadata(from);
            } catch (e) {
              await sock.sendMessage(from, { text: '❌ Não consegui obter os dados do grupo.' }, { quoted: msg });
              return
            }

            const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const donoJid = sender;
            const autorNome = pushName || donoJid.split('@')[0];

            const membrosParaRemover = meta.participants
              .filter(p => p.id !== botJid && p.id !== donoJid)
              .map(p => p.id);

            await sock.sendMessage(from, { 
              text: `💣 *INICIANDO NUKE...*\n\n> Removendo *${membrosParaRemover.length}* membros.\n> Isso pode demorar.` 
            }, { quoted: msg });

            try {
              await sock.groupUpdateSubject(from, "🗑 Grupo Excluído");
            } catch {}

            const dataAgora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
            try {
              await sock.groupUpdateDescription(from, `Este grupo foi excluído por @${autorNome} em ${dataAgora}.`);
            } catch {}

            const LOTE = 5;
            for (let i = 0; i < membrosParaRemover.length; i += LOTE) {
              const lote = membrosParaRemover.slice(i, i + LOTE);
              try {
                await sock.groupParticipantsUpdate(from, lote, "remove");
              } catch (e) {
                console.log("Erro ao remover lote:", e.message);
              }
              await new Promise(r => setTimeout(r, 2000));
            }

            await sock.sendMessage(from, { 
              text: "✅ *Grupo limpo!*\n\n> O bot vai sair agora." 
            }, { quoted: msg });
            await new Promise(r => setTimeout(r, 2000));

            try {
              await sock.groupLeave(from);
            } catch (e) {
              console.log("Erro ao sair:", e.message);
            }
          }
          return
    }
  }
};
