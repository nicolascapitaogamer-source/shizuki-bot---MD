// Gerado de index.js (case 'nick', linha 15025)
export default {
  nomes: ["nick"],
  async executar(__x) {
    const { nicksList, nicksAtivos, args, sock, from, msg, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const textoNick = args.join(' ').trim();
            if (!textoNick) {
              await sock.sendMessage(from, { text: '⚠️ Use: !nick <seu texto>\nEx: !nick nick dev' }, { quoted: msg });
              return
            }

            let menuNick = `╭━━━〔 💜 𝐍𝐈𝐂𝐊 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐎𝐑 〕━━━╮\n┃\n┃ 👤 Solicitado por: @${sender.split('@')[0]}\n┃ 📝 Nome base: ${textoNick}\n┃\n┃ 🔹 Copie o estilo que mais gostar:\n┃\n`;
            for (let i = 0; i < nicksList.length; i++) {
              const num = String(i + 1).padStart(2, "0");
              menuNick += `┃ ${num}. ➤ ${nicksList[i](textoNick)}\n`;
            }
            menuNick += `┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n💡 *Responda esta mensagem com o número do estilo desejado.*\n\n🌸 𝑺𝒉𝒊𝒛𝒖𝒌𝒊 𝑩𝒐𝒕 - 𝑴𝑫 🌸`;

            const msgEnviada = await sock.sendMessage(from, { text: menuNick, mentions: [sender] }, { quoted: msg });
            
            if (msgEnviada && msgEnviada.key) {
              nicksAtivos.set(msgEnviada.key.id, { texto: textoNick });
              setTimeout(() => nicksAtivos.delete(msgEnviada.key.id), 5 * 60 * 1000);
            }
          }
          return
    }
  }
};
