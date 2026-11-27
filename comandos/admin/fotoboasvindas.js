export default {
  nomes: ["fotobemvindo","setwelcome","fotoboasvindas"],
  async executar(__x) {
    const { downloadContentFromMessage, fs, msg, sock, from } = Object.assign({}, __x.utils, __x);
    if (!from.endsWith('@g.us')) {
      await sock.sendMessage(from, { text: 'Use este comando dentro de um grupo.' }, { quoted: msg });
      return;
    }
    const arq = './welcome_gp/' + from.replace(/[^a-zA-Z0-9]/g, '_') + '.jpg';
    const texto = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || '').toLowerCase();

    if (/\bremover\b|\bresetar\b/.test(texto)) {
      if (fs.existsSync(arq)) fs.unlinkSync(arq);
      await sock.sendMessage(from, { text: 'Foto removida. Este grupo voltou a usar a foto padrão.' }, { quoted: msg });
      return;
    }

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const alvo = quotedMsg || msg.message;
    const img = alvo?.imageMessage;
    if (!img) {
      await sock.sendMessage(from, { text: 'Envie ou marque uma *foto* com o comando. Para voltar ao padrão: remover.' }, { quoted: msg });
      return;
    }
    try {
      const stream = await downloadContentFromMessage(img, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      fs.mkdirSync('./welcome_gp', { recursive: true });
      fs.writeFileSync(arq, buffer);
      await sock.sendMessage(from, { text: 'Foto de boas-vindas deste grupo atualizada!' }, { quoted: msg });
    } catch (err) {
      console.error('Erro ao salvar foto de boas-vindas:', err);
      await sock.sendMessage(from, { text: '❌ Erro ao salvar a foto.' }, { quoted: msg });
    }
  }
};
