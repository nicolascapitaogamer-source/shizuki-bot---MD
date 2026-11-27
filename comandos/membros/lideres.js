// Gerado de index.js (case 'lideres', linha 11919)
export default {
  nomes: ["lideres","líderes"],
  async executar(__x) {
    const { config, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const slotsL = Array.from({ length: 6 }, (_, i) => (config.lideres || [])[i] || null);
            const donoStrL = String(config.numeroDono);
            const donoJidL = donoStrL.includes('@') ? donoStrL : `${donoStrL}@s.whatsapp.net`;
            const numerosL = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'];

            let textoL =
              `╭───〔 👑 *LÍDERES* 〕───╮\n` +
              `│\n` +
              `│  ♛ *Dono* ➜ @${donoJidL.split('@')[0]}\n` +
              `│  ↳ Controle total do bot\n` +
              `│\n` +
              `├─────────────── ◈\n` +
              `│\n`;
            slotsL.forEach((j, i) => {
              textoL += `│  ${numerosL[i]} *Líder ${i + 1}* ➜ ${j ? '@' + j.split('@')[0] : '『 Vaga livre 』'}\n`;
            });
            textoL +=
              `│\n` +
              `├─────────────── ◈\n` +
              `│\n` +
              `│  ℹ️ Líderes têm os mesmos poderes do dono.\n` +
              `│  ➕ Adicionar: !lider1 até !lider6 (marcando a pessoa)\n` +
              `│  ➖ Remover: !rmlider1 até !rmlider6\n` +
              `│\n` +
              `╰───────────────────╯`;

            await sock.sendMessage(from, {
              text: textoL,
              mentions: [donoJidL, ...slotsL.filter(Boolean)]
            }, { quoted: msg });
          }
          return
    }
  }
};
