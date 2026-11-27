// Gerado de index.js (case 'promocao', linha 10059)
export default {
  nomes: ["promocao","promoção"],
  async executar(__x) {
    const { shizukiUser, acharEmprego, SHIZUKI_DATA, salvarShizuki, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.emprego) { await sock.sendMessage(from, { text: '❌ Você está desempregado!' }, { quoted: msg }); return }
            const empAtual = acharEmprego(u.emprego);
            if (!empAtual) { await sock.sendMessage(from, { text: '❌ Emprego inválido!' }, { quoted: msg }); return }
            if ((u.totalTrabalhos || 0) < 20) {
              await sock.sendMessage(from, { text: `📊 Você precisa trabalhar *20 vezes* para pedir promoção!\n\n💼 Trabalhos feitos: *${u.totalTrabalhos || 0}/20*` }, { quoted: msg });
              return
            }
            if (Math.random() > 0.3) {
              await sock.sendMessage(from, {
                text: `╭━━━〔 📉 𝐒𝐄𝐌 𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 💔 Seu chefe negou o pedido...\n┃\n┃ 💡 Trabalhe mais e tente\n┃    de novo!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
              return
            }
            // Promove para próximo nível
            const proximo = SHIZUKI_DATA.empregos.find(e => e.nivel > empAtual.nivel);
            if (!proximo) { await sock.sendMessage(from, { text: '👑 Você já tá no topo! Não tem mais promoção.' }, { quoted: msg }); return }
            u.emprego = proximo.id;
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╭━━━〔 📈 𝐏𝐑𝐎𝐌𝐎𝐂̧𝐀̃𝐎! 〕━━━╮\n┃\n┃ 💜 Parabéns, @${sender.split('@')[0]}!\n┃\n┃ 🎉 Você foi promovido(a)!\n┃\n┃ 📊 Antes: *${empAtual.nome}*\n┃ 📊 Agora: *${proximo.nome}* ${proximo.emoji}\n┃\n┃ 💰 Novo salário: *R$ ${proximo.salarioMin}-${proximo.salarioMax}*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
