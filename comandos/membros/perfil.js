// Gerado de index.js (case 'perfil', linha 11114)
export default {
  nomes: ["perfil"],
  async executar(__x) {
    const { eVIP, badgeVip, carregarJSON, FILE_STATS, FILE_SHIZUKI, formatarReais, msg, sender, isGroup, from, config, isDonoReal, sock } = Object.assign({}, __x.utils, __x);
    {
{
            let alvo = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                       msg.message.extendedTextMessage?.contextInfo?.participant ||
                       sender;

            let numeroFormatado = alvo.split('@')[0].replace(/[^0-9]/g, '');

            if (!numeroFormatado || numeroFormatado.length < 5) {
              alvo = sender;
              numeroFormatado = sender.split('@')[0].replace(/[^0-9]/g, '');
            }

            let numeroReal = numeroFormatado;
            let isAdminGrupo = '❌';
            let isLiderGrupo = '❌';

            if (isGroup) {
              try {
                const groupMetadata = await globalThis.__getGroupMetadata(from);
                const participants = groupMetadata.participants;
                const participanteAlvo = participants.find(p => p.id === alvo || p.id.includes(numeroFormatado));
                if (participanteAlvo) {
                  const pn = participanteAlvo.phoneNumber || participanteAlvo.jid;
                  if (pn && pn.includes('@s.whatsapp.net')) numeroReal = pn.split('@')[0].replace(/[^0-9]/g, '');
                  if (participanteAlvo.admin === 'admin' || participanteAlvo.admin === 'superadmin') isAdminGrupo = '✅';
                  if (participanteAlvo.admin === 'superadmin') isLiderGrupo = '✅';
                }
              } catch (e) {}
            }

            const donoAlvoLimpo = String(config.numeroDono).replace(/[^0-9]/g, '');
            const isDonoAlvo = (typeof isDonoReal !== 'undefined' && alvo === sender ? isDonoReal : false) || numeroFormatado === donoAlvoLimpo || alvo === config.numeroDono;
            const isVipAlvo = (typeof eVIP === 'function' && eVIP(alvo)) || (typeof badgeVip === 'function' && badgeVip(alvo));

            const statusDono = isDonoAlvo ? '🟢' : '🔴';
            const statusLider = isLiderGrupo === '✅' ? '🟢' : '🔴';
            const statusAdm = isAdminGrupo === '✅' ? '🟢' : '🔴';
            const statusVip = isVipAlvo ? '🟢' : '🔴';
            const badgeVipTxt = isVipAlvo ? ' 💎 VIP' : '';

            let stats = carregarJSON(FILE_STATS);
            let dadosAlvo = stats[alvo] || stats[alvo.split('@')[0] + '@s.whatsapp.net'] || { mensagens: 0, comandos: 0, stickers: 0 };
            
            const dbShizuki = carregarJSON(FILE_SHIZUKI);
            const dadosShizuki = dbShizuki[alvo] || dbShizuki[alvo.split('@')[0] + '@s.whatsapp.net'] || { reais: 20, casado: null, namorando: null };
            const saldoReal = formatarReais(dadosShizuki.reais || 0);
            const statusCasado = dadosShizuki.casado ? 'Sim 💍' : (dadosShizuki.namorando ? 'Namorando 💜' : 'Não 😿');

            let hashNum = Number(numeroFormatado.slice(-3)) || 50;
            let nivelGado = (hashNum * 7) % 101;
            let nivelPuta = (hashNum * 13) % 101;
            let nivelGostosura = ((hashNum * 17) % 60) + 40;
            let nivelBeleza = ((hashNum * 19) % 50) + 50;
            let valorPrograma = nivelGostosura * 45;

            const textoPerfil =
              `╔═══━━━─── ◈ ───━━━═══╗\n` +
              `   🌸 𝐌𝐄𝐔 𝐏𝐄𝐑𝐅𝐈𝐋 🌸\n` +
              `╚═══━━━─── ◈ ───━━━═══╝\n\n` +
              `╭───〔 🪪 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐂̧𝐎̃𝐄𝐒 〕───╮\n` +
              `│\n` +
              `│  🕶️ 𝐍𝐨𝐦𝐞 ➜ 『 @${alvo.split('@')[0]}${badgeVipTxt} 』\n` +
              `│  ☎️ 𝐍𝐮́𝐦𝐞𝐫𝐨 ➜ 『 +${numeroReal} 』\n` +
              `│  📝 𝐁𝐢𝐨 ➜ 『 Sem Bio 』\n` +
              `│  💻 𝐂𝐨𝐧𝐞𝐜𝐭𝐚𝐝𝐨 𝐞𝐦 ➜ 『 Android 』\n` +
              `│\n` +
              `├─────────────── ◈\n` +
              `│\n` +
              `│  ♛ 𝐃𝐨𝐧𝐨 ➜ 〘 ${statusDono} 〙\n` +
              `│  ⚔️ 𝐋𝐢́𝐝𝐞𝐫 ➜ 〘 ${statusLider} 〙\n` +
              `│  🛡️ 𝐀𝐝𝐦 ➜ 〘 ${statusAdm} 〙\n` +
              `│  💎 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 ➜ 〘 ${statusVip} 〙\n` +
              `│  🪙 𝐒𝐚𝐥𝐝𝐨 ➜ 〘 ${saldoReal} 〙\n` +
              `│  💍 𝐂𝐚𝐬𝐚𝐝𝐨 ➜ 〘 ${statusCasado} 〙\n` +
              `│\n` +
              `╰───────────────────╯\n\n` +
              `╔═══━━━─── ◈ ───━━━═══╗\n` +
              `   🌸 𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋𝐈𝐃𝐀𝐃𝐄 🌸\n` +
              `╚═══━━━─── ◈ ───━━━═══╝\n\n` +
              `╭───〔 📊 𝐒𝐓𝐀𝐓𝐔𝐒 〕───╮\n` +
              `│\n` +
              `│  🐃 𝐍𝐢́𝐯𝐞𝐥 𝐆𝐚𝐝𝐨 ➜ ${nivelGado}%\n` +
              `│  🌺 𝐍𝐢́𝐯𝐞𝐥 𝐏𝐮𝐭𝐚 ➜ ${nivelPuta}%\n` +
              `│  🌶 𝐍𝐢́𝐯𝐞𝐥 𝐆𝐨𝐱𝐭𝐨𝐬𝐮𝐫𝐚 ➜ ${nivelGostosura}%\n` +
              `│  🪞 𝐍𝐢́𝐯𝐞𝐥 𝐁𝐞𝐥𝐞𝐳𝐚 ➜ ${nivelBeleza}%\n` +
              `│  💵 𝐏𝐫𝐨𝐠𝐫𝐚𝐦𝐚 ➜ ${formatarReais(valorPrograma)}\n` +
              `│\n` +
              `╰───────────────────╯\n\n` +
              `╔═══━━━─── ◈ ───━━━═══╗\n` +
              `   🌸 𝐒𝐄𝐔𝐒 𝐃𝐀𝐃𝐎𝐒 🌸\n` +
              `╚═══━━━─── ◈ ───━━━═══╝\n\n` +
              `╭───〔 📌 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕───╮\n` +
              `│\n` +
              `│  🗨 𝐌𝐞𝐧𝐬𝐚𝐠𝐞𝐧𝐬 ➜ ${dadosAlvo.mensagens || 0}\n` +
              `│  ⚙ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 ➜ ${dadosAlvo.comandos || 0}\n` +
              `│  🖼️ 𝐒𝐭𝐢𝐜𝐤𝐞𝐫𝐬 ➜ ${dadosAlvo.stickers || 0}\n` +
              `│\n` +
              `╰───────────────────╯\n\n` +
              `╭━━━━━━━━━━━━━━━━━━╮\n` +
              `┃ 🌸 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 𝐁𝐎𝐓 - 𝐌𝐃 🌸 ┃\n` +
              `╰━━━━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(from, { text: textoPerfil, mentions: [alvo] }, { quoted: msg });
          }
          return
    }
  }
};
