// Gerado de index.js (case 'modoaluguel', linha 11954)
export default {
  nomes: ["modoaluguel"],
  async executar(__x) {
    const { salvarConfig, isDono, sock, from, msg, config } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }
            config.modoAluguel = !config.modoAluguel;
            salvarConfig(config);
            if (config.modoAluguel) {
              await sock.sendMessage(from, { text: '💼 *Modo aluguel ATIVADO!*\n\nAgora só grupos com aluguel ativo podem usar o bot. O dono e os líderes sempre podem.\n\nUse !rgaluguel [dias] dentro do grupo para registrar.' }, { quoted: msg });
            } else {
              await sock.sendMessage(from, { text: '🔓 *Modo aluguel DESATIVADO!*\n\nTodos os grupos podem usar o bot novamente.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
