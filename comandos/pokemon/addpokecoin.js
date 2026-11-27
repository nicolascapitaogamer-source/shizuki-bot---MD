// Gerado de index.js (case 'addpokecoin', linha 6811)
export default {
  nomes: ["addpokecoin","addpoke"],
  async executar(__x) {
    const { pokeUser, salvarPokeUser, isDono, sock, from, msg, args, sender } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem usar este comando!' }, { quoted: msg });
              return
            }

            const ctxAdd = msg.message.extendedTextMessage?.contextInfo;
            const alvoAdd = ctxAdd?.mentionedJid?.[0] || ctxAdd?.participant;

            if (!alvoAdd) {
              await sock.sendMessage(from, { text: '⚠️ Marque a pessoa com @ ou responda à mensagem dela.\n\nEx: `!addpokecoin 500 @pessoa`' }, { quoted: msg });
              return
            }

            const qtdAdd = parseInt(args.find(a => /^-?\d+$/.test(a)) || '0', 10);

            if (!qtdAdd || qtdAdd === 0) {
              await sock.sendMessage(from, { text: '⚠️ Informe uma quantidade válida!\n\nEx: `!addpokecoin 500 @pessoa`\n\n💡 Aceita valores negativos pra remover.' }, { quoted: msg });
              return
            }

            const uAdd = pokeUser(alvoAdd);
            const saldoAntes = uAdd.pokecoins;
            uAdd.pokecoins = Math.max(0, saldoAntes + qtdAdd);
            salvarPokeUser(alvoAdd, uAdd);

            const emojiAdd = qtdAdd > 0 ? '➕' : '➖';
            const sinalAdd = qtdAdd > 0 ? '+' : '';

            await sock.sendMessage(from, {
              text: `💰 *POKECOINS AJUSTADAS!*\n\n` +
                    `👤 *Membro:* @${alvoAdd.split('@')[0]}\n` +
                    `👑 *Por:* @${sender.split('@')[0]}\n\n` +
                    `${emojiAdd} *Quantidade:* ${sinalAdd}${qtdAdd}\n` +
                    `📊 *Antes:* ${saldoAntes}\n` +
                    `✅ *Agora:* ${uAdd.pokecoins} Pokécoins`,
              mentions: [alvoAdd, sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
