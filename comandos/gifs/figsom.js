// Gerado de index.js (case 'figsom', linha 8438)
export default {
  nomes: ["figsom","figvideo","figaudio","figurinhasom","audiosticker"],
  async executar(__x) {
    const { sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const mf = await import('../.././figsom.js');
            await mf.executar({ sock, from, msg });
          }
          return
    }
  }
};
