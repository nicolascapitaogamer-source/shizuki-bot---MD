export async function comandosMembros(sock, msg, from, sender, pushName, command, args, config, isDono, isGroup) {
  switch (command) {
    case 'ping':
      await sock.sendMessage(from, { text: '🏓 Pong! (Vindo do arquivo membros.js)' }, { quoted: msg });
      return true;
      
    case 'teste_membros':
      await sock.sendMessage(from, { text: '🌸 O arquivo membros.js tá funcionando!' }, { quoted: msg });
      return true;
  }
  return false;
}