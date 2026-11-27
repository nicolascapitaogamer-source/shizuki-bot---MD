// Gerado de index.js (case 'cla', linha 14079)
export default {
  nomes: ["cla"],
  async executar(__x) {
    const { eVIP, faccaoDoUsuario, listarFaccoesDoGrupo, FACCAO_MAX_POR_GRUPO, gerarIdFaccao, carregarFaccoes, salvarFaccoes, FACCAO_MAX_MEMBROS, carregarConvites, salvarConvites, shizukiUser, salvarShizuki, carregarSaidas, salvarSaidas, carregarGuerras, salvarGuerras, sender, isDono, sock, from, msg, isGroup, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIPs, líderes e dono podem usar facções!' }, { quoted: msg }); return }
            if (!isGroup) { await sock.sendMessage(from, { text: '❌ Só em grupos!' }, { quoted: msg }); return }
            const sub = (args[0] || '').toLowerCase();
            const rest = args.slice(1);

            // ── !cla criar <nome> ──
            if (sub === 'criar') {
              if (!eVIP(sender) && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas VIPs podem criar facções!' }, { quoted: msg }); return }
              const nomeF = rest.join(' ').trim();
              if (!nomeF) { await sock.sendMessage(from, { text: '⚠️ Use: *!cla criar <nome>*' }, { quoted: msg }); return }
              if (nomeF.length > 20) { await sock.sendMessage(from, { text: '⚠️ Nome muito grande! Máx 20 chars.' }, { quoted: msg }); return }
              const existente = faccaoDoUsuario(from, sender);
              if (existente) { await sock.sendMessage(from, { text: '⚠️ Você já tá na facção *' + existente.nome + '*!' }, { quoted: msg }); return }
              const todas = listarFaccoesDoGrupo(from);
              if (todas.length >= FACCAO_MAX_POR_GRUPO) { await sock.sendMessage(from, { text: '⚠️ Já tem 5 facções neste grupo!' }, { quoted: msg }); return }
              const idF = gerarIdFaccao();
              const dbF = carregarFaccoes();
              dbF[idF] = {
                id: idF,
                nome: nomeF,
                grupo: from,
                lider: sender,
                membros: [sender],
                caixa: 0,
                vitorias: 0,
                derrotas: 0,
                guerrasSeguidas: 0,
                criadaEm: Date.now()
              };
              salvarFaccoes(dbF);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏴 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 𝐂𝐑𝐈𝐀𝐃𝐀 🏴 〕━━━╮\n┃\n┃ ✅ Facção criada com sucesso!\n┃\n┃ 🏴 Nome: *' + nomeF + '*\n┃ 👑 Líder: @' + sender.split('@')[0] + '\n┃ 👥 Membros: *1/' + FACCAO_MAX_MEMBROS + '*\n┃ 💰 Caixa: *R$ 0*\n┃\n┃ 💡 Use: *!cla convidar @pessoa*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
              return
            }

            // ── !cla convidar @pessoa ──
            if (sub === 'convidar') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              if (f.lider !== sender) { await sock.sendMessage(from, { text: '🚫 Apenas o líder pode convidar!' }, { quoted: msg }); return }
              if (f.membros.length >= FACCAO_MAX_MEMBROS) { await sock.sendMessage(from, { text: '⚠️ Facção cheia (' + FACCAO_MAX_MEMBROS + '/' + FACCAO_MAX_MEMBROS + ')!' }, { quoted: msg }); return }
              const ctx = msg.message.extendedTextMessage?.contextInfo;
              const alvo = ctx?.mentionedJid?.[0] || ctx?.participant;
              if (!alvo) { await sock.sendMessage(from, { text: '⚠️ Marque alguém!\n\nEx: *!cla convidar @pessoa*' }, { quoted: msg }); return }
              if (f.membros.includes(alvo)) { await sock.sendMessage(from, { text: '⚠️ Essa pessoa já tá na facção!' }, { quoted: msg }); return }
              const jaTem = faccaoDoUsuario(from, alvo);
              if (jaTem) { await sock.sendMessage(from, { text: '⚠️ Essa pessoa já tá em outra facção!' }, { quoted: msg }); return }
              const dbC = carregarConvites();
              const idConv = gerarIdFaccao();
              dbC[idConv] = { id: idConv, faccaoId: f.id, de: sender, para: alvo, grupo: from, criadoEm: Date.now() };
              salvarConvites(dbC);
              const msgEnv = await sock.sendMessage(from, {
                text: '╭━━━〔 🏴 𝐂𝐎𝐍𝐕𝐈𝐓𝐄 🏴 〕━━━╮\n┃\n┃ 📩 @' + alvo.split('@')[0] + ' foi convidado(a)!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👑 Líder: @' + sender.split('@')[0] + '\n┃\n┃ 🎯 Aceita entrar?\n┃    ┣ ✅ Marque esta mensagem\n┃    ┃    e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [alvo, sender]
              }, { quoted: msg });
              dbC[idConv].stanzaId = msgEnv?.key?.id;
              salvarConvites(dbC);
              return
            }

            // ── !cla info ──
            if (sub === 'info') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              const dataF = new Date(f.criadaEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏴 ' + f.nome.toUpperCase() + ' 🏴 〕━━━╮\n┃\n┃ 📊 ID: *' + (f.numero || '???') + '*\n┃ 👑 Líder: @' + f.lider.split('@')[0] + '\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃ 💰 Caixa: *R$ ' + f.caixa + '*\n┃\n┃ ⚔️ Guerras:\n┃    ┣ 🏆 Vitórias: ' + f.vitorias + '\n┃    ┗ 💀 Derrotas: ' + f.derrotas + '\n┃\n┃ 📅 Criada em: ' + dataF + '\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [f.lider]
              }, { quoted: msg });
              return
            }

            // ── !cla membros ──
            if (sub === 'membros') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              let txt = '╭━━━〔 🏴 ' + f.nome.toUpperCase() + ' 🏴 〕━━━╮\n┃\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃\n';
              f.membros.forEach((jid, i) => {
                const isLid = jid === f.lider ? ' 👑' : '';
                txt += '┃ ' + (i + 1) + '. @' + jid.split('@')[0] + isLid + '\n';
              });
              txt += '┃\n╰━━━━━━━━━━━━━━━━━━╯';
              await sock.sendMessage(from, { text: txt, mentions: f.membros }, { quoted: msg });
              return
            }

            // ── !cla depositar <valor> ──
            if (sub === 'depositar') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              const valorDep = parseInt(rest[0], 10);
              if (!valorDep || valorDep < 1) { await sock.sendMessage(from, { text: '⚠️ Use: *!cla depositar <valor>*' }, { quoted: msg }); return }
              const uDep = shizukiUser(sender);
              if (uDep.reais < valorDep) { await sock.sendMessage(from, { text: '💸 Você não tem *R$ ' + valorDep + '*!\n💰 Seu saldo: *R$ ' + uDep.reais + '*', mentions: [sender] }, { quoted: msg }); return }
              uDep.reais -= valorDep;
              salvarShizuki(sender, uDep);
              const dbFDep = carregarFaccoes();
              dbFDep[f.id].caixa += valorDep;
              salvarFaccoes(dbFDep);
              await sock.sendMessage(from, {
                text: '╭━━━〔 💰 𝐃𝐄𝐏𝐎́𝐒𝐈𝐓𝐎 🏴 〕━━━╮\n┃\n┃ ✅ Depositado com sucesso!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 💰 Valor: *R$ ' + valorDep + '*\n┃ 💼 Seu saldo: *R$ ' + uDep.reais + '*\n┃ 🏦 Caixa da facção: *R$ ' + dbFDep[f.id].caixa + '*\n┃\n┃ 💜 Valeu pela contribuição!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender]
              }, { quoted: msg });
              return
            }

            // ── !cla caixa ──
            if (sub === 'caixa') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              await sock.sendMessage(from, {
                text: '╭━━━〔 🏦 𝐂𝐀𝐈𝐗𝐀 🏴 〕━━━╮\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃\n┃ 💰 Caixa atual: *R$ ' + f.caixa + '*\n┃ 👥 Membros: *' + f.membros.length + '/' + FACCAO_MAX_MEMBROS + '*\n┃ 👑 Líder: @' + f.lider.split('@')[0] + '\n┃\n┃ 💡 Use: *!cla depositar <valor>*\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [f.lider]
              }, { quoted: msg });
              return
            }

            // ── !cla sair ──
            if (sub === 'sair') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              if (f.lider === sender) {
                const dbFD = carregarFaccoes();
                const membrosRestantes = f.membros.filter(m => m !== sender);
                delete dbFD[f.id];
                salvarFaccoes(dbFD);
                await sock.sendMessage(from, {
                  text: '╭━━━〔 🚪 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 𝐃𝐈𝐒𝐒𝐎𝐋𝐕𝐈𝐃𝐀 🏴 〕━━━╮\n┃\n┃ ⚠️ O líder saiu!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👤 Líder: @' + sender.split('@')[0] + '\n┃ 👥 Membros dispensados: *' + membrosRestantes.length + '*\n┃\n┃ 💜 A facção foi dissolvida!\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                  mentions: [sender, ...membrosRestantes]
                }, { quoted: msg });
                return
              }
              const dbSai = carregarSaidas();
              const idSai = 'sai_' + Date.now();
              const msgSai = await sock.sendMessage(from, {
                text: '╭━━━〔 🚪 𝐒𝐀𝐈𝐑 𝐃𝐀 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 🏴 〕━━━╮\n┃\n┃ ⚠️ @' + sender.split('@')[0] + ' quer sair!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👑 Líder: @' + f.lider.split('@')[0] + '\n┃\n┃ 📝 @' + f.lider.split('@')[0] + ', aprova?\n┃    ┣ ✅ Marque e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, f.lider]
              }, { quoted: msg });
              dbSai[idSai] = { id: idSai, faccaoId: f.id, quemSai: sender, lider: f.lider, stanzaId: msgSai?.key?.id, grupo: from, criadoEm: Date.now() };
              salvarSaidas(dbSai);
              return
            }

            // ── !cla ranking ──
            if (sub === 'ranking') {
              const dbR = carregarFaccoes();
              const todas = Object.values(dbR).sort((a, b) => b.caixa - a.caixa).slice(0, 10);
              if (!todas.length) { await sock.sendMessage(from, { text: 'ℹ️ Nenhuma facção criada ainda!' }, { quoted: msg }); return }
              const meds = ['🥇', '🥈', '🥉'];
              let txtR = '╭━━━〔 🏆 𝐑𝐀𝐍𝐊𝐈𝐍𝐆 𝐅𝐀𝐂𝐂̧𝐎̃𝐄𝐒 🏆 〕━━━╮\n┃\n';
              todas.forEach((f, i) => {
                const med = meds[i] || (i + 1) + '️⃣';
                txtR += '┃ ' + med + ' *' + f.nome + '*\n┃    💰 R$ ' + f.caixa + ' | 👥 ' + f.membros.length + ' membros\n┃\n';
              });
              txtR += '┃ 💜 Total: *' + Object.keys(dbR).length + ' facções*\n┃\n╰━━━━━━━━━━━━━━━━━━╯';
              await sock.sendMessage(from, { text: txtR }, { quoted: msg });
              return
            }

            // ── !cla guerra @faccao <valor> ──
            // ── !cla guerra <id_faccao> <valor> ──
            if (sub === 'guerra') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              if (f.lider !== sender) { await sock.sendMessage(from, { text: '🚫 Apenas o líder pode declarar guerra!' }, { quoted: msg }); return }
              const idAlvo = (rest[0] || '').replace('#', '').trim();
              if (!idAlvo) { await sock.sendMessage(from, { text: '⚠️ Use: *!cla guerra <id> <valor>*\n\nEx: *!cla guerra 002 200*' }, { quoted: msg }); return }
              const dbGuerra = carregarFaccoes();
              const fAlvo = Object.values(dbGuerra).find(x => x.numero === idAlvo && x.grupo === from);
              if (!fAlvo) { await sock.sendMessage(from, { text: '❌ Facção de ID *' + idAlvo + '* não encontrada!' }, { quoted: msg }); return }
              if (fAlvo.id === f.id) { await sock.sendMessage(from, { text: '⚠️ Não pode guerrear contra si mesmo!' }, { quoted: msg }); return }
              const valorG = parseInt(rest.find(a => /^\d+$/.test(a) && a !== idAlvo) || '0', 10);
              if (!valorG || valorG < 60 || valorG > 999) { await sock.sendMessage(from, { text: '⚠️ Aposta inválida! Mín: *60* Máx: *999*' }, { quoted: msg }); return }
              if (f.caixa < valorG) { await sock.sendMessage(from, { text: '💸 Sua facção não tem *R$ ' + valorG + '* no caixa!\n💰 Caixa: *R$ ' + f.caixa + '*' }, { quoted: msg }); return }
              if (fAlvo.caixa < valorG) { await sock.sendMessage(from, { text: '💸 A facção alvo não tem *R$ ' + valorG + '* no caixa!' }, { quoted: msg }); return }
              const dbG = carregarGuerras();
              const idG = 'guerra_' + Date.now();
              const msgG = await sock.sendMessage(from, {
                text: '╭━━━〔 ⚔️ 𝐆𝐔𝐄𝐑𝐑𝐀 𝐃𝐄𝐂𝐋𝐀𝐑𝐀𝐃𝐀 ⚔️ 〕━━━╮\n┃\n┃ 🏴 *' + f.nome + '* (' + (f.numero || '?') + ')\n┃    declarou guerra!\n┃\n┃ 🏴 *' + fAlvo.nome + '* (' + (fAlvo.numero || '?') + ')\n┃    foi desafiada!\n┃\n┃ 💰 Aposta: *R$ ' + valorG + '*\n┃ ⚔️ Luta: *3 vs 3*\n┃\n┃ 🎯 @' + fAlvo.lider.split('@')[0] + ', aceita?\n┃    ┣ ✅ Marque e responda *sim*\n┃    ┗ ❌ Ou responda *nao*\n┃\n┃ ⏰ 2 minutos\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, fAlvo.lider]
              }, { quoted: msg });
              dbG[idG] = { id: idG, faccao1: f.id, faccao2: fAlvo.id, valor: valorG, stanzaId: msgG?.key?.id, grupo: from, criadoEm: Date.now() };
              salvarGuerras(dbG);
              return
            }
            // ── !cla dissolver ──
            if (sub === 'dissolver') {
              const f = faccaoDoUsuario(from, sender);
              if (!f) { await sock.sendMessage(from, { text: '❌ Você não tá em nenhuma facção!' }, { quoted: msg }); return }
              if (f.lider !== sender && !isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o líder pode dissolver!' }, { quoted: msg }); return }
              const totalMembros = f.membros.length;
              const valorPorMembro = totalMembros > 0 ? Math.floor(f.caixa / totalMembros) : 0;
              for (const m of f.membros) {
                if (valorPorMembro > 0) {
                  const uM = shizukiUser(m);
                  uM.reais += valorPorMembro;
                  salvarShizuki(m, uM);
                }
              }
              const dbFd = carregarFaccoes();
              delete dbFd[f.id];
              salvarFaccoes(dbFd);
              await sock.sendMessage(from, {
                text: '╭━━━〔 🗑️ 𝐅𝐀𝐂𝐂̧𝐀̃𝐎 𝐃𝐈𝐒𝐒𝐎𝐋𝐕𝐈𝐃𝐀 🗑️ 〕━━━╮\n┃\n┃ ⚠️ A facção foi dissolvida!\n┃\n┃ 🏴 Facção: *' + f.nome + '*\n┃ 👑 Líder: @' + sender.split('@')[0] + '\n┃ 👥 Membros: *' + totalMembros + '*\n┃ 💰 Caixa: *R$ ' + f.caixa + '*\n┃ 💵 Cada um recebeu: *R$ ' + valorPorMembro + '*\n┃\n┃ 💜 Fim de uma era...\n┃\n╰━━━━━━━━━━━━━━━━━━╯',
                mentions: [sender, ...f.membros]
              }, { quoted: msg });
              return
            }
            // (sem ajuda — subcomando inválido)
          }
          return
    }
  }
};
