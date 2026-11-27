// Gerado de index.js (case 'cafune', linha 14322)
export default {
  nomes: ["cafune","mordida_off","colinho","socar","chutar","esfaquear","bater","dancar","cantar"],
  async executar(__x) {
    const { enviarAcao, msg, sock, from, command, sender } = Object.assign({}, __x.utils, __x);
    {
{
            const ctxAc = msg.message.extendedTextMessage?.contextInfo;
            const alvoAc = ctxAc?.mentionedJid?.[0] || ctxAc?.participant;
            if (!alvoAc) {
              await sock.sendMessage(from, { text: '⚠️ Marque alguém com @!\n\nEx: *!' + command + ' @pessoa*' }, { quoted: msg });
              return
            }
            if (alvoAc === sender) {
              await sock.sendMessage(from, { text: '😅 Você não pode fazer isso com si mesmo!' }, { quoted: msg });
              return
            }
            const acFrases = {
              cafune: ['fez carinho na cabeça de', 'acariciou a cabeça de', 'afagou o cabelo de'],
              mordida: ['deu uma mordidinha em', 'mordeu o braço de', 'mordiscou'],
              colinho: ['puxou pra sentar no colo', 'chamou pra sentar no colo'],
              socar: ['deu um soco em', 'acertou um cruzado em', 'socou a cara de'],
              chutar: ['deu um chute em', 'chutou o traseiro de'],
              esfaquear: ['esfaqueou', 'deu uma facada em', 'atacou com a faca'],
              bater: ['bateu em', 'deu um tapa em', 'acertou um tapa em'],
              dancar: ['dançou com', 'chamou pra dançar', 'arrastou pra pista'],
              cantar: ['cantou pra', 'dedicou uma música pra', 'soltou a voz pra']
            };
            const acEmojis = {
              cafune: '👋', mordida: '😈', colinho: '🫂', socar: '👊', chutar: '🦵',
              esfaquear: '🗡️', bater: '👋', dancar: '💃', cantar: '🎤'
            };
            const acTitulos = {
              cafune: 'CAFUNE', mordida: 'MORDIDA', colinho: 'COLINHO', socar: 'SOCO',
              chutar: 'CHUTE', esfaquear: 'ESFAQUEAR', bater: 'TAPA', dancar: 'DANÇA', cantar: 'CANÇÃO'
            };
            const acRodapes = {
              cafune: '🥰 Fofura mil!', mordida: '😳 Ai!', colinho: '💜 Aconchego!',
              socar: '😱 Que pancada!', chutar: '💥 Foi longe!', esfaquear: '💀 Fim!',
              bater: '😬 Doeu!', dancar: '🎶 Que ritmo!', cantar: '🎤 Que voz!'
            };
            const emoji = acEmojis[command] || '✨';
            const titulo = acTitulos[command] || command.toUpperCase();
            const frase = acFrases[command][Math.floor(Math.random() * acFrases[command].length)];
            const rodape = acRodapes[command] || '💜';
            const textoFinal = '╭━━━〔 ' + emoji + ' 𝐀𝐂̧𝐀̃𝐎 ' + titulo + ' ' + emoji + ' 〕━━━╮\n' +
              '┃\n' +
              '┃ @' + sender.split('@')[0] + ' ' + frase + '\n' +
              '┃    @' + alvoAc.split('@')[0] + '!\n' +
              '┃\n' +
              '┃ ' + rodape + '\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━╯';
            await enviarAcao(sock, from, msg, command, textoFinal, [alvoAc, sender]);
          }
          return
    }
  }
};
