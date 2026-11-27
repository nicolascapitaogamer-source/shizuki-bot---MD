// Gerado de index.js (case 'minhacasa', linha 7460)
export default {
  nomes: ["minhacasa"],
  async executar(__x) {
    const { shizukiUser, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const u = shizukiUser(sender);
            if (!u.casa) {
              await sock.sendMessage(from, { text: '❌ Você ainda não tem casa!\n\nUse *!casas* pra ver a lista.' }, { quoted: msg });
              return
            }
            const nomes = { barraco: 'Barraco', simples: 'Casa Simples', media: 'Casa Média', mansao: 'Mansão', palacio: 'Palácio' };
            const emojis = { barraco: '🏚️', simples: '🏠', media: '🏡', mansao: '🏘️', palacio: '🏰' };
            const info = u.casa.permanente
              ? '✅ Permanente (comprada)'
              : `⏳ Alugada, expira: ${new Date(u.casa.expira).toLocaleString('pt-BR')}`;
            await sock.sendMessage(from, {
              text: `🏠 *MINHA CASA*\n\n${emojis[u.casa.tipo]} *${nomes[u.casa.tipo]}*\n📅 ${info}`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
