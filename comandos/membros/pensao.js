// Gerado de index.js (case 'pensao', linha 5180)
export default {
  nomes: ["pensao","pensão"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);

            if (!u.casado) {
              await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🤔 𝐎𝐏𝐒... 🤔\n╰─────────────────────╯\n\n🚫 Você precisa ser casado(a) para pagar pensão!\n\n💡 _Use !casar @pessoa primeiro._\n\n╰━━━━━━━━━━━━━━━━━━⬣' }, { quoted: msg });
              return
            }

            if (!u.filhos || u.filhos.length === 0) {
              await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🤔 𝐎𝐏𝐒... 🤔\n╰─────────────────────╯\n\n🚫 Você não tem filhos para pagar pensão!\n\n💡 _Use !criarfamilia ou !adotar primeiro._\n\n╰━━━━━━━━━━━━━━━━━━⬣' }, { quoted: msg });
              return
            }

            const alvo = u.casado;
            const uAlvo = shizukiUser(alvo);
            const valorPensao = Math.floor(u.reais * 0.20);

            if (valorPensao < 1) {
              await sock.sendMessage(from, { text: '⚠️ Sua renda é tão baixa que a pensão deu R$ 0,00.\n💡 _Trabalhe mais antes de pagar._' }, { quoted: msg });
              return
            }

            if (u.reais >= valorPensao) {
              u.reais -= valorPensao;
              uAlvo.reais += valorPensao;
              salvarShizuki(sender, u);
              salvarShizuki(alvo, uAlvo);

              await sock.sendMessage(from, {
                text: '╭─────────────────────╮\n   ⚖️ 𝐓𝐑𝐈𝐁𝐔𝐍𝐀𝐋 𝐃𝐄 𝐅𝐀𝐌𝐈𝐋𝐈𝐀 ⚖️\n╰─────────────────────╯\n\n👨‍👩‍👦 *Audiência de Pensão Alimentícia*\n\n💜 *Pagador:* @' + sender.split('@')[0] + '\n💜 *Recebedor(a):* @' + alvo.split('@')[0] + '\n💰 *Valor:* R$ ' + valorPensao.toFixed(2).replace('.', ',') + ' (20%)\n\n✅ *Status:* Pagamento efetuado com sucesso!\n✨ _As crianças estão com o sustento garantido._\n\n╰━━━━━━━━━━━━━━━━━━⬣',
                mentions: [sender, alvo]
              }, { quoted: msg });

            } else {
              const saldoAntigo = u.reais;
              u.reais = 0;
              salvarShizuki(sender, u);

              await sock.sendMessage(from, {
                text: '╭─────────────────────╮\n   🚔 𝐏𝐑𝐈𝐒𝐀̃𝐎 𝐏𝐎𝐑 𝐏𝐄𝐍𝐒𝐀̃𝐎 🚔\n╰─────────────────────╯\n\n🚨 *Alerta Vermelho!*\n\nO cidadão @' + sender.split('@')[0] + ' foi detido pela Polícia de Shizuki City!\n\n💸 *Motivo:* Deve pensão alimentícia.\n📉 *Dívida:* R$ ' + valorPensao.toFixed(2).replace('.', ',') + '\n🏦 *Saldo apreendido:* R$ ' + saldoAntigo.toFixed(2).replace('.', ',') + '\n\n⛓️ *Pena:* Ficará preso até arrumar o dinheiro.\n\n💡 _Dica: Use !trabalhar para conseguir dinheiro e pagar a dívida._\n\n╰━━━━━━━━━━━━━━━━━━⬣',
                mentions: [sender]
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
