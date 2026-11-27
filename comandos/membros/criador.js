// Gerado de index.js (case 'criador', linha 11054)
export default {
  nomes: ["criador","owner"],
  async executar(__x) {
    const { NUMERO_CRIADOR, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
await sock.sendMessage(from, { text: `Aqui esta o contato do meu criador! 😍 https://wa.me/${NUMERO_CRIADOR}` }, { quoted: msg });
          return
    }
  }
};
