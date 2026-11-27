// Gerado de index.js (case 'rmaluguel', linha 12016)
export default {
  nomes: ["rmaluguel"],
  async executar(__x) {
    const { carregarJSON, FILE_ALUGUEIS, salvarJSON, isDono, sock, from, msg, args, isGroup } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }

            const linkOuJid = args[0] || (isGroup ? from : null);
            if (!linkOuJid) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!rmaluguel <link do grupo>* ou dentro do grupo para remover.' }, { quoted: msg });
              return
            }

            const alugueisRm = carregarJSON(FILE_ALUGUEIS);
            let removido = false;

            for (const chave in alugueisRm) {
              const dados = alugueisRm[chave];
              if (chave === linkOuJid || (dados.link && dados.link === linkOuJid) || (dados.link && dados.link.includes(linkOuJid))) {
                delete alugueisRm[chave];
                removido = true;
                break;
              }
            }

            if (!removido) {
              await sock.sendMessage(from, { text: '❌ Nenhum aluguel encontrado com esse link.' }, { quoted: msg });
              return
            }

            salvarJSON(FILE_ALUGUEIS, alugueisRm);
            await sock.sendMessage(from, { text: `🗑️ Aluguel do grupo removido com sucesso!` }, { quoted: msg });
          }
          return
    }
  }
};
