// Gerado de index.js (case 'minhadupla', linha 6162)
export default {
  nomes: ["minhadupla","dupla"],
  async executar(__x) {
    const { shizukiUser, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.casado && !u.namorando) { await sock.sendMessage(from, { text: '╭─────────────────────╮\n   💍 MINHA DUPLA 💍\n╰─────────────────────╯\n\n❌ Oii @' + sender.split('@')[0] + ', você ainda não tem uma dupla!\n💡 _Use !casar @pessoa para encontrar seu par._\n\n╰━━━━━━━━━━━━━━━━━━⬣', mentions: [sender] }, { quoted: msg }); return }
            const parceiro = u.casado || u.namorando;
            const tipo = u.casado ? 'Casado(a)' : 'Namorando';
            const inicio = u.dataCasamento || Date.now();
            let diferenca = Date.now() - inicio;
            const msAno = 31536000000, msMes = 2592000000, msDia = 86400000, msHora = 3600000, msMin = 60000;
            const anos = Math.floor(diferenca / msAno); diferenca %= msAno;
            const meses = Math.floor(diferenca / msMes); diferenca %= msMes;
            const dias = Math.floor(diferenca / msDia); diferenca %= msDia;
            const horas = Math.floor(diferenca / msHora); diferenca %= msHora;
            const minutos = Math.floor(diferenca / msMin);
            const segundos = Math.floor((diferenca % msMin) / 1000);
            let partes = [];
            if (anos > 0) partes.push(anos + (anos === 1 ? ' ano' : ' anos'));
            if (meses > 0) partes.push(meses + (meses === 1 ? ' mês' : ' meses'));
            if (dias > 0) partes.push(dias + 'd');
            if (horas > 0) partes.push(horas + 'h');
            if (minutos > 0) partes.push(minutos + 'min');
            if (segundos > 0 || partes.length === 0) partes.push(segundos + 's');
            const tempoJuntos = partes.join(' ');
            const uParceiro = shizukiUser(parceiro);
            const reaisParceiro = Number(uParceiro.reais || 0).toFixed(2);
            const qtdFilhos = Array.isArray(u.filhos) ? u.filhos.length : 0;
            await sock.sendMessage(from, { text: '╭─────────────────────╮\n   💞 MINHA DUPLA 💞\n╰─────────────────────╯\n\n👤 Você: *@' + sender.split('@')[0] + '*\n💑 Dupla: *@' + parceiro.split('@')[0] + '*\n💰 Reais da dupla: *R$ ' + reaisParceiro + '*\n⏳ Juntos há: *' + tempoJuntos + '*\n👨‍👩‍👧 Filhos: *' + qtdFilhos + '*\n\n💡 _Que a união de vocês dure para sempre!_\n\n╰━━━━━━━━━━━━━━━━━━⬣', mentions: [sender, parceiro] }, { quoted: msg });
          }
          return
    }
  }
};
