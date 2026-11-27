// Gerado de index.js (case 'balada', linha 5264)
export default {
  nomes: ["balada"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, carregarJSON, salvarJSON, sender, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            const tipo = (args[0] || '').toLowerCase();
            
            if (tipo !== 'vip' && tipo !== 'normal') {
              const msgMenu = `╭━━━〔 🎉 𝐁𝐀𝐋𝐀𝐃𝐀 🎉 〕━━━╮\n┃\n┃ 🚪 *Escolha seu acesso:*\n┃\n┃ 🎟️ *!balada normal*\n┃    ➜ Entrada Comum (R$ 20)\n┃\n┃ 👑 *!balada vip*\n┃    ➜ Entrada VIP (R$ 50)\n┃    ➜ Bebidas com 20% de desconto!\n┃    ➜ Bônus em tudo!\n┃\n┃ 💰 Seu saldo: R$ ${u.reais.toFixed(2)}\n┃\n┃\n┃ 💡 Use: *!balada normal* ou *!balada vip*\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯`;
              await sock.sendMessage(from, { text: msgMenu }, { quoted: msg });
              return
            }
            
            const isVip = tipo === 'vip';
            const custo = isVip ? 50 : 20;
            
            if (u.reais < custo) {
              await sock.sendMessage(from, { text: `💸 Você precisa de R$ ${custo},00 pra entrar!` }, { quoted: msg });
              return
            }
            
            u.reais -= custo;
            salvarShizuki(sender, u);
            
            const msgMenu = `╭━━━〔 ${isVip ? '👑 𝐄𝐍𝐓𝐑𝐀𝐃𝐀 𝐕𝐈𝐏' : '🎟️ 𝐄𝐍𝐓𝐑𝐀𝐃𝐀 𝐍𝐎𝐑𝐌𝐀𝐋'} 〕━━━╮\n┃\n┃ ✨ Você pagou R$ ${custo},00 e entrou!\n┃\n┃ 🍻 Agora escolha sua bebida:\n┃\n┃ 🍺 *1.* Cerveja (R$ 15)\n┃ 🍸 *2.* Vodka (R$ 35)\n┃ ⚡ *3.* Energético (R$ 25)\n┃ 🍹 *4.* Gin Tônica (R$ 50)\n┃ 🍏 *5.* Jack de Maçã (R$ 60)\n┃ 🥃 *6.* Whisky 12 Anos (R$ 90)\n┃ 🍾 *7.* Gin de 10 (R$ 10)\n┃ 💧 *8.* Água (R$ 5)\n┃\n╰━━━━━━━━━━━━━━━━━━━━╯\n💡 *Marque esta mensagem e responda com o número da bebida*\n*Ex: 1*`;
            const msgEnviada = await sock.sendMessage(from, { text: msgMenu }, { quoted: msg });
            
            // Salva no JSON em vez do Map
            const baladaDB = carregarJSON('./balada_ativa.json');
            baladaDB[msgEnviada.key.id] = { sender, from, vip: isVip };
            salvarJSON('./balada_ativa.json', baladaDB);
          }
          return
    }
  }
};
