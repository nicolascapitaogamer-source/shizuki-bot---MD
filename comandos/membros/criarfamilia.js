// Gerado de index.js (case 'criarfamilia', linha 7102)
export default {
  nomes: ["criarfamilia"],
  async executar(__x) {
    const { shizukiUser, salvarShizuki, msg, args, sock, from, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctx = msg.message.extendedTextMessage?.contextInfo;
            const alvo = ctx?.mentionedJid?.[0];
            const sobrenome = args.filter(a => !a.startsWith('@'))[0];
            if (!alvo || !sobrenome) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém e diga o sobrenome!\n\nEx: `!criarfamilia @pessoa Silva`' }, { quoted: msg });
              return
            }
            const uEu = shizukiUser(sender);
            const uAlvo = shizukiUser(alvo);
            if (uEu.familia) {
              await sock.sendMessage(from, { text: `❌ Você já tem uma família (*${uEu.familia.sobrenome}*)!` }, { quoted: msg });
              return
            }
            if (uAlvo.familia) {
              await sock.sendMessage(from, { text: `❌ @${alvo.split('@')[0]} já tem família!`, mentions: [alvo] }, { quoted: msg });
              return
            }
            const fam = { sobrenome: sobrenome, membros: [sender, alvo] };
            uEu.familia = fam;
            uAlvo.familia = fam;
            salvarShizuki(sender, uEu);
            salvarShizuki(alvo, uAlvo);
            await sock.sendMessage(from, {
              text: `👨‍👩‍👧 *FAMÍLIA CRIADA!* 👨‍👩‍👧\n\n💜 @${sender.split('@')[0]} e @${alvo.split('@')[0]} agora são a família *${sobrenome}*!\n\n🏠 Bem-vindos à nova casa!`,
              mentions: [sender, alvo]
            }, { quoted: msg });
          }
          return
    }
  }
};
