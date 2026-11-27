// Gerado de index.js (case 'arrumar', linha 10595)
export default {
  nomes: ["arrumar","consertar"],
  async executar(__x) {
    const { shizukiUser, formatarReais, salvarShizuki, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const nomeBusca = args.join(' ').toLowerCase().trim();
            if (!nomeBusca) {
              await sock.sendMessage(from, { text: '⚠️ Use: *!arrumar <nome do veículo>*\n\nEx: *!arrumar carro*' }, { quoted: msg });
              return
            }
            const meus = (u.itens || []).filter(x => typeof x === 'object' && x.vida !== undefined);
            const veic = meus.find(v =>
              v.id.toLowerCase() === nomeBusca ||
              v.nome.toLowerCase() === nomeBusca ||
              v.nome.toLowerCase().includes(nomeBusca)
            );
            if (!veic) {
              await sock.sendMessage(from, { text: `❌ Você não tem *${nomeBusca}*! Use *!meusveiculos* pra ver.` }, { quoted: msg });
              return
            }
            if (veic.vida >= 100) {
              await sock.sendMessage(from, { text: `✅ Seu *${veic.nome}* já tá 100%! Não precisa arrumar.` }, { quoted: msg });
              return
            }
            const custo = veic.preco;
            if (u.reais < custo) {
              await sock.sendMessage(from, {
                text: `╔══════════════════════════════╗\n║      ❌  𝐒𝐄𝐌  𝐒𝐀𝐋𝐃𝐎  ❌      ║\n╚══════════════════════════════╝\n\n` +
                      `╭─❖ 🔧 𝐀𝐑𝐑𝐔𝐌𝐀𝐑 ❖─╮\n│\n` +
                      `│  ${veic.emoji} ${veic.nome}\n│\n` +
                      `│  🔧 Custo: ${formatarReais(custo)}\n` +
                      `│  💵 Você tem: ${formatarReais(u.reais)}\n│\n` +
                      `│  📉 Falta: *${formatarReais(custo - u.reais)}*\n│\n` +
                      `╰─────────────────────╯\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`
              }, { quoted: msg });
              return
            }
            u.reais -= custo;
            veic.vida = 100;
            veic.ultimaRevisao = Date.now();
            salvarShizuki(sender, u);
            await sock.sendMessage(from, {
              text: `╔══════════════════════════════╗\n║  ⋆｡°✩  🔧 𝐀𝐑𝐑𝐔𝐌𝐀𝐃𝐎! 🔧  ✩°｡⋆  ║\n╚══════════════════════════════╝\n\n` +
                    `╭─❖ ✅ 𝐑𝐄𝐕𝐈𝐒𝐀̃𝐎 𝐎𝐊 ❖─╮\n│\n` +
                    `│  ${veic.emoji} ${veic.nome}\n│\n` +
                    `│  🔋 Vida útil: *100%*\n` +
                    `│  💰 Pago: ${formatarReais(custo)}\n` +
                    `│  💵 Saldo: ${formatarReais(u.reais)}\n│\n` +
                    `╰─────────────────────╯\n\n💜 Como novo!\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
