// Gerado de index.js (case 'addlistanegra', linha 14909)
export default {
  nomes: ["addlistanegra"],
  async executar(__x) {
    const { getAdminFlag, limparNumero, carregarListaNegra, salvarListaNegra, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const gmALN = await globalThis.__getGroupMetadata(from);
            const ehAdmALN = !!getAdminFlag(gmALN.participants, sender);
            if (!ehAdmALN && !isDono) { await sock.sendMessage(from, { text: '╭━━━〔 🚫 𝐒𝐄𝐌 𝐏𝐄𝐑𝐌𝐈𝐒𝐒𝐀̃𝐎 🚫 〕━━━╮\n┃\n┃ ❌ Apenas *admins*, *líderes*\n┃    e o *dono* podem usar!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); return }
            const numAdd = limparNumero(args[0]);
            if (!numAdd || numAdd.length < 10) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 ⚠️ 〕━━━╮\n┃\n┃ ❌ Informe o número!\n┃\n┃ 💡 Use: *!addlistanegra <numero>*\n┃ 📝 Ex: *!addlistanegra 5511999999999*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); return }
            const dbLN = carregarListaNegra();
            dbLN[from] = dbLN[from] || [];
            if (dbLN[from].includes(numAdd)) { await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐉𝐀́ 𝐄𝐒𝐓𝐀́ 𝐍𝐀 𝐋𝐈𝐒𝐓𝐀 ⚠️ 〕━━━╮\n┃\n┃ 📱 Número: *' + numAdd + '*\n┃\n┃ ❌ Já tá na lista negra!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg }); return }
            dbLN[from].push(numAdd);
            salvarListaNegra(dbLN);
            const agoraLN = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
            // ─── Verifica se já tá no grupo e bane ───
            const membroNoGrupo = gmALN.participants.find(p => {
              const pnum = limparNumero(p.id.split('@')[0]);
              return pnum === numAdd || pnum.endsWith(numAdd) || numAdd.endsWith(pnum);
            });
            // ═══ Guarda também o LID (se houver) pra detectar entrada depois ═══
            for (const part of gmALN.participants) {
              const pnum = limparNumero((part.phoneNumber || part.id || '').split('@')[0]);
              if (pnum === numAdd) {
                const lidPart = part.lid || (part.id && part.id.endsWith('@lid') ? part.id : null);
                if (lidPart) {
                  const lidLimpo = limparNumero(lidPart.split('@')[0]);
                  if (lidLimpo && !dbLN[from].includes(lidLimpo)) {
                    dbLN[from].push(lidLimpo);
                    salvarListaNegra(dbLN);
                    console.log('[LN] LID guardado:', lidLimpo);
                  }
                }
              }
            }
            if (membroNoGrupo) {
              try {
                await sock.groupParticipantsUpdate(from, [membroNoGrupo.id], 'remove');
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🚨 𝐁𝐀𝐍𝐈𝐃𝐎 🚨 〕━━━╮\n┃\n┃ 💀 @' + membroNoGrupo.id.split('@')[0] + ', seu arrombado!\n┃\n┃ 📱 Número: *' + numAdd + '*\n┃ ⚠️ Foi adicionado à lista negra!\n┃\n┃ 🖕 VAI TOMAR NO CU, FILHO DA PUTA!\n┃ 🚫 Aqui não é teu lugar, desgraçado!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [membroNoGrupo.id]
                }, { quoted: msg });
                return
              } catch (e) {
                console.error('Erro ao banir membro:', e.message);
              }
            }
            await sock.sendMessage(from, {
              text: '╭━━━〔 🚫 𝐀𝐃𝐈𝐂𝐈𝐎𝐍𝐀𝐃𝐎 🚫 〕━━━╮\n┃\n┃ ✅ Número adicionado!\n┃\n┃ 📱 Número: *' + numAdd + '*\n┃ 👮 Por: @' + sender.split('@')[0] + '\n┃ 📅 Data: ' + agoraLN + '\n┃\n┃ ⚠️ Se esse número tentar entrar\n┃    no grupo, será banido!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
