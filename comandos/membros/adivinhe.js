// Gerado de index.js (case 'adivinhe', linha 12738)
export default {
  nomes: ["adivinhe"],
  async executar(__x) {
    const { carregarJSON, FILE_JOGOS, salvarJSON, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const perguntasAnime = [
              { pergunta: "Quem tem cabelo verde no anime One Piece?", resposta: "Zoro" },
              { pergunta: "Qual o nome do protagonista de Naruto?", resposta: "Naruto" },
              { pergunta: "Quem é o capitão dos Piratas do Chapéu de Palha em One Piece?", resposta: "Luffy" },
              { pergunta: "Qual o nome do ninja copiador do time 7 em Naruto?", resposta: "Kakashi" },
              { pergunta: "Quem usa uma espada e é o espadachim mais forte do mundo em One Piece?", resposta: "Mihawk" },
              { pergunta: "Qual o nome do Saiyajin criado na Terra que adora comer em Dragon Ball?", resposta: "Goku" },
              { pergunta: "Quem tem o braço elástico e quer ser o Rei dos Piratas?", resposta: "Luffy" },
              { pergunta: "Qual é o pilar da chama no anime Demon Slayer?", resposta: "Rengoku" },
              { pergunta: "Qual personagem de Death Note escreve nomes num caderno?", resposta: "Light Yagami" }
            ];

            const desafioSorteado = perguntasAnime[Math.floor(Math.random() * perguntasAnime.length)];

            const textoAdivinhe = 
              `🤔 *JOGO DA ADIVINHAÇÃO* 🔮\n\n` +
              `💬 ${desafioSorteado.pergunta}\n\n` +
              `✨ *Responda apenas marcando esta mensagem com o seu palpite (sem usar comandos/prefixo)!*`;

            const sentMsg = await sock.sendMessage(from, { text: textoAdivinhe }, { quoted: msg });

            if (sentMsg && sentMsg.key) {
              let jogos = carregarJSON(FILE_JOGOS);
              jogos[from] = {
                stanzaId: sentMsg.key.id,
                resposta: desafioSorteado.resposta
              };
              salvarJSON(FILE_JOGOS, jogos);
            }
          }
          return
    }
  }
};
