// Gerado de index.js (case 'espiao', linha 10896)
export default {
  nomes: ["espiao"],
  async executar(__x) {
    const { carregarJSON, salvarJSON, isDono, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono pode usar isso! 💜' }, { quoted: msg }); return }

            const db = carregarJSON('./logs.json');
            db.__global = db.__global || { ativo: false };
            const sub = (args[0] || '').toLowerCase();

            if (sub === 'on') {
              db.__global.ativo = true;
              salvarJSON('./logs.json', db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🕵️ 𝐄𝐒𝐏𝐈𝐀̃𝐎 〕━━━╮\n┃\n┃ 💜 *Ativado com sucesso~* ✨\n┃\n┃ 👁️ Agora eu vou ficar de\n┃    olho em *TODOS* os\n┃    grupos, tá?\n┃\n┃ 📝 Registrando: mensagens,\n┃    comandos e mídias~ 🎀\n┃\n┃ 💜 Só você (dono) vê!\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else if (sub === 'off') {
              db.__global.ativo = false;
              salvarJSON('./logs.json', db);
              await sock.sendMessage(from, {
                text: `╭━━━〔 🕵️ 𝐄𝐒𝐏𝐈𝐀̃𝐎 〕━━━╮\n┃\n┃ 💤 *Desativado~*\n┃\n┃ 👁️ Fechei os olhos em\n┃    todos os grupos! 🕊️\n┃\n┃ 💜 Os logs já salvos\n┃    ficam com *!verlogs*\n┃\n┃ ✨ Até a próxima~\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            } else {
              const status = db.__global.ativo ? '✅ Ativo' : '❌ Desativado';
              const grupos = Object.keys(db).filter(k => k !== '__global');
              await sock.sendMessage(from, {
                text: `╭━━━〔 🕵️ 𝐄𝐒𝐏𝐈𝐀̃𝐎 〕━━━╮\n┃\n┃ 💜 Como usar:\n┃\n┃ 📝 *!espiao on*\n┃    ➜ Ativa em todos os grupos\n┃\n┃ 📝 *!espiao off*\n┃    ➜ Desativa global\n┃\n┃ 📝 *!verlogs <grupo> [qtd]*\n┃    ➜ Ver logs de um grupo\n┃\n┃ 🔘 Status: *${status}*\n┃ 📊 Grupos salvos: *${grupos.length}*\n┃\n╰━━━━━━━━━━━━━━━━━━╯`
              }, { quoted: msg });
            }
          }
          return
    }
  }
};
