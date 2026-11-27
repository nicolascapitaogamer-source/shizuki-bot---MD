// Gerado de index.js (case 'meusveiculos', linha 10566)
export default {
  nomes: ["meusveiculos","meuscarros"],
  async executar(__x) {
    const { shizukiUser, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const meus = (u.itens || []).filter(x => typeof x === 'object' && x.vida !== undefined);
            if (!meus.length) {
              await sock.sendMessage(from, {
                text: `╔══════════════════════════════╗\n║  🚗 𝐌𝐄𝐔𝐒 𝐕𝐄𝐈́𝐂𝐔𝐋𝐎𝐒  🚗  ║\n╚══════════════════════════════╝\n\n📭 Você ainda não tem nenhum veículo!\n\n💡 Compre em: *!comprarloja*\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`
              }, { quoted: msg });
              return
            }
            let txt = `╔══════════════════════════════╗\n║  🚗 𝐌𝐄𝐔𝐒 𝐕𝐄𝐈́𝐂𝐔𝐋𝐎𝐒  🚗  ║\n╚══════════════════════════════╝\n\n`;
            meus.forEach(v => {
              const cheios = Math.round(v.vida / 10);
              const barra = '▓'.repeat(cheios) + '░'.repeat(10 - cheios);
              let status = '✅ Em perfeito estado';
              if (v.vida <= 0) status = '💀 QUEBRADO (arrume!)';
              else if (v.vida < 30) status = '⚠️ Muito desgastado';
              else if (v.vida < 60) status = '🟡 Precisa de revisão';
              txt += `${v.emoji} *${v.nome}*\n`;
              txt += `   🔋 ${barra} ${v.vida}%\n`;
              txt += `   ${status}\n\n`;
            });
            txt += `💡 Use: *!arrumar <nome>* pra consertar\n`;
            txt += `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`;
            await sock.sendMessage(from, { text: txt }, { quoted: msg });
          }
          return
    }
  }
};
