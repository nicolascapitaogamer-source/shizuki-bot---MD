// Gerado de index.js (case 'ranklinda', linha 7916)
export default {
  nomes: ["ranklinda","ranklindo","rankbebado","rankfiel","rankputa","rankgay","rankcorno","rankotaku","rankpobre","rankrico","rankfeio","rankgostosa","rankgostoso","rankgado","rankpau","rankbct"],
  async executar(__x) {
    const { carregarConfig, RANKS_CONFIG, embaralhar, barraRank, fs, command, sock, from, msg, isGroup } = Object.assign({}, __x.utils, __x);
    {
{
            const cfgR = carregarConfig();
            const infoR = RANKS_CONFIG[command];
            if (!infoR) {
              await sock.sendMessage(from, { text: '❌ Rank inválido!' }, { quoted: msg });
              return
            }
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Esse comando só funciona em grupo!' }, { quoted: msg });
              return
            }
            try {
              const gmR = await globalThis.__getGroupMetadata(from);
              const membrosR = gmR.participants.filter(p => p.id !== sock.user?.id);
              if (membrosR.length < 2) {
                await sock.sendMessage(from, { text: '❌ Poucos membros pra fazer o ranking!' }, { quoted: msg });
                return
              }
              const qtdR = 5 + Math.floor(Math.random() * 2);
              const escolhidos = embaralhar(membrosR).slice(0, Math.min(qtdR, membrosR.length));

              let textoR = `${infoR.topo}\n\n`;
              textoR += `📁 *Grupo:* ${gmR.subject}\n\n`;
              textoR += '━━━━━━━━━━━━━━━━━\n\n';

              const mentionsR = [];
              const numerosR = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
              escolhidos.forEach((m, i) => {
                const pct = Math.floor(Math.random() * 101);
                const jidR = m.id;
                mentionsR.push(jidR);
                textoR += `${numerosR[i]} @${jidR.split('@')[0]}\n`;
                textoR += `   ▓${barraRank(pct)}░ ${pct}%\n\n`;
              });

              textoR += '━━━━━━━━━━━━━━━━━\n\n';
              textoR += `💬 _${infoR.frase}_\n\n`;
              textoR += '🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸';

              // ═══ Usa imagem local do rank ═══
              const pastaRank = './rank_imagens';
              let arquivoRank = null;
              if (fs.existsSync(pastaRank)) {
                const jpg = `${pastaRank}/${command}.jpg`;
                const mp4 = `${pastaRank}/${command}.mp4`;
                if (fs.existsSync(mp4)) arquivoRank = mp4;
                else if (fs.existsSync(jpg)) arquivoRank = jpg;
              }

              if (arquivoRank && arquivoRank.endsWith('.mp4')) {
                try {
                  await sock.sendMessage(from, { video: fs.readFileSync(arquivoRank), gifPlayback: true, caption: textoR, mentions: mentionsR }, { quoted: msg });
                } catch (e) {
                  await sock.sendMessage(from, { text: textoR, mentions: mentionsR }, { quoted: msg });
                }
              } else if (arquivoRank && arquivoRank.endsWith('.jpg')) {
                try {
                  await sock.sendMessage(from, { image: fs.readFileSync(arquivoRank), caption: textoR, mentions: mentionsR }, { quoted: msg });
                } catch (e) {
                  await sock.sendMessage(from, { text: textoR, mentions: mentionsR }, { quoted: msg });
                }
              } else {
                await sock.sendMessage(from, { text: textoR, mentions: mentionsR }, { quoted: msg });
              }
            } catch (errR) {
              console.error('Erro rank:', errR.message);
              await sock.sendMessage(from, { text: '❌ Erro ao fazer o ranking!' }, { quoted: msg });
            }
          }
          return
    }
  }
};
