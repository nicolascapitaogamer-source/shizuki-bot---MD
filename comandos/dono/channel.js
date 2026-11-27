// Gerado de index.js (case 'channel', linha 12405)
export default {
  nomes: ["channel","canal"],
  async executar(__x) {
    const { salvarConfig, isDono, sock, from, msg, args, config } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) {
              await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem configurar o canal!' }, { quoted: msg });
              return
            }

            const qCan = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const textoCan = args.join(' ') || qCan?.conversation || qCan?.extendedTextMessage?.text || '';
            const mCan = /whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/.exec(textoCan);

            if (!mCan) {
              const atual = config.canal && config.canal.id
                ? `\n\n📢 *Canal atual:* ${config.canal.nome || 'Canal'}\n🔗 ${config.canal.link || ''}`
                : '';
              await sock.sendMessage(from, { text: '⚠️ Envie o link do seu canal junto com o comando.\n\nEx: `!channel https://whatsapp.com/channel/0029VbXXXXXXXX`' + atual }, { quoted: msg });
              return
            }

            const codigoCan = mCan[1];
            await sock.sendMessage(from, { text: '🔎 *Procurando o seu canal...*\n\nSó um instante! ⏳' }, { quoted: msg });

            try {
              const metaCan = await sock.newsletterMetadata('invite', codigoCan);
              if (!metaCan || !metaCan.id) throw new Error('Canal sem ID');

              const nomeCan = metaCan.name || metaCan.thread_metadata?.name?.text || 'Canal';
              const linkCan = `https://whatsapp.com/channel/${codigoCan}`;

              config.canal = { id: metaCan.id, nome: nomeCan, link: linkCan };
              salvarConfig(config);

              await sock.sendMessage(from, {
                text: `✨ *CHANNEL ATIVO COM SUCESSO, SENHOR(A)!* ✨\n\n` +
                      `🥇 → *ID:* ${metaCan.id}\n` +
                      `📢 → *NOME:* ${nomeCan}\n` +
                      `📎 → *LINK:* ${linkCan}\n\n` +
                      `💜 Agora o menu do bot aparece como encaminhado do seu canal!\n` +
                      `Para remover use: !rmchannel`
              }, { quoted: msg });
            } catch (err) {
              console.error('Erro no comando !channel:', err);
              await sock.sendMessage(from, { text: '❌ Não consegui encontrar esse canal.\n\nConfira se o link está certo e completo e tente de novo.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
