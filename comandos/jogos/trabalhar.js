// Gerado de index.js (case 'trabalhar', linha 6964)
export default {
  nomes: ["trabalhar"],
  async executar(__x) {
    const { shizukiUser, acharEmprego, eVIP, SHIZUKI_DATA, checarCooldown, calcularSalario, desgastarVeiculo, salvarShizuki, formatarReais, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.emprego) {
              await sock.sendMessage(from, { text: '❌ Você está desempregado!\n\nUse *!empregos* pra ver os cargos e *!fazerprova <emprego>* pra tentar.' }, { quoted: msg });
              return
            }
            const emprego = acharEmprego(u.emprego);
            if (u.energia < 20) {
              await sock.sendMessage(from, { text: '😴 Você está exausto!\n\nUse *!dormir* pra recuperar energia.' }, { quoted: msg });
              return
            }
            const cdTrabalho = (typeof eVIP === "function" && eVIP(sender)) ? 5 * 60 * 1000 : SHIZUKI_DATA.cooldownTrabalho; // BONUS VIP
            const cd = checarCooldown(u.ultimoTrabalho, cdTrabalho);
            if (!cd.ok) {
              await sock.sendMessage(from, { text: `⏰ Calma! Você já trabalhou.\n\nAguarde *${cd.minutos} minuto(s)*.` }, { quoted: msg });
              return
            }

            const sal = calcularSalario(emprego, u);
            // ═══ Desgasta veículo (2%) ═══
            const veicTrab = desgastarVeiculo(u, sender, 2);
            u.reais += sal.total;
            u.energia -= 20;
            u.ultimoTrabalho = Date.now();
            u.totalGanho = (u.totalGanho || 0) + sal.total;
            u.totalTrabalhos = (u.totalTrabalhos || 0) + 1; // PACOTE 2 TRABALHOS
            salvarShizuki(sender, u);

            let textoBonus = '';
            if (sal.bonusPct > 0) textoBonus = `\n┃ ✨ Bônus: *+${sal.bonusPct}%*`;

            await sock.sendMessage(from, {
              text: `╭━━━〔 💵 𝐓𝐑𝐀𝐁𝐀𝐋𝐇𝐀𝐍𝐃𝐎 💵 〕━━━╮\n┃\n` +
                    `┃ ${emprego.emoji} ${emprego.nome}\n┃\n` +
                    `┃ 💵 Base: *${formatarReais(sal.base)}*${textoBonus}\n` +
                    `┃ 💰 Recebeu: *${formatarReais(sal.total)}*\n┃\n` +
                    `┃ 💰 Saldo: *${formatarReais(u.reais)}*\n` +
                    `┃ ⚡ Energia: *${u.energia}/100*\n` +
                    `┃\n┃ ⏰ Próximo em 10min\n┃\n` +
                    `╰━━━━━━━━━━━━━━━━━━━━━━━━╯`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
