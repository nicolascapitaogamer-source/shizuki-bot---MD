// Gerado de index.js (case 'ranklouco', linha 8583)
export default {
  nomes: ["ranklouco"],
  async executar(__x) {
    const { embaralhar, barraRank, enviarRankComGif, isGroup, sock, from, msg, command } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            try {
              const gmR = await globalThis.__getGroupMetadata(from);
              const membrosR = gmR.participants.filter(p => p.id !== sock.user?.id);
              if (membrosR.length < 2) { await sock.sendMessage(from, { text: '❌ Poucos membros!' }, { quoted: msg }); return }
              const qtdR = 5 + Math.floor(Math.random() * 2);
              const escolhidos = embaralhar(membrosR).slice(0, Math.min(qtdR, membrosR.length));
              let textoR = '🤯 OS MAIS LOUCOS DO GRUPO SÃO ESSES 🤯\n\n📁 *Grupo:* ' + gmR.subject + '\n\n━━━━━━━━━━━━━━━━━\n\n';
              const mentionsR = [];
              const numerosR = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣'];
              escolhidos.forEach((m, i) => {
                const pct = Math.floor(Math.random() * 101);
                const jidR = m.id;
                mentionsR.push(jidR);
                textoR += numerosR[i] + ' @' + jidR.split('@')[0] + '\n   ▓' + barraRank(pct) + '░ ' + pct + '%\n\n';
              });
              textoR += '━━━━━━━━━━━━━━━━━\n\n💬 _🤯 Esse aí fugiu do hospício e veio parar aqui!_\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸';
              await enviarRankComGif(sock, from, command, textoR, mentionsR, msg);
            } catch (errR) { console.error('Erro rank:', errR.message); await sock.sendMessage(from, { text: '❌ Erro!' }, { quoted: msg }); }
          }
          return
    }
  }
};
