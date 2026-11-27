// Gerado de index.js (case 'pinterest', linha 5793)
export default {
  nomes: ["pinterest"],
  async executar(__x) {
    const { args, sock, from, sender, msg, config } = Object.assign({}, __x.utils, __x);
    {
{
            const busca = args.join(' ').trim();
            if (!busca) {
              await sock.sendMessage(from, { text: '╭─────────────────────╮\n   📌 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 📌\n╰─────────────────────╯\n\n⚠️ Oii @' + sender.split('@')[0] + ', digite o que quer buscar!\n💡 Exemplo: !pinterest naruto\n\n╰━━━━━━━━━━━━━━━━━━⬣', mentions: [sender] }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: '🔍 Buscando imagens de *' + busca + '*...' }, { quoted: msg });
            try {
              const res = await fetch('https://api.bronxyshost.com.br/api-bronxys/pinterest?nome=' + encodeURIComponent(busca) + '&apikey=' + (config.apiKey || 'SUA_KEY_AQUI'));
              const data = await res.json();
              if (!Array.isArray(data) || data.length === 0) throw new Error('Nenhuma imagem encontrada');
              const img = data[Math.floor(Math.random() * data.length)];
              const url = typeof img === 'string' ? img : (img.url || img.link);
              if (!url) throw new Error('URL não encontrada');
              const legenda = '╭─────────────────────╮\n   📌 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 📌\n╰─────────────────────╯\n\n🔍 Busca: *' + busca + '*\n💜 _Aqui está sua inspiração!_\n\n╰━━━━━━━━━━━━━━━━━━⬣';
              await sock.sendMessage(from, { image: { url }, caption: legenda, mentions: [sender] }, { quoted: msg });
            } catch (e) {
              console.error('Erro no pinterest:', e.message);
              await sock.sendMessage(from, { text: '❌ Não achei nenhuma imagem de *' + busca + '*! Tente outra pesquisa.' }, { quoted: msg });
            }
          }
          return
    }
  }
};
