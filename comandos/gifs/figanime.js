// Gerado de index.js (case 'figanime', linha 8699)
export default {
  nomes: ["figanime"],
  async executar(__x) {
    const { eVIP, montarMarca, criarSticker, sender, isDono, sock, from, msg, args, isGroup, pushName } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) {
              await sock.sendMessage(from, {
                text: '╭━━━〔 🚫 𝐀𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐃𝐎 🚫 〕━━━╮\n┃\n┃ 💔 Este comando é exclusivo\n┃    pra membros *VIP*.\n┃\n┃ 💡 Fale com o dono pra adquirir.\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸'
              }, { quoted: msg });
              return
            }

            const qtd = parseInt(args[0], 10);
            if (!qtd || qtd < 1 || qtd > 5) {
              await sock.sendMessage(from, {
                text: '╭━━━〔 ⚠️ 𝐂𝐎𝐌𝐎 𝐔𝐒𝐀𝐑 ⚠️ 〕━━━╮\n┃\n┃ ❌ Informe a quantidade!\n┃\n┃ 📝 Use: *!figanime <qtd>*\n┃ 💡 Ex: *!figanime 3*\n┃ ⚠️ Mínimo: 1 | Máximo: 5\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸'
              }, { quoted: msg });
              return
            }

            await sock.sendMessage(from, { text: '🎨 *Gerando ' + qtd + ' figurinha(s)...*\n💜 Aguarde só um instante ⏳' }, { quoted: msg });

            let sucesso = 0;
            let falhas = 0;

            for (let i = 0; i < qtd; i++) {
              try {
                let imgBuf = null;
                const cat = ['neko', 'waifu', 'kitsune'][Math.floor(Math.random() * 3)];
                try {
                  const r = await fetch('https://nekos.best/api/v2/' + cat, { signal: AbortSignal.timeout(10000) });
                  const j = await r.json();
                  if (j.results && j.results[0] && j.results[0].url) {
                    imgBuf = await fetch(j.results[0].url, { signal: AbortSignal.timeout(15000) }).then(res => res.arrayBuffer());
                  }
                } catch (e) {}

                if (!imgBuf) throw new Error('Sem imagem');

                const buffer = Buffer.from(imgBuf);
        const [pack, autor] = await montarMarca(sock, from, isGroup, pushName);
                const stickerBuf = await criarSticker(buffer, false, pack, autor);

                await sock.sendMessage(from, { sticker: stickerBuf }, { quoted: msg });
                sucesso++;
                await new Promise(r => setTimeout(r, 1000));
              } catch (e) {
                console.error('Erro figurinha:', e.message);
                falhas++;
              }
            }

            await sock.sendMessage(from, {
              text: '╭━━━〔 ✅ 𝐅𝐈𝐆𝐔𝐑𝐈𝐍𝐇𝐀𝐒 𝐏𝐑𝐎𝐍𝐓𝐀𝐒 ✅ 〕━━━╮\n┃\n┃ 💜 Enviei *' + sucesso + '* figurinha(s)!\n' + (falhas > 0 ? '┃ ⚠️ Falharam: *' + falhas + '*\n' : '') + '┃ 🎁 Aproveite suas figurinhas VIP!\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n🌸 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃 🌸'
            }, { quoted: msg });
          }
          return
    }
  }
};
