// Gerado de index.js (case 'ship', linha 13124)
export default {
  nomes: ["ship","corno","gay","gostosa","gostoso","feio","bonito","bonita","rico","pobre","gado","safado","safada","chato","louco","louca","sortudo","sortuda","azarado","azarada","pau","bunda","chifre","inteligente","burro","burra"],
  async executar(__x) {
    const { canonicoCmd, enviarPorcentagem, command, msg, sender, sock, from } = Object.assign({}, __x.utils, __x);
    {
{
            const cmdPct = canonicoCmd(command);
            const cmdFinal = cmdPct === 'bonita' ? 'bonito'
                           : cmdPct === 'safada' ? 'safado'
                           : cmdPct === 'louca' ? 'louco'
                           : cmdPct === 'sortuda' ? 'sortudo'
                           : cmdPct === 'azarada' ? 'azarado'
                           : cmdPct === 'burra' ? 'burro'
                           : cmdPct;
            const ctxPct = msg.message.extendedTextMessage?.contextInfo;
            const mencoesPct = ctxPct?.mentionedJid || [];
            const alvoPct = mencoesPct[0] || ctxPct?.participant || sender;
            await enviarPorcentagem(sock, from, msg, cmdFinal, alvoPct, sender);
          }
          return
    }
  }
};
