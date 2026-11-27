// Gerado de index.js (case 'alugueis', linha 12052)
export default {
  nomes: ["alugueis","aluguéis"],
  async executar(__x) {
    const { carregarJSON, FILE_ALUGUEIS, dataAlug, formatarDataBR, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }
            const alugueis = carregarJSON(FILE_ALUGUEIS);
            const entradas = Object.entries(alugueis);
            
            if (entradas.length === 0) {
              await sock.sendMessage(from, { text: '╭━━━〔 💼 𝐆𝐑𝐔𝐏𝐎𝐒 𝐀𝐋𝐔𝐆𝐀𝐃𝐎𝐒 〕━━━╮\n┃\n┃ 😴 *Nenhum grupo alugado no momento.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              return
            }

            let ativos = 0;
            let expirados = 0;
            let lista = '';

            entradas.forEach(([jid, dados], i) => {
              const expirado = dados.expira < dataAlug(0);
              if (expirado) expirados++; else ativos++;

              const emoji = expirado ? '🔴' : '🟢';
              lista += `┃\n┃ ${emoji} *${i + 1}. ${dados.nome || 'Sem nome'}*\n`;
              lista += `┃ 📅 Alugou: ${formatarDataBR(dados.inicio)}\n`;
              lista += `┃ ⏳ Expira: ${formatarDataBR(dados.expira)} ${expirado ? '(Expirado)' : ''}\n`;
              lista += `┃ 🔗 ${dados.link || 'Indisponível'}\n`;
              if (i < entradas.length - 1) lista += `┃\n┃ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n`;
            });

            await sock.sendMessage(from, {
              text: `╭━━━〔 💼 𝐆𝐑𝐔𝐏𝐎𝐒 𝐀𝐋𝐔𝐆𝐀𝐃𝐎𝐒 〕━━━╮\n┃\n┃ 📊 *Total:* ${entradas.length} grupos\n┃ 🟢 *Ativos:* ${ativos}\n┃ 🔴 *Expirados:* ${expirados}\n┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n${lista}┃\n┃ ━━━━━━━━━━━━━━━━━━━━━━━━\n┃\n┃ 💡 *Use !rmaluguel <link>* \n┃ *para remover um grupo.*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯`
            }, { quoted: msg });
          }
          return
    }
  }
};
