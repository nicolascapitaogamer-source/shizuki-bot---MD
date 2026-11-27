// Gerado de index.js (case 'play', linha 8754)
export default {
  nomes: ["play"],
  async executar(__x) {
    const { apiBronxys, args, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const buscaP = args.join(' ').trim();
            if (!buscaP) {
              await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐏𝐋𝐀𝐘 〕━━━╮\n┃\n┃ 💜 Pra tocar uma música, use:\n┃\n┃ 📝 *!play <nome>*\n┃\n┃ 💡 Ex: *!play nome da música*\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              return
            }
            const keyP = apiBronxys.getApiKey();
            if (!keyP) {
              await sock.sendMessage(from, { text: '╭━━━〔 🔑 𝐀𝐏𝐈 𝐍𝐄𝐂𝐄𝐒𝐒𝐀́𝐑𝐈𝐀 🔑 〕━━━╮\n┃\n┃ ❌ A API ainda não foi\n┃    configurada!\n┃\n┃ 💡 Use: *!apitoken SUA_CHAVE*\n┃ 💜 (só o dono pode configurar)\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: '╭━━━〔 🔎 𝐁𝐔𝐒𝐂𝐀𝐍𝐃𝐎 〕━━━╮\n┃\n┃ 🎵 Procurando: *' + buscaP + '*\n┃\n┃ ⏳ Aguarde só um pouquinho...\n┃ 💜 Vou trazer pra você já já!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            try {
              const pesquisa = await apiBronxys.pesquisarYtb(buscaP);
              if (pesquisa.erro === 'sem_token') {
                await sock.sendMessage(from, { text: '🔑 API não configurada!' }, { quoted: msg });
                return
              }
              if (pesquisa.erro === 'api_off') {
                await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐍𝐀̃𝐎 𝐀𝐂𝐇𝐄𝐈 🎵 〕━━━╮\n┃\n┃ 🔍 Oii, eu procurei por todo canto...\n┃ 📉 Mas não achei a música!\n┃\n┃ 💡 _Tente pesquisar com o nome do cantor ou o link do YouTube._\n┃\n┃ 💜 Prometo me esforçar mais!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                return
              }
              const infoMusica = pesquisa.data && pesquisa.data[0];
              if (!infoMusica) {
                await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐍𝐀̃𝐎 𝐀𝐂𝐇𝐄𝐈 🎵 〕━━━╮\n┃\n┃ 🔍 Oii, eu procurei por todo canto...\n┃ 📉 Mas não achei a música!\n┃\n┃ 💡 _Tente pesquisar com o nome do cantor ou o link do YouTube._\n┃\n┃ 💜 Prometo me esforçar mais!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                return
              }
              const audio = await apiBronxys.playAudio(buscaP);
              if (audio.erro === 'api_off') {
                await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐍𝐀̃𝐎 𝐀𝐂𝐇𝐄𝐈 🎵 〕━━━╮\n┃\n┃ 🔍 Oii, eu procurei por todo canto...\n┃ 📉 Mas não achei a música!\n┃\n┃ 💡 _Tente pesquisar com o nome do cantor ou o link do YouTube._\n┃\n┃ 💜 Prometo me esforçar mais!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
                return
              }
              if (!audio.ok) {
                await sock.sendMessage(from, { text: '❌ Erro ao baixar a música!' }, { quoted: msg });
                return
              }
              const legendaP = '╭━━━〔 🎵 𝐏𝐋𝐀𝐘 〕━━━╮\n' +
                '┃\n' +
                '┃ 🎵 Título: *' + (infoMusica.titulo || buscaP) + '*\n' +
                '┃ ⏱️ Tempo: *' + (infoMusica.tempo || '?') + '*\n' +
                '┃ 📅 Postado: *' + (infoMusica.postado || '?') + '*\n' +
                '┃\n' +
                '╰━━━━━━━━━━━━━━━━━━╯';
              if (infoMusica.thumb) {
                try {
                  await sock.sendMessage(from, { image: { url: infoMusica.thumb }, caption: legendaP }, { quoted: msg });
                } catch (e) {
                  await sock.sendMessage(from, { text: legendaP }, { quoted: msg });
                }
              } else {
                await sock.sendMessage(from, { text: legendaP }, { quoted: msg });
              }
              await sock.sendMessage(from, {
                audio: audio.buffer,
                mimetype: 'audio/mp4',
                ptt: false,
                fileName: (infoMusica.titulo || buscaP).slice(0, 40) + '.mp3'
              }, { quoted: msg });
            } catch (e) {
              console.error('Erro play:', e.message);
              await sock.sendMessage(from, { text: '╭━━━〔 🎵 𝐍𝐀̃𝐎 𝐀𝐂𝐇𝐄𝐈 🎵 〕━━━╮\n┃\n┃ 🔍 Oii, eu procurei por todo canto...\n┃ 📉 Mas não achei a música!\n┃\n┃ 💡 _Tente pesquisar com o nome do cantor ou o link do YouTube._\n┃\n┃ 💜 Prometo me esforçar mais!\n┃\n╰━━━━━━━━━━━━━━━━━━╯' }, { quoted: msg });
            }
          }
          return
    }
  }
};
