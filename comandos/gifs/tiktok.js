// Gerado de index.js (case 'tiktok', linha 8823)
export default {
  nomes: ["tiktok","ttk"],
  async executar(__x) {
    const { args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const urlTtk = args[0];
            if (!urlTtk) {
              await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐓𝐈𝐊𝐓𝐎𝐊 〕━━━╮\n┃\n┃ ⚠️ Manda o link do TikTok!\n┃\n┃ 💡 Ex: *!tiktok https://vt.tiktok.com/...*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              return
            }
            if (!urlTtk.includes('tiktok.com')) {
              await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 〕━━━╮\n┃\n┃ ❌ Isso não parece um link do TikTok!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐓𝐈𝐊𝐓𝐎𝐊 〕━━━╮\n┃\n┃ ⏳ Baixando o vídeo...\n┃ 💜 Só um instante~\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            try {
              const apiUrl = 'https://www.tikwm.com/api/?url=' + encodeURIComponent(urlTtk);
              const resp = await fetch(apiUrl, { signal: AbortSignal.timeout(30000) });
              const json = await resp.json();
              if (json.code !== 0 || !json.data || !json.data.play) {
                await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 〕━━━╮\n┃\n┃ ❌ Não consegui baixar esse vídeo!\n┃\n┃ 💡 Verifica o link!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                return
              }
              const videoUrl = json.data.hdplay || json.data.play;
              const titulo = (json.data.title || 'Vídeo do TikTok').slice(0, 120);
              const autor = json.data.author?.unique_id || 'desconhecido';
              const duracao = json.data.duration || 0;
              const views = json.data.play_count || 0;
              const likes = json.data.digg_count || 0;
              const comentarios = json.data.comment_count || 0;
              function fmtNum(n) {
                if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
                if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
                return String(n);
              }
              const videoResp = await fetch(videoUrl, { signal: AbortSignal.timeout(90000) });
              const videoBuf = Buffer.from(await videoResp.arrayBuffer());
              const TAMANHO_MAX = 16 * 1024 * 1024;
              if (videoBuf.length > TAMANHO_MAX) {
                const tamMB = (videoBuf.length / 1024 / 1024).toFixed(1);
                await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐕𝐈𝐃𝐄𝐎 𝐆𝐑𝐀𝐍𝐃𝐄 〕━━━╮\n┃\n┃ ❌ Esse vídeo é muito grande!\n┃ 📦 Tamanho: ' + tamMB + ' MB\n┃ 📏 Limite: 16 MB\n┃\n┃ 💡 Tenta um vídeo mais curto!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                return
              }
              const legenda = '╭━━━〔 🎵 𝐓𝐈𝐊𝐓𝐎𝐊 〕━━━╮\n┃\n┃ 👤 Autor: @' + autor + '\n┃ 📝 ' + titulo + '\n┃\n┣━━━〔 📊 𝐄𝐒𝐓𝐀𝐓𝐈́𝐒𝐓𝐈𝐂𝐀𝐒 〕━━━\n┃\n┃ ⏱️ Duração: ' + duracao + 's\n┃ 👀 Views: ' + fmtNum(views) + '\n┃ ❤️ Curtidas: ' + fmtNum(likes) + '\n┃ 💬 Comentários: ' + fmtNum(comentarios) + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯\n💜 Shizuki Bot';
              await sock.sendMessage(from, { video: videoBuf, caption: legenda, mimetype: 'video/mp4' }, { quoted: msg });
            } catch (e) {
              console.error('Erro no !tiktok:', e.message);
              await sock.sendMessage(from, { text: '╭━━━〔 ⚠️ 𝐄𝐑𝐑𝐎 〕━━━╮\n┃\n┃ ❌ Deu erro ao baixar!\n┃\n┃ 💡 Tenta de novo mais tarde.\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            }
          }
          return
    }
  }
};
