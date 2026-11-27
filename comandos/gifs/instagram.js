// Gerado de index.js (case 'instagram', linha 7820)
export default {
  nomes: ["instagram","insta"],
  async executar(__x) {
    const { carregarConfig, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            const cfgInsta = carregarConfig();
            if (!cfgInsta.apiKey) {
              await sock.sendMessage(from, { text: '❌ Configure a API com *!api SUA_CHAVE* primeiro!' }, { quoted: msg });
              return
            }
            const linkInsta = args.join(' ').trim();
            if (!linkInsta || !linkInsta.includes('instagram.com')) {
              await sock.sendMessage(from, { text: '⚠️ Manda o link do Instagram!\n\n📝 Ex: *!instagram https://instagram.com/reel/...*\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: '📸 *INSTAGRAM DOWNLOADER*\n\n🔗 Link recebido!\n🎯 Status: Processando...\n\n💜 _Só um instante~_\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            try {
              const rInsta = await fetch('https://api.bronxyshost.com.br/api-bronxys/instagram?url=' + encodeURIComponent(linkInsta) + '&apikey=' + cfgInsta.apiKey, { signal: AbortSignal.timeout(60000) });
              const jInsta = await rInsta.json();
              if (!jInsta || !jInsta.msg || !jInsta.msg[0] || !jInsta.msg[0].url) throw new Error('Sem URL');
              const mediaInsta = jInsta.msg[0];
              const rVideo = await fetch(mediaInsta.url, { signal: AbortSignal.timeout(120000) });
              const bufInsta = Buffer.from(await rVideo.arrayBuffer());
              const tamMB = (bufInsta.length / 1024 / 1024).toFixed(2);
              if (bufInsta.length > 16 * 1024 * 1024) {
                await sock.sendMessage(from, { text: '❌ *VÍDEO MUITO GRANDE!*\n\n📦 Tamanho: ' + tamMB + ' MB\n📏 Limite: 16 MB\n\n💜 Tenta outro!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
                return
              }
              const isVideoInsta = mediaInsta.type === 'mp4';
              if (isVideoInsta) {
                await sock.sendMessage(from, { video: bufInsta, mimetype: 'video/mp4', caption: '✅ *INSTAGRAM BAIXADO!*\n\n📸 Plataforma: Instagram\n🎬 Tipo: Reels\n📦 Tamanho: ' + tamMB + ' MB\n\n💜 Aproveite!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              } else {
                await sock.sendMessage(from, { image: bufInsta, caption: '✅ *IMAGEM BAIXADA!*\n\n📸 Instagram\n📦 ' + tamMB + ' MB\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              }
            } catch (errInsta) {
              console.error('Erro instagram:', errInsta.message);
              await sock.sendMessage(from, { text: '❌ *ERRO NO DOWNLOAD*\n\n💡 Possíveis motivos:\n• Link inválido\n• Post privado\n• Conteúdo removido\n\n💜 Tenta de novo!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            }
          }
          return
    }
  }
};
