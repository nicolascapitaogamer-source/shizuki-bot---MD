export default {
  nomes: ['pingnovo'],
  async executar({ sock, from, msg }) {
    await sock.sendMessage(from, { text: '✅ Carregador funcionando! (comandos/membros/pingnovo.js)' }, { quoted: msg });
  }
};
