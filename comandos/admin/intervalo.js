// Gerado de index.js (case 'intervalo', linha 8401)
export default {
  nomes: ["intervalo"],
  async executar(__x) {
    const { getAdminFlag, carregarJSON, FILE_INTERVALO, salvarJSON, isGroup, sock, from, msg, sender, isDono, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isGroup) {
              await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg });
              return
            }
            const gmInt = await globalThis.__getGroupMetadata(from);
            const ehAdmInt = !!getAdminFlag(gmInt.participants, sender);
            if (!ehAdmInt && !isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas admins, líderes e o dono podem configurar o intervalo!' }, { quoted: msg });
              return
            }

            const tempoStr = args[0];
            const tempoNum = parseInt(tempoStr, 10);

            if (!tempoStr || isNaN(tempoNum) || tempoNum < 5 || tempoNum > 300) {
              await sock.sendMessage(from, {
                text: '╭━━━〔 ⚠️ 𝐂𝐎𝐌𝐎 𝐔𝐒𝐀𝐑 ⚠️ 〕━━━╮\n┃\n┃ 🛑 Você esqueceu o tempo ou é inválido!\n┃\n┃ 📝 Use: *!intervalo <segundos>*\n┃ 💡 Ex: *!intervalo 30*\n┃ ⚠️ Mínimo: 5s | Máximo: 300s\n┃\n╰━━━━━━━━━━━━━━━━━━━╯\n\n🌸 Shizuki Bot - MD 🌸'
              }, { quoted: msg });
              return
            }

            const dbInt = carregarJSON(FILE_INTERVALO);
            dbInt[from] = tempoNum;
            salvarJSON(FILE_INTERVALO, dbInt);

            await sock.sendMessage(from, {
              text: `╭━━━〔 ✅ 𝐈𝐍𝐓𝐄𝐑𝐕𝐀𝐋𝐎 𝐀𝐓𝐔𝐀𝐋𝐈𝐙𝐀𝐃𝐎 ✅ 〕━━━╮\n┃\n┃ ⏰ Tempo definido: *${tempoNum} segundos*\n┃\n┃ 💡 Se o grupo mandar comandos rápido\n┃    demais, o bot pausa por esse tempo.\n┃\n╰━━━━━━━━━━━━━━━━━━━╯\n\n🌸 Shizuki Bot - MD 🌸`
            }, { quoted: msg });
          }
          return
    }
  }
};
