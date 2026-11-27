// Gerado de index.js (case 'shizukicity', linha 14060)
export default {
  nomes: ["shizukicity"],
  async executar(__x) {
    const { shizukiUser, textoShizukiCity, sender, pushName, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const uS = shizukiUser(sender);
            const texto = textoShizukiCity(uS, sender, pushName);
            await sock.sendMessage(from, { text: texto, mentions: [sender] }, { quoted: msg });
          }
          return
    }
  }
};
