// Gerado de index.js (case 'comprarloja', linha 10648)
export default {
  nomes: ["comprarloja","loja"],
  async executar(__x) {
    const { shizukiUser, formatarReais, formatarPrecoCurto, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            let sub = args.join(' ').toLowerCase().trim();
            // Normaliza: tira espaço e acento pra comparar com os IDs
            const normSub = sub.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');

            // ═══ CATÁLOGO COMPLETO ═══
            const itens = {
              // 🚗 VEÍCULOS
              bicicleta:    { nome: 'Bicicleta',        emoji: '🚲', preco: 800,      cat: 'veiculos' },
              moto:         { nome: 'Moto',             emoji: '🛵', preco: 3500,     cat: 'veiculos' },
              carro:        { nome: 'Carro Popular',    emoji: '🚗', preco: 12000,    cat: 'veiculos' },
              carroesportivo: { nome: 'Carro Esportivo', emoji: '🏎️', preco: 45000,   cat: 'veiculos' },
              helicoptero:  { nome: 'Helicóptero',      emoji: '🚁', preco: 150000,   cat: 'veiculos' },
              iate:         { nome: 'Iate',             emoji: '🛥️', preco: 350000,   cat: 'veiculos' },
              jato:         { nome: 'Jato Particular',  emoji: '✈️', preco: 1500000,  cat: 'veiculos' },
              jatosupersonico: { nome: 'Jato Supersônico', emoji: '🛸', preco: 5000000, cat: 'veiculos' },
              // 🏝️ ILHAS
              ilhapequena:  { nome: 'Ilha Pequena',     emoji: '🏖️', preco: 500000,   cat: 'ilhas' },
              ilhamedia:    { nome: 'Ilha Média',       emoji: '🏝️', preco: 1500000,  cat: 'ilhas' },
              ilhaparadisiaca: { nome: 'Ilha Paradisíaca', emoji: '🌴', preco: 5000000, cat: 'ilhas' },
              // 💎 ITENS DE LUXO
              anel:         { nome: 'Anel',             emoji: '💍', preco: 1500,     cat: 'luxo' },
              relogio:      { nome: 'Relógio Rolex',    emoji: '⌚', preco: 8000,     cat: 'luxo' },
              coroa:        { nome: 'Coroa',            emoji: '👑', preco: 15000,    cat: 'luxo' },
              diamante:     { nome: 'Diamante',         emoji: '💎', preco: 30000,    cat: 'luxo' },
              // 📱 ELETRÔNICOS
              celular:      { nome: 'Celular Top',      emoji: '📱', preco: 800,      cat: 'eletronicos' },
              notebook:     { nome: 'Notebook Gamer',   emoji: '💻', preco: 2000,     cat: 'eletronicos' },
              trofeu:       { nome: 'Troféu',           emoji: '🏆', preco: 800,      cat: 'eletronicos' }
            };

            // ═══ SE NÃO TEM ARGUMENTO: MOSTRA A LOJA ═══
            if (!sub) {
              let txt = `╔══════════════════════════════╗\n` +
                        `║  ⋆｡°✩  🛒 𝐋𝐎𝐉𝐀 𝐒𝐇𝐈𝐙𝐔𝐊𝐈 🛒  ✩°｡⋆  ║\n` +
                        `║         💜 Sua vida virtual 💜        ║\n` +
                        `╚══════════════════════════════╝\n\n` +
                        `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                        `┃ 💰 𝐒𝐄𝐔 𝐒𝐀𝐋𝐃𝐎: ${formatarReais(u.reais).padEnd(15)} ┃\n` +
                        `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n`;

              // 🚗 VEÍCULOS
              txt += `╭─❖ 🚗 𝐕𝐄Í𝐂𝐔𝐋𝐎𝐒 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'veiculos') continue;
                txt += `│  ${it.emoji} ${it.nome.padEnd(22, ".")} ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              // 🏝️ ILHAS
              txt += `╭─❖ 🏝️ 𝐈𝐋𝐇𝐀𝐒 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'ilhas') continue;
                txt += `│  ${it.emoji} ${it.nome} ··· ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              // 💎 LUXO
              txt += `╭─❖ 💎 𝐋𝐔𝐗𝐎 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'luxo') continue;
                txt += `│  ${it.emoji} ${it.nome} ··· ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              // 📱 ELETRÔNICOS
              txt += `╭─❖ 📱 𝐄𝐋𝐄𝐓𝐑𝐎̂𝐍𝐈𝐂𝐎𝐒 ❖─╮\n│\n`;
              for (const [id, it] of Object.entries(itens)) {
                if (it.cat !== 'eletronicos') continue;
                txt += `│  ${it.emoji} ${it.nome} ··· ${formatarPrecoCurto(it.preco)}\n`;
              }
              txt += `│\n╰─────────────────────╯\n\n`;

              txt += `┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n` +
                     `┃ 💡 *!comprarloja <item>*             ┃\n` +
                     `┃ 📝 Ex: *!comprarloja carro*          ┃\n` +
                     `┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n` +
                     `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`;

              await sock.sendMessage(from, { text: txt, mentions: [sender] }, { quoted: msg });
              return
            }

            // ═══ COMPRA ═══
            // Procura pelo ID normalizado (aceita espaço e acento)
            let itemId = null;
            for (const [id, it] of Object.entries(itens)) {
              const normId = id.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '');
              const normNome = it.nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').toLowerCase();
              if (normId === normSub || normNome === normSub) { itemId = id; break; }
            }
            const item = itemId ? itens[itemId] : null;
            sub = itemId; // atualiza sub pro ID correto
            if (!item) {
              await sock.sendMessage(from, { text: '⚠️ Item inválido! Use *!comprarloja* pra ver a lista.' }, { quoted: msg });
              return
            }

            // Verifica se já tem
            u.itens = u.itens || [];
            const jaTem = u.itens.some(x => (typeof x === 'string' ? x : x.id) === sub);
            if (jaTem) {
              await sock.sendMessage(from, { text: `❌ Você já tem *${item.nome}*!` }, { quoted: msg });
              return
            }

            // Verifica saldo
            if (u.reais < item.preco) {
              await sock.sendMessage(from, {
                text: `╔══════════════════════════════╗\n` +
                      `║  ⋆｡°✩  ❌ 𝐒𝐄𝐌 𝐒𝐀𝐋𝐃𝐎 ❌  ✩°｡⋆  ║\n` +
                      `╚══════════════════════════════╝\n\n` +
                      `╭─❖ 💸 𝐅𝐀𝐋𝐓𝐀 𝐃𝐈𝐍𝐇𝐄𝐈𝐑𝐎 ❖─╮\n│\n` +
                      `│  ${item.emoji} ${item.nome}\n│\n` +
                      `│  💰 Preço: ${formatarReais(item.preco)}\n` +
                      `│  💵 Você tem: ${formatarReais(u.reais)}\n│\n` +
                      `│  📉 Falta: *${formatarReais(item.preco - u.reais)}*\n│\n` +
                      `╰─────────────────────╯\n\n` +
                      `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`
              }, { quoted: msg });
              return
            }

            // Compra!
            u.reais -= item.preco;
            u.itens = u.itens || [];
            // Se é veículo, salva com vida útil
            if (item.cat === 'veiculos') {
              u.itens.push({
                id: sub,
                nome: item.nome,
                emoji: item.emoji,
                preco: item.preco,
                vida: 100,
                compradoEm: Date.now()
              });
            } else {
              u.itens.push(sub);
            }
            salvarShizuki(sender, u);

            await sock.sendMessage(from, {
              text: `╔══════════════════════════════╗\n` +
                    `║  ⋆｡°✩  ✅ 𝐂𝐎𝐌𝐏𝐑𝐀 𝐎𝐊! ✅  ✩°｡⋆  ║\n` +
                    `╚══════════════════════════════╝\n\n` +
                    `╭─❖ 🛒 𝐑𝐄𝐂𝐈𝐁𝐎 ❖─╮\n│\n` +
                    `│  ${item.emoji} ${item.nome}\n│\n` +
                    `│  💰 Pago: ${formatarReais(item.preco)}\n` +
                    `│  💵 Saldo: ${formatarReais(u.reais)}\n│\n` +
                    `╰─────────────────────╯\n\n` +
                    `💜 Parabéns pela conquista!\n\n` +
                    `🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
