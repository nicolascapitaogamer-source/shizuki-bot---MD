// Gerado de index.js (case 'menushizuki', linha 5536)
export default {
  nomes: ["menushizuki"],
  async executar(__x) {
    const { carregarJSON, getPrefixo, fs, MENU_IMAGE_PATH, isGroup, from, sender, isDono, sock, msg } = Object.assign({}, __x.utils, __x);
    {
{
            const dbModo = carregarJSON('./modo_shizuki.json') || {};
            let isAdmGrupo = false;
            if (isGroup) {
              try {
                const metadata = await globalThis.__getGroupMetadata(from);
                const part = metadata.participants.find(p => p.id === sender || p.id.split('@')[0] === sender.split('@')[0]);
                isAdmGrupo = part?.admin === 'admin' || part?.admin === 'superadmin';
              } catch (e) {}
            }
            
            // O bloqueio agora checa o status daquele grupo específico (dbModo[from])
            if (dbModo[from] === false && !isDono && !isAdmGrupo) {
              await sock.sendMessage(from, { text: '╭─────────────────────╮\n   🔒 𝐁𝐋𝐎𝐐𝐔𝐄𝐀𝐃𝐎 🔒\n╰─────────────────────╯\n\n⚠️ O Modo RPG está *DESATIVADO* neste grupo!\n💡 _Chame um administrador para ativar usando !modoshizuki._\n\n╰━━━━━━━━━━━━━━━━━━⬣' }, { quoted: msg });
              return
            }

            const prefixoAtual = getPrefixo(from);
            const menuShizuki =
              '╭─────────────────────╮\n\n' +
              '🌷 Oii @' + sender.split('@')[0] + '! Eu sou a *Shizuki* 🌸\n' +
              '✨ Bem-vindo(a) ao mundo de *Shizuki City*! (๑>ᴗ<๑)\n\n' +
              '╭─〔 🏯 *MENU SHIZUKI* 〕━━━━⬣\n' +
              '┃\n' +
              '┃ 👤 *CIDADÃO*\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'shizukicity\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'rankingshizuki\n' +
              '┃ 🌷◗ ' + prefixoAtual + 'perfil\n' +
              '┃\n' +
              '┃ 💼 *TRABALHO*\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'empregos\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'fazerprova\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'trabalhar\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'dormir\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'promocao\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'demitir\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'ferias\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'segundotrabalho\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'investir <valor>\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'resgatar\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'empresa <nome>\n' +
              '┃ 🌱◗ ' + prefixoAtual + 'aposentar\n' +
              '┃\n' +
              '┃ 💍 *RELACIONAMENTOS*\n' +
              '┃ 💞◗ ' + prefixoAtual + 'pedirnamoro @pessoa\n' +
              '┃ 💞◗ ' + prefixoAtual + 'terminar\n' +
              '┃ 💞◗ ' + prefixoAtual + 'casar @pessoa\n' +
              '┃ 💞◗ ' + prefixoAtual + 'divorciar\n' +
              '┃ 💞◗ ' + prefixoAtual + 'criarfamilia @pessoa [sobrenome]\n' +
              '┃ 💞◗ ' + prefixoAtual + 'adotar @pessoa\n' +
              '┃ 💞◗ ' + prefixoAtual + 'meusfilhos\n' +
              '┃ 💞◗ ' + prefixoAtual + 'mudarnome <nome>\n' +
              '┃ 💞◗ ' + prefixoAtual + 'pensao\n' +
              '┃ 💞◗ ' + prefixoAtual + 'minhadupla\n' +
              '┃ 💞◗ ' + prefixoAtual + 'arvoregeneologica\n' +
              '┃\n' +
              '┃ 🏠 *MORADIA*\n' +
              '┃ 🏡◗ ' + prefixoAtual + 'casas\n' +
              '┃ 🏡◗ ' + prefixoAtual + 'comprarcasa <id>\n' +
              '┃ 🏡◗ ' + prefixoAtual + 'alugarcasa <id>\n' +
              '┃ 🏡◗ ' + prefixoAtual + 'minhacasa\n' +
              '┃\n' +
              '┃ 🎉 *EVENTOS*\n' +
              '┃ 🎊◗ ' + prefixoAtual + 'balada\n' +
              '┃ 🎊◗ ' + prefixoAtual + 'aniversario DD/MM\n' +
              '┃ 🎊◗ ' + prefixoAtual + 'ativareventos\n' +
              '┃ 🎊◗ ' + prefixoAtual + 'desativareventos\n' +
              '┃\n' +
              '┃ 🎣 *PESCARIA*\n' +
              '┃ 🐟◗ ' + prefixoAtual + 'pescar\n' +
              '┃ 🐟◗ ' + prefixoAtual + 'minerar\n' +
              '┃ 🐟◗ ' + prefixoAtual + 'corrida <1-5> <valor>\n' +
              '┃\n' +
              '┃ 🎮 *DIVERSÃO*\n' +
              '┃ 🎲◗ ' + prefixoAtual + 'loteria\n' +
              '┃ 🎲◗ ' + prefixoAtual + 'roubar @pessoa\n' +
              '┃ 🎲◗ ' + prefixoAtual + 'assaltar\n' +
              '┃ 🎲◗ ' + prefixoAtual + 'sequestrar @pessoa\n' +
              '┃\n' +
              '┃ 🏪 *ECONOMIA*\n' +
              '┃ 💰◗ ' + prefixoAtual + 'banco\n' +
              '┃ 💰◗ ' + prefixoAtual + 'emprestar @pessoa <valor>\n' +
              '┃ 💰◗ ' + prefixoAtual + 'transferir @pessoa <valor>\n' +
              '┃ 💰◗ ' + prefixoAtual + 'comprarloja\n' +
              '┃ 💰◗ ' + prefixoAtual + 'meusveiculos\n' +
              '┃ 💰◗ ' + prefixoAtual + 'arrumar <veiculo>\n' +
              '┃ 💰◗ ' + prefixoAtual + 'vender <item>\n' +
              '┃\n' +
              '┃ 🏛️ *PRESIDÊNCIA*\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'presidente\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'eleicao\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'resultado\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'candidatos\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'candidatar\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'enviarproposta <texto>\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'minhaspropostas\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'votar <id>\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'avaliar sim/nao\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'meuvoto\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'proporlei <texto>\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'minhasleis\n' +
              '┃ 🗳️◗ ' + prefixoAtual + 'renunciar\n' +
              '┃\n' +
              '╰━━━━━━━━━━━━━━━━━━⬣\n' +
              '╰─────────────────────╯';

            if (fs.existsSync(MENU_IMAGE_PATH)) {
              try {
                await sock.sendMessage(from, { image: fs.readFileSync(MENU_IMAGE_PATH), caption: menuShizuki, mentions: [sender] }, { quoted: msg });
              } catch (e) {
                await sock.sendMessage(from, { text: menuShizuki, mentions: [sender] }, { quoted: msg });
              }
            } else {
              await sock.sendMessage(from, { text: menuShizuki, mentions: [sender] }, { quoted: msg });
            }
          }
          return
    }
  }
};
