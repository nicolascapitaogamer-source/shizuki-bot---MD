// Gerado de index.js (case 'trocar_dono', linha 5226)
export default {
  nomes: ["trocar_dono"],
  async executar(__x) {
    const { salvarConfig, config, sender, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            config.numeroDono = sender;
            salvarConfig(config);

            await sock.sendMessage(from, { 
              text: `👑 *Dono atualizado com sucesso!*\n\nIdentificador exato salvo: \`${sender}\`\nAgora você é o dono oficial do bot! ✅`,
              mentions: [sender]
            }, { quoted: msg });
          }
          return
    }
  }
};
