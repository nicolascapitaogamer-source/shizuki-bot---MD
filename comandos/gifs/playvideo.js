// Gerado de index.js (case 'playvideo', linha 7860)
export default {
  nomes: ["playvideo","play_video","playmp4"],
  async executar(__x) {
    const { carregarConfig, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            const cfgPV = carregarConfig();
            if (!cfgPV.apiKey) {
              await sock.sendMessage(from, { text: '❌ Configure a API com *!api SUA_CHAVE* primeiro!' }, { quoted: msg });
              return
            }
            const buscaPV = args.join(' ').trim();
            if (!buscaPV) {
              await sock.sendMessage(from, { text: '🎬 *PLAYVIDEO*\n\n⚠️ Manda o nome do vídeo!\n\n📝 Ex: *!playvideo funk 2024*\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
              return
            }
            await sock.sendMessage(from, { text: '🎬 *PLAYVIDEO*\n\n🔎 Buscando: ' + buscaPV + '\n📡 Conectando...\n⏳ Procurando vídeo\n\n💜 _Aguarde~_\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            try {
              const rBuscaPV = await fetch('https://api.bronxyshost.com.br/api-bronxys/pesquisa_ytb?nome=' + encodeURIComponent(buscaPV) + '&apikey=' + cfgPV.apiKey, { signal: AbortSignal.timeout(60000) });
              const jBuscaPV = await rBuscaPV.json();
              if (!jBuscaPV || !jBuscaPV[0]) throw new Error('Nada encontrado');
              const infoPV = jBuscaPV[0];
              const tempoPV = infoPV.tempo || '0:00';
              const partesT = tempoPV.split(':').map(x => parseInt(x, 10));
              let minutosTotal = 0;
              if (partesT.length === 3) minutosTotal = partesT[0] * 60 + partesT[1];
              else if (partesT.length === 2) minutosTotal = partesT[0];
              if (minutosTotal > 20) {
                await sock.sendMessage(from, { text: '⏰ *VÍDEO MUITO LONGO!*\n\n⏱️ Duração: ' + tempoPV + '\n📏 Limite: 20:00\n\n💜 Tenta um mais curto!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
                return
              }
              let legendaPV = '🎬 *VÍDEO ENCONTRADO!*\n\n🎬 Título:\n_' + (infoPV.titulo || 'Sem título') + '_\n\n⏱️ Duração: ' + tempoPV + '\n📅 Postado: ' + (infoPV.postado || '?') + '\n\n⏳ Baixando o vídeo...\n\n🌸 Shizuki Bot - MD 🌸';
              try {
                await sock.sendMessage(from, { image: { url: infoPV.thumb }, caption: legendaPV }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: legendaPV }, { quoted: msg });
              }
              const rPV = await fetch('https://api.bronxyshost.com.br/api-bronxys/play_video?nome_url=' + encodeURIComponent(buscaPV) + '&apikey=' + cfgPV.apiKey, { signal: AbortSignal.timeout(180000) });
              const bufPV = Buffer.from(await rPV.arrayBuffer());
              if (!bufPV || bufPV.length < 1000) throw new Error('Vídeo vazio');
              const tamPV = (bufPV.length / 1024 / 1024).toFixed(2);
              if (bufPV.length > 64 * 1024 * 1024) {
                await sock.sendMessage(from, { text: '🐘 *VÍDEO MUITO GRANDE!*\n\n📦 Tamanho: ' + tamPV + ' MB\n📏 Limite: 64 MB\n\n💜 Escolhe outro!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
                return
              }
              await sock.sendMessage(from, { video: bufPV, mimetype: 'video/mp4', fileName: (infoPV.titulo || 'video').slice(0, 50) + '.mp4', caption: '✅ *VÍDEO BAIXADO!*\n\n🎬 _' + (infoPV.titulo || 'Vídeo') + '_\n\n⏱️ ' + tempoPV + '\n📦 ' + tamPV + ' MB\n\n💜 Curtiu? Compartilha!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            } catch (errPV) {
              console.error('Erro playvideo:', errPV.message);
              await sock.sendMessage(from, { text: '❌ *VÍDEO NÃO ENCONTRADO*\n\n💡 Possíveis motivos:\n• Nome errado\n• Vídeo removido\n• Bloqueio de região\n\n💜 Tenta outro nome!\n\n🌸 Shizuki Bot - MD 🌸' }, { quoted: msg });
            }
          }
          return
    }
  }
};
