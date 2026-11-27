// Gerado de index.js (case 'porcentagem', linha 7485)
export default {
  nomes: ["porcentagem"],
  async executar(__x) {
    const { textoPorcentagem, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            await sock.sendMessage(from, { text: textoPorcentagem() }, { quoted: msg });
          }
          return
    }
  }
};
