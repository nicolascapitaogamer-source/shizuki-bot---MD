// Gerado de index.js (case 'cassino', linha 12592)
export default {
  nomes: ["cassino","casino"],
  async executar(__x) {
    const { saldoCassino, normTxt, textoMenuCassino, carregarJSON, FILE_STATS, CASSINO_JANELA, CASSINO_GIROS_GRATIS, numDe, ajustarSaldo, CASSINO_MIN, CASSINO_MAX, nivelCassino, chanceAzar, girarSlot, rotuloNivel, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const csSaldo = saldoCassino(sender);
            const csSub = normTxt(args[0] || '');
            const csMapa = {
              '1': 'gratis', gratis: 'gratis', gratuito: 'gratis', free: 'gratis',
              '2': 'slot', slot: 'slot', caca: 'slot', niquel: 'slot', 'caca niquel': 'slot',
              '3': 'dados', dados: 'dados', dado: 'dados',
              '4': 'moeda', moeda: 'moeda', cara: 'moeda', coroa: 'moeda',
              '5': 'bitcoin', bitcoin: 'bitcoin', btc: 'bitcoin'
            };
            const csJogo = csMapa[csSub];

            if (!csJogo) {
              await sock.sendMessage(from, { text: textoMenuCassino(csSaldo, sender), mentions: [sender] }, { quoted: msg });
              return
            }

            // Jogo grátis
            if (csJogo === 'gratis') {
              const stCs = carregarJSON(FILE_STATS);
              const agoraCs = Date.now();
              const usosCs = ((stCs[sender] && stCs[sender].gratisUsos) || []).filter((t) => agoraCs - t < CASSINO_JANELA);

              if (usosCs.length >= CASSINO_GIROS_GRATIS) {
                const minCs = Math.ceil((CASSINO_JANELA - (agoraCs - usosCs[0])) / 60000);
                await sock.sendMessage(from, {
                  text: `╭━━━〔 🎁 𝐑𝐎𝐋𝐄𝐓𝐀 𝐆𝐑𝐀́𝐓𝐈𝐒 🎁 〕━━━╮\n┃\n` +
                        `┃ ⏳ Você já usou seus *${CASSINO_GIROS_GRATIS} giros*!\n` +
                        `┃ 🕒 Novo giro em *${minCs} minuto(s)*\n` +
                        `┃ 💰 Saldo: *${csSaldo}* moedas\n┃\n` +
                        `┃ 🎰 Enquanto isso, jogue com *!cassino*\n` +
                        `╰━━━━━━━━━━━━━━━━━━╯\n\n👤 @${numDe(sender)}`,
                  mentions: [sender]
                }, { quoted: msg });
                return
              }

              usosCs.push(agoraCs);
              const premio = 10 + Math.floor(Math.pow(Math.random(), 1.5 + (usosCs.length - 1) * 0.5) * 990);
              const novoCs = ajustarSaldo(sender, premio, { gratisUsos: usosCs });
              const restamCs = CASSINO_GIROS_GRATIS - usosCs.length;
              const tituloCs = premio >= 700 ? '🎉 𝐉𝐀𝐂𝐊𝐏𝐎𝐓 𝐆𝐑𝐀́𝐓𝐈𝐒! 🎉'
                             : premio >= 300 ? '✨ 𝐁𝐎𝐀 𝐒𝐎𝐑𝐓𝐄! ✨'
                             : '🍀 𝐆𝐀𝐍𝐇𝐎𝐔 𝐔𝐌 𝐓𝐑𝐎𝐂𝐀𝐃𝐎 🍀';
              const fraseCs = premio >= 700 ? '🤑 A sorte hoje está do seu lado!'
                            : premio >= 300 ? '😎 Nada mal, hein?'
                            : '😅 Já é um começo, mas os prêmios vão ficando mais difíceis...';

              await sock.sendMessage(from, {
                text: `╭━━━〔 🎁 𝐑𝐎𝐋𝐄𝐓𝐀 𝐆𝐑𝐀́𝐓𝐈𝐒 🎁 〕━━━╮\n┃\n` +
                      `┃ ${tituloCs}\n┃\n` +
                      `┃ 💵 Prêmio: *+${premio}* moedas\n` +
                      `┃ 💰 Saldo: *${novoCs}* moedas\n` +
                      `┃ 🎟️ Giros restantes: *${restamCs}/${CASSINO_GIROS_GRATIS}*\n┃\n` +
                      `┃ ${fraseCs}\n` +
                      `╰━━━━━━━━━━━━━━━━━━╯\n\n👤 @${numDe(sender)}`,
                mentions: [sender]
              }, { quoted: msg });
              return
            }

            // Jogos pagos
            const csTokens = args.slice(1);
            if (csSub === 'cara' || csSub === 'coroa') csTokens.unshift(csSub);
            const csValorStr = csTokens.find((x) => /^\d+$/.test(x));
            const csValor = csValorStr ? parseInt(csValorStr, 10) : 0;

            if (csSaldo < CASSINO_MIN) {
              await sock.sendMessage(from, { text: `😢 Você está sem moedas para apostar!\n\n🎁 Use *!cassino gratis* para ganhar mais.` }, { quoted: msg });
              return
            }
            if (!csValor || csValor < CASSINO_MIN || csValor > CASSINO_MAX) {
              await sock.sendMessage(from, { text: `⚠️ Informe um valor entre *${CASSINO_MIN}* e *${CASSINO_MAX}*.\n\nEx: \`!cassino ${csJogo === 'moeda' ? 'moeda cara' : csJogo} 100\`` }, { quoted: msg });
              return
            }
            if (csValor > csSaldo) {
              await sock.sendMessage(from, { text: `💸 Saldo insuficiente!\n\n💰 Você tem *${csSaldo}* moedas e tentou apostar *${csValor}*.` }, { quoted: msg });
              return
            }

            const nivelCs = nivelCassino(sender);
            const azarCs = chanceAzar(nivelCs);
            const extraNivel = { cassinoNivel: { n: nivelCs + 1, em: Date.now() } };
            let csTexto = '';

            if (csJogo === 'slot') {
              let sl = girarSlot();
              if (sl.mult > 0 && Math.random() < azarCs) sl = girarSlot();
              const retorno = Math.floor(csValor * sl.mult);
              const novo = ajustarSaldo(sender, retorno - csValor, extraNivel);
              const resultado = sl.mult >= 8
                ? `🎉 *JACKPOT!* Três iguais!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`
                : sl.mult > 0
                  ? `✨ Duas iguais!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`
                  : `😭 Nada alinhou...\n┃ 💸 Perdeu *${csValor}* moedas.`;
              csTexto = `╭━━━〔 🎰 𝐂𝐀𝐂̧𝐀-𝐍𝐈́𝐐𝐔𝐄𝐋 🎰 〕━━━╮\n┃\n┃      ${sl.r.join('  ┃  ')}\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            } else if (csJogo === 'dados') {
              const d = () => Math.floor(Math.random() * 6) + 1;
              const v1 = d(), v2 = d();
              let b1 = d(), b2 = d();
              if (v1 + v2 > b1 + b2 && Math.random() < azarCs) {
                const c1 = d(), c2 = d();
                if (c1 + c2 > b1 + b2) { b1 = c1; b2 = c2; }
              }
              const vs = v1 + v2, bs = b1 + b2;
              let delta = -csValor;
              let resultado = `😭 O bot venceu...\n┃ 💸 Perdeu *${csValor}* moedas.`;
              if (vs > bs) { delta = csValor; resultado = `🎉 Você venceu!\n┃ 💵 Ganhou *+${csValor}* moedas!`; }
              else if (vs === bs) { resultado = `🤝 Empate! Na casa, empate é do bot.\n┃ 💸 Perdeu *${csValor}* moedas.`; }
              const novo = ajustarSaldo(sender, delta, extraNivel);
              csTexto = `╭━━━〔 🎲 𝐃𝐀𝐃𝐎𝐒 🎲 〕━━━╮\n┃\n┃ 👤 Você: 🎲${v1} 🎲${v2} = *${vs}*\n┃ 🤖 Bot: 🎲${b1} 🎲${b2} = *${bs}*\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            } else if (csJogo === 'moeda') {
              const escolha = csTokens.map((x) => normTxt(x)).find((x) => x === 'cara' || x === 'coroa');
              if (!escolha) {
                await sock.sendMessage(from, { text: '⚠️ Escolha *cara* ou *coroa*.\n\nEx: `!cassino moeda cara 100`' }, { quoted: msg });
                return
              }
              let lado = Math.random() < 0.5 ? 'cara' : 'coroa';
              if (lado === escolha && Math.random() < azarCs) lado = Math.random() < 0.5 ? 'cara' : 'coroa';
              const ganhou = lado === escolha;
              const retorno = ganhou ? Math.floor(csValor * 1.8) : 0;
              const novo = ajustarSaldo(sender, retorno - csValor, extraNivel);
              const resultado = ganhou
                ? `🎉 Deu *${lado}*!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`
                : `😭 Deu *${lado}*...\n┃ 💸 Perdeu *${csValor}* moedas.`;
              csTexto = `╭━━━〔 🪙 𝐂𝐀𝐑𝐀 𝐎𝐔 𝐂𝐎𝐑𝐎𝐀 🪙 〕━━━╮\n┃\n┃ 🎯 Sua escolha: *${escolha}*\n┃ 🪙 Resultado: *${lado}*\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            } else if (csJogo === 'bitcoin') {
              const sorteioBtc = () => { const r = Math.random(); return r < 0.55 ? 0 : r < 0.80 ? 1.5 : r < 0.92 ? 2 : 3; };
              let mult = sorteioBtc();
              if (mult > 0 && Math.random() < azarCs) mult = sorteioBtc();
              const retorno = Math.floor(csValor * mult);
              const novo = ajustarSaldo(sender, retorno - csValor, extraNivel);
              const resultado = mult === 0
                ? `📉 O bitcoin despencou!\n┃ 💸 Perdeu *${csValor}* moedas.`
                : `📈 O bitcoin subiu *${mult}x*!\n┃ 💵 Ganhou *+${retorno - csValor}* moedas!`;
              csTexto = `╭━━━〔 ₿ 𝐁𝐈𝐓𝐂𝐎𝐈𝐍 ₿ 〕━━━╮\n┃\n┃ 💵 Investido: *${csValor}* moedas\n┃\n┃ ${resultado}\n┃ 💰 Saldo: *${novo}* moedas\n┃\n╰━━━━━━━━━━━━━━━━━━╯`;
            }

            await sock.sendMessage(from, {
              text: csTexto + `\n\n🔥 Dificuldade: *${rotuloNivel(nivelCs)}* ➜ próxima: *${rotuloNivel(nivelCs + 1)}*\n👤 @${numDe(sender)}`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
