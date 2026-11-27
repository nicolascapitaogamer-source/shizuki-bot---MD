// Gerado de index.js (case 'participar', linha 5297)
export default {
  nomes: ["participar"],
  async executar(__x) {
    const { shizukiUser, carregarJSON, salvarJSON, salvarShizuki, sender, from, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const db = carregarJSON('./shizuki_eventos.json');
            const evAtivo = db[from];
            
            if (!evAtivo || !evAtivo.ativo) {
              await sock.sendMessage(from, { text: '❌ Não tem nenhum evento rolando agora!' }, { quoted: msg });
              return
            }
            
            if (evAtivo.participantes && evAtivo.participantes.includes(sender)) {
              await sock.sendMessage(from, { text: '⚠️ Você já participou desse evento!' }, { quoted: msg });
              return
            }
            
            const custo = evAtivo.ultimoEventoCusto || 0;
            if (custo > 0 && u.reais < custo) {
              await sock.sendMessage(from, { text: `💸 Você precisa de R$ ${custo},00 pra participar desse evento!` }, { quoted: msg });
              return
            }
            
            if (custo > 0) u.reais -= custo;
            if (!evAtivo.participantes) evAtivo.participantes = [];
            evAtivo.participantes.push(sender);
            salvarJSON('./shizuki_eventos.json', db);
            
            const nomeEvento = evAtivo.ultimoEventoNome || '';
            let historia = '';
            let recompensaTexto = '';
            
            if (nomeEvento.includes('PIJAMA')) {
              u.energia = Math.min(100, u.energia + 20);
              historia = 'A galera se juntou pra ver filme de terror.\nVocê comeu pipoca até não poder mais e dormiu no sofá!';
              recompensaTexto = '⚡ Você ganhou *+20 Energia*!';
            } else if (nomeEvento.includes('CASA DO AMIGO')) {
              u.reais += 40;
              historia = 'A festa na laje tava bombando!\nVocê ajudou a assar a carne e ganhou uns trocados pelo trabalho.';
              recompensaTexto = '💰 Você ganhou *R$ 40,00*!';
            } else if (nomeEvento.includes('CHURRASCO')) {
              u.reais += 100;
              historia = 'O churrasco tava divino!\nVocê comeu picanha, tomou uma gelada e ainda sobrou dinheiro do rateio.';
              recompensaTexto = '💰 Você ganhou *R$ 100,00*!';
            } else if (nomeEvento.includes('ANIVERSÁRIO')) {
              u.reais += 50;
              historia = 'A festa de aniversário tava linda!\nVocê cantou parabéns, comeu bolo e ganhou R$ 50 de lembrancinha.';
              recompensaTexto = '💰 Você ganhou *R$ 50,00*!';
            } else if (nomeEvento.includes('HAPPY HOUR')) {
              u.reais += 130;
              historia = 'O happy hour com a galera do trabalho foi épico!\nVocê bebeu, riu e ainda ganhou R$ 130 numa aposta.';
              recompensaTexto = '💰 Você ganhou *R$ 130,00*!';
            } else if (nomeEvento.includes('KARAOKÊ')) {
              u.reais += 70;
              historia = 'Você soltou a voz no karaokê e arrasou!\nO pessoal gostou tanto que te deu R$ 70 de gorjeta.';
              recompensaTexto = '💰 Você ganhou *R$ 70,00*!';
            } else if (nomeEvento.includes('CINEMA')) {
              u.energia = Math.min(100, u.energia + 15); u.reais += 30;
              historia = 'A sessão pipoca foi ótima!\nVocê relaxou, comeu pipoca e ganhou R$ 30 de troco.';
              recompensaTexto = '⚡ Você ganhou *+15 Energia* e *R$ 30*!';
            } else if (nomeEvento.includes('SHOPPING')) {
              u.reais += 45;
              historia = 'Você foi ao shopping e achou uma promoção incrível!\nGastou pouco e ganhou R$ 45 de cashback.';
              recompensaTexto = '💰 Você ganhou *R$ 45,00*!';
            } else if (nomeEvento.includes('ARTE')) {
              u.reais += 35;
              historia = 'A exposição de arte tava maravilhosa!\nVocê comprou um quadro baratinho e revendeu por R$ 35 de lucro.';
              recompensaTexto = '💰 Você ganhou *R$ 35,00*!';
            } else if (nomeEvento.includes('LIVRO')) {
              u.reais += 30;
              historia = 'A feira do livro tava cheia!\nVocê encontrou um livro raro e ganhou R$ 30 só pela história.';
              recompensaTexto = '💰 Você ganhou *R$ 30,00*!';
            } else if (nomeEvento.includes('FEIRA LIVRE')) {
              u.reais += 40;
              historia = 'A feirinha da madrugada tava agitada!\nVocê vendeu umas coisas e embolsou R$ 40.';
              recompensaTexto = '💰 Você ganhou *R$ 40,00*!';
            } else if (nomeEvento.includes('HALLOWEEN')) {
              u.reais += 80;
              historia = 'O Halloween foi assustador!\nVocê coletou doces pra caramba e vendeu tudo por R$ 80.';
              recompensaTexto = '💰 Você ganhou *R$ 80,00*!';
            } else if (nomeEvento.includes('NATAL')) {
              u.reais += 100;
              historia = 'O Natal chegou e o Papai Noel te deu um presente!\nVocê vendeu o presente e ganhou R$ 100.';
              recompensaTexto = '💰 Você ganhou *R$ 100,00*!';
            } else if (nomeEvento.includes('PRAIA')) {
              u.reais += 50;
              historia = 'O dia na praia foi incrível!\nVocê encontrou um tesouro enterrado cheio de moedas (R$ 50).';
              recompensaTexto = '💰 Você ganhou *R$ 50,00*!';
            } else if (nomeEvento.includes('SKATE')) {
              u.energia = Math.min(100, u.energia + 15);
              historia = 'Você foi andar de skate com a galera!\nCaiu algumas vezes, mas se divertiu e recuperou +15 de energia.';
              recompensaTexto = '⚡ Você ganhou *+15 Energia*!';
            } else if (nomeEvento.includes('YOGA')) {
              u.energia = Math.min(100, u.energia + 20);
              historia = 'A aula de yoga no parque foi relaxante!\nVocê alongou tudo e recuperou +20 de energia.';
              recompensaTexto = '⚡ Você ganhou *+20 Energia*!';
            } else if (nomeEvento.includes('SURF')) {
              u.energia = Math.min(100, u.energia + 15); u.reais += 20;
              historia = 'Você pegou uma onda gigante!\nSurfou muito, recuperou energia e ainda ganhou R$ 20.';
              recompensaTexto = '⚡ Você ganhou *+15 Energia* e *R$ 20*!';
            } else if (nomeEvento.includes('TORNEIO')) {
              u.reais += 200;
              historia = 'Você entrou no torneio de games e DESTRUIU!\nGanhou a competição e levou o prêmio de R$ 200.';
              recompensaTexto = '💰 Você ganhou *R$ 200,00*!';
            } else if (nomeEvento.includes('FUTEBOL')) {
              u.reais += 150;
              historia = 'O time do bairro jogou muito bem!\nVocê fez o gol da vitória e ganhou R$ 150 de bicho.';
              recompensaTexto = '💰 Você ganhou *R$ 150,00*!';
            } else if (nomeEvento.includes('CIRCO')) {
              u.reais += 100;
              historia = 'O circo chegou na cidade e você foi!\nAssistiu os palhaços e ganhou R$ 100 numa brincadeira.';
              recompensaTexto = '💰 Você ganhou *R$ 100,00*!';
            } else if (nomeEvento.includes('PARQUE')) {
              u.energia = Math.min(100, u.energia + 10); u.reais += 150;
              historia = 'O parque de diversões tava demais!\nVocê foi na montanha-russa e ganhou R$ 150 numa aposta.';
              recompensaTexto = '⚡ Você ganhou *+10 Energia* e *R$ 150*!';
            } else if (nomeEvento.includes('SUSHI')) {
              u.reais += 180;
              historia = 'Você foi no rodízio de sushi e comeu feito louco!\nGanhou R$ 180 numa competição de quem comia mais.';
              recompensaTexto = '💰 Você ganhou *R$ 180,00*!';
            } else if (nomeEvento.includes('CASSINO')) {
              if (Math.random() < 0.5) {
                u.reais += 300;
                historia = 'Você sentou na mesa de pôquer e DEU SORTE!\nGanhou todas as fichas dos adversários.';
                recompensaTexto = '🎲 Você GANHOU *R$ 300,00*!';
              } else {
                historia = 'Você sentou na mesa de pôquer e...\nPerdeu tudo pro crupiê. A casa sempre vence.';
                recompensaTexto = '🎲 Você perdeu o dinheiro do cassino...';
              }
            } else if (nomeEvento.includes('ACADEMIA')) {
              u.energia = Math.min(100, u.energia + 20);
              historia = 'Você foi treinar na academia!\nPuxou ferro até não aguentar e recuperou +20 de energia.';
              recompensaTexto = '⚡ Você ganhou *+20 Energia*!';
            } else if (nomeEvento.includes('NATAÇÃO')) {
              u.energia = Math.min(100, u.energia + 15);
              historia = 'Você foi nadar um pouco!\nDeu várias voltas na piscina e recuperou +15 de energia.';
              recompensaTexto = '⚡ Você ganhou *+15 Energia*!';
            } else if (nomeEvento.includes('PIZZA')) {
              u.energia = Math.min(100, u.energia + 5); u.reais += 80;
              historia = 'Noite da pizza com os amigos!\nVocê comeu metade da pizza sozinho e ainda ganhou R$ 80.';
              recompensaTexto = '⚡ Você ganhou *+5 Energia* e *R$ 80*!';
            } else if (nomeEvento.includes('LASER')) {
              u.reais += 100;
              historia = 'A batalha de laser tag foi insana!\nVocê eliminou todo mundo e ganhou R$ 100 de prêmio.';
              recompensaTexto = '💰 Você ganhou *R$ 100,00*!';
            } else if (nomeEvento.includes('ACAMPAMENTO')) {
              u.energia = Math.min(100, u.energia + 10); u.reais += 35;
              historia = 'Você foi acampar na floresta!\nFez uma fogueira, contou histórias e ganhou R$ 35.';
              recompensaTexto = '⚡ Você ganhou *+10 Energia* e *R$ 35*!';
            } else if (nomeEvento.includes('PINTURA')) {
              u.reais += 30;
              historia = 'A aula de pintura foi muito legal!\nVocê pintou uma tela linda e vendeu por R$ 30.';
              recompensaTexto = '💰 Você ganhou *R$ 30,00*!';
            } else if (nomeEvento.includes('ESPACIAL')) {
              u.reais += 400;
              historia = 'Você foi numa viagem espacial!\nViu a Terra do espaço e ganhou R$ 400 numa aposta.';
              recompensaTexto = '💰 Você ganhou *R$ 400,00*!';
            } else {
              u.reais += 50;
              historia = 'Você participou do evento e se divertiu muito!\nGanhou R$ 50 pela participação.';
              recompensaTexto = '💰 Você ganhou *R$ 50,00*!';
            }
            
            salvarShizuki(sender, u);
            
            await sock.sendMessage(from, { 
              text: `╭━━━〔 🎊 𝐄𝐕𝐄𝐍𝐓𝐎 🎊 〕━━━╮\n┃\n┃ 🏆 @${sender.split('@')[0]}\n┃\n┃ ${historia.split('\n').join('\n┃ ')}\n┃\n┃ ${recompensaTexto}\n┃ 💰 Saldo: *R$ ${u.reais.toFixed(2)}*\n┃ ⚡ Energia: *${u.energia}/100*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
