// Gerado de index.js (case 'empregos', linha 6866)
export default {
  nomes: ["empregos"],
  async executar(__x) {
    const { textoListaEmpregos, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            await sock.sendMessage(from, { text: textoListaEmpregos() }, { quoted: msg });
          }
          return
    }
  }
};
