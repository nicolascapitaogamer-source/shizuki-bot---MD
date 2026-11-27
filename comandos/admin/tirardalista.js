// Gerado de index.js (case 'tirardalista', linha 14962)
export default {
  nomes: ["tirardalista"],
  async executar(__x) {
    const { getAdminFlag, limparNumero, carregarListaNegra, salvarListaNegra, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmTLN = await globalThis.__getGroupMetadata(from);
            const ehAdmTLN = !!getAdminFlag(gmTLN.participants, sender);
            if (!ehAdmTLN && !isDono) { await sock.sendMessage(from, { text: '╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 🚫 〕━━━╮\n┃\n┃ ❌ Apenas *admins*, *líderes*\n┃    e o *dono* podem usar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); return }
            const numTirar = limparNumero(args[0]);
            if (!numTirar || numTirar.length < 10) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 ⚠️ 〕━━━╮\n┃\n┃ ❌ Informe o número!\n┃\n┃ 💡 Use: *!tirardalista <numero>*\n┃ 📝 Ex: *!tirardalista 5511999999999*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); return }
            const dbTLN = carregarListaNegra();
            dbTLN[from] = dbTLN[from] || [];
            if (!dbTLN[from].includes(numTirar)) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐍𝐀̃𝐎 𝐄𝐒𝐓𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀 ⚠️ 〕━━━╮\n┃\n┃ 📱 Número: *' + numTirar + '*\n┃\n┃ ❌ Não tá na lista negra!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); return }
            // ═══ Remove o número E todos os LIDs/variações ligados a ele ═══
            const antesTLN = dbTLN[from].length;
            dbTLN[from] = dbTLN[from].filter(n => {
              // mantém se NÃO for o número direto
              if (n === numTirar) return false;
              // remove também se um termina com o outro (variações)
              if (n.endsWith(numTirar) || numTirar.endsWith(n)) return false;
              return true;
            });
            // ═══ Procura o LID da pessoa no grupo e remove também ═══
            try {
              for (const part of gmTLN.participants) {
                const pnum = limparNumero((part.phoneNumber || part.id || '').split('@')[0]);
                if (pnum === numTirar) {
                  const lidPart = part.lid || (part.id && part.id.endsWith('@lid') ? part.id : null);
                  if (lidPart) {
                    const lidLimpo = limparNumero(lidPart.split('@')[0]);
                    dbTLN[from] = dbTLN[from].filter(n => n !== lidLimpo);
                    console.log('[LN] LID removido:', lidLimpo);
                  }
                }
              }
            } catch (e) {}
            const removidos = antesTLN - dbTLN[from].length;
            console.log('[LN] Removidos', removidos, 'registros');
            salvarListaNegra(dbTLN);
            const agoraTLN = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐑𝐄𝐌𝐎𝐕𝐈𝐃𝐎 ✅ 〕━━━╮\n┃\n┃ ✅ Número removido!\n┃\n┃ 📱 Número: *' + numTirar + '*\n┃ 👮 Por: @' + sender.split('@')[0] + '\n┃ 📅 Data: ' + agoraTLN + '\n┃\n┃ 💜 Agora pode entrar no grupo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
