// Gerado de index.js (case 'ping', linha 10985)
export default {
  nomes: ["ping"],
  async executar(__x) {
    const { textoPingProgresso, esperarPing, textoPingFinal, msg, sock, from, config } = Object.assign({}, __x.utils, __x);
    {
{
            const tIniPing = Date.now();
            let tsPing = msg.messageTimestamp;
            if (tsPing && typeof tsPing === 'object' && typeof tsPing.toNumber === 'function') tsPing = tsPing.toNumber();
            tsPing = Number(tsPing);

            const dadosPing = {
              recebe: tsPing ? Math.max(0, tIniPing - tsPing * 1000) : null,
              envio: null,
              edicao: null,
              internet: null
            };

            let enviadoPing;
            try {
              const t1 = Date.now();
              enviadoPing = await sock.sendMessage(from, { text: textoPingProgresso(0, '🔎 Iniciando medição...') }, { quoted: msg });
              dadosPing.envio = Date.now() - t1;
            } catch (err) {
              console.error('Erro no comando !ping:', err);
              return
            }

            let podeEditarPing = !!(enviadoPing && enviadoPing.key);
            const temposEdicao = [];
            const editarPing = async (texto) => {
              if (!podeEditarPing) return null;
              try {
                const t = Date.now();
                await sock.sendMessage(from, { text: texto, edit: enviadoPing.key });
                return Date.now() - t;
              } catch (e) {
                podeEditarPing = false;
                return null;
              }
            };

            await esperarPing(400);
            let rPing = await editarPing(textoPingProgresso(25, '📤 Medindo latência de envio...'));
            if (rPing !== null) temposEdicao.push(rPing);

            await esperarPing(400);
            rPing = await editarPing(textoPingProgresso(50, '🌐 Testando conexão com a internet...'));
            if (rPing !== null) temposEdicao.push(rPing);
            try {
              const tNet = Date.now();
              await fetch('https://www.google.com/generate_204', { signal: AbortSignal.timeout(5000) });
              dadosPing.internet = Date.now() - tNet;
            } catch (e) {}

            await esperarPing(300);
            rPing = await editarPing(textoPingProgresso(75, '🧠 Lendo memória e processador...'));
            if (rPing !== null) temposEdicao.push(rPing);

            if (temposEdicao.length) {
              dadosPing.edicao = Math.round(temposEdicao.reduce((a, b) => a + b, 0) / temposEdicao.length);
            }

            await esperarPing(300);
            const textoFinalPing = textoPingFinal(dadosPing, config.nomeBot);
            const okFinalPing = await editarPing(textoFinalPing);
            if (okFinalPing === null) {
              await sock.sendMessage(from, { text: textoFinalPing }, { quoted: msg });
            }
          }
          return
    }
  }
};
