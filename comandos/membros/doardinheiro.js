// Gerado de index.js (case 'doardinheiro', linha 10516)
export default {
  nomes: ["doardinheiro","transferir","doar","pix"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, isGroup, msg, sock, from, config, sender, args } = Object.assign({}, __x.utils, __x);
    {
{
    if (!isGroup) return
    const ctx = msg.message.extendedTextMessage?.contextInfo;
    const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;

    if (!alvo) { 
      await sock.sendMessage(from, { text: '╭─────────────────────╮\n   ⚠️ 𝐀𝐓𝐄𝐍𝐂̧𝐀̃𝐎 ⚠️\n╰─────────────────────╯\n\n💬 Marque a pessoa que vai receber!\n\n💡 *Ex:* ' + (config.prefixo || '!') + 'transferir @pessoa 100' }, { quoted: msg }); 
      return 
    }
    
    if (alvo === sender) { 
      await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🤔 𝐎𝐏𝐒... 🤔\n╰─────────────────────╯\n\n🛑 Você não pode transferir dinheiro para você mesmo, bobinho(a)!\n\n💡 _Tente marcar outra pessoa._' }, { quoted: msg }); 
      return 
    }
    
    const valor = parseInt(args.find(a => /^\d+$/.test(a)) || '0', 10);
    
    if (!valor || valor < 1) { 
      await sock.sendMessage(from, { text: '╭─────────────────────╮\n   ⚠️ 𝐀𝐓𝐄𝐍𝐂̧𝐀̃𝐎 ⚠️\n╰─────────────────────╯\n\n💬 Informe o valor da transferência!\n\n💡 *Ex:* ' + (config.prefixo || '!') + 'transferir @pessoa 100' }, { quoted: msg }); 
      return 
    }
    
    const u = shizukiUser(sender);
    
    if (valor > u.reais) { 
      await sock.sendMessage(from, { text: '╭─────────────────────╮\n   ❌ 𝐄𝐑𝐑𝐎 𝐍𝐎 𝐏𝐈𝐗 ❌\n╰─────────────────────╯\n\n⚠️ Oii @' + sender.split('@')[0] + ', você não tem tudo isso na conta!\n💰 *Seu saldo:* R$ ' + u.reais.toFixed(2).replace('.', ',') + '\n📉 *Valor pedido:* R$ ' + valor.toFixed(2).replace('.', ',') + '\n\n💡 _Trabalhe mais ou tente um valor menor._', mentions: [sender] }, { quoted: msg }); 
      return 
    }
    
    const uAlvo = shizukiUser(alvo);
    u.reais -= valor;
    uAlvo.reais += valor;
    salvarShizuki(sender, u);
    salvarShizuki(alvo, uAlvo);

    const dataAtual = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    await sock.sendMessage(from, {
      text: '╭─────────────────────╮\n   💸 𝐂𝐎𝐌𝐏𝐑𝐎𝐕𝐀𝐍𝐓𝐄 𝐏𝐈𝐗 💸\n╰─────────────────────╯\n\n💜 *De:* @' + sender.split('@')[0] + '\n💜 *Para:* @' + alvo.split('@')[0] + '\n💰 *Valor:* R$ ' + valor.toFixed(2).replace('.', ',') + '\n📅 *Data:* ' + dataAtual + '\n🏦 *Instituição:* Shizuki Bank\n🔖 *ID da Transação:* #PIX' + Math.floor(Math.random() * 900000 + 100000) + '\n\n✨ _Transferência realizada com sucesso!_\n\n╰━━━━━━━━━━━━━━━━━━⬣',
      mentions: [sender, alvo]
    }, { quoted: msg });
  }
  return
    }
  }
};
