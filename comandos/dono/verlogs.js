// Gerado de index.js (case 'verlogs', linha 10927)
export default {
  nomes: ["verlogs","logs"],
  async executar(__x) {
    const { carregarJSON, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar~ 💜' }, { quoted: msg }); return }

            const db = carregarJSON('./logs.json');
            const nomeBusca = (args[0] || '').toLowerCase().trim();
            const qtd = Math.min(parseInt(args[1] || '20', 10) || 20, 100);

            if (!nomeBusca) {
              const grupos = Object.keys(db).filter(k => k !== '__global');
              if (!grupos.length) {
                await sock.sendMessage(from, {
                  text: `╭━━━〔 💤 𝐒𝐄𝐌 𝐋𝐎𝐆𝐒 〕━━━╮\n┃\n┃ 💜 Tô de olhos fechados\n┃    ainda~ 🕊️\n┃\n┃ 💡 Ative com: *!espiao on*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
                }, { quoted: msg });
                return
              }
              let txt = `╭━━━〔 📋 𝐆𝐑𝐔𝐏𝐎𝐒 𝐂𝐎𝐌 𝐋𝐎𝐆𝐒 〕━━━╮\n┃\n┃ 💜 Aqui estão os grupos\n┃    que eu espiei~ 👁️\n┃\n`;
              for (const g of grupos) {
                const total = (db[g].mensagens || []).length;
                let nome = g;
                try { const m = await globalThis.__getGroupMetadata(g); nome = m.subject; } catch (e) {}
                txt += `┃ 📁 *${nome}*\n┃    ┗ 📊 ${total} mensagens\n┃\n`;
              }
              txt += `┃ 💡 Use: *!verlogs <nome>* 🎀\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
              await sock.sendMessage(from, { text: txt }, { quoted: msg });
              return
            }

            let grupoEncontrado = null;
            for (const g of Object.keys(db)) {
              if (g === '__global') continue;
              try {
                const m = await globalThis.__getGroupMetadata(g);
                if (m.subject.toLowerCase().includes(nomeBusca)) { grupoEncontrado = g; break; }
              } catch (e) {}
            }

            if (!grupoEncontrado || !db[grupoEncontrado] || !db[grupoEncontrado].mensagens) {
              await sock.sendMessage(from, { text: `❌ Nenhum log salvo pra *${nomeBusca}*~` }, { quoted: msg });
              return
            }

            const todas = db[grupoEncontrado].mensagens;
            const ultimas = todas.slice(-qtd);
            const gm = await globalThis.__getGroupMetadata(grupoEncontrado).catch(() => ({ subject: 'Grupo' }));

            let txt = `╭━━━〔 📋 𝐔́𝐋𝐓𝐈𝐌𝐀𝐒 𝐌𝐄𝐍𝐒𝐀𝐆𝐄𝐍𝐒 〕━━━╮\n┃\n┃ 🕵️ *Grupo:* ${gm.subject}\n┃ 📊 *Total:* ${todas.length}/200\n┃ 📝 *Mostrando:* ${ultimas.length}\n┃\n╰━━━━━━━━━━━━━━━━━━╯\n\n🎀 *Aqui está o que rolou~*\n\n`;

            for (const m of ultimas) {
              const hora = new Date(m.hora).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
              const emojiTipo = m.tipo === 'foto' ? '🖼️' : m.tipo === 'video' ? '🎥' : m.tipo === 'audio' ? '🎵' : m.tipo === 'sticker' ? '🎨' : m.tipo === 'comando' ? '⚙️' : '💬';
              const conteudo = m.tipo === 'foto' ? '[foto]' : m.tipo === 'video' ? '[vídeo]' : m.tipo === 'audio' ? '[áudio]' : m.tipo === 'sticker' ? '[sticker]' : (m.texto || '').slice(0, 80);
              txt += `👤 *${m.nome}* ─ [${hora}]\n    ${emojiTipo} ${conteudo}\n\n`;
            }

            await sock.sendMessage(from, { text: txt }, { quoted: msg });
          }
          return
    }
  }
};
