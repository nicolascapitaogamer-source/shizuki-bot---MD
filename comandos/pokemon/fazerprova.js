// Gerado de index.js (case 'fazerprova', linha 6872)
export default {
  nomes: ["fazerprova"],
  async executar(__x) {
    const { podeFazerProva, acharEmprego, shizukiUser, salvarShizuki, formatarReais, SHIZUKI_DATA, fs, embaralhar, provasAtivas, __getNumLimpo, enviarPerguntaShizuki, sender, sock, from, msg, args } = Object.assign({}, __x.utils, __x);
    {
{
            if (!podeFazerProva(sender)) {
              await sock.sendMessage(from, { text: '⚠️ Você já tem uma prova rolando!' }, { quoted: msg });
              return
            }
            const empregoId = (args[0] || '').toLowerCase();
            const emprego = acharEmprego(empregoId);
            if (!emprego) {
              await sock.sendMessage(from, { text: '⚠️ Emprego inválido! Use *!empregos* pra ver a lista.' }, { quoted: msg });
              return
            }
            if (emprego.notaMinima === 0) {
              const u = shizukiUser(sender);
              u.emprego = emprego.id;
              salvarShizuki(sender, u);
              await sock.sendMessage(from, {
                text: `🎉 *CONTRATADO!*\n\n${emprego.emoji} Você agora é *${emprego.nome}*!\n💵 Salário: ${formatarReais(emprego.salarioMin)} - ${formatarReais(emprego.salarioMax)}\n\n💡 Use *!trabalhar* pra começar!`,
                mentions: [sender]
              }, { quoted: msg });
              return
            }

            const __norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const banco = Object.assign({}, SHIZUKI_DATA.perguntas);
            try {
              const __ex = JSON.parse(fs.readFileSync('./perguntas_extra.json', 'utf8'));
              for (const k in __ex) {
                if (__norm(emprego.id) === k || __norm(emprego.nome) === k) {
banco.faceis = []; banco.medias = []; banco.dificeis = []; banco[emprego.id] = embaralhar(__ex[k].map(q => ({ ...q, alternativas: embaralhar([...q.alternativas]) })));
                }
              }
            } catch (eEx) { console.log('[prova] extras falhou:', eEx.message); }
            const todasPerguntas = [
              ...embaralhar(banco.faceis || []).slice(0, 2),
              ...embaralhar(banco.medias || []).slice(0, 2),
              ...embaralhar(banco.dificeis || []).slice(0, 1),
              ...embaralhar(banco[emprego.id] || []).slice(0, 2)
            ];
            // Se não completou 7, puxa o resto das perguntas do próprio emprego
            if (todasPerguntas.length < 7) {
              const restantes = (banco[emprego.id] || []).filter(p => !todasPerguntas.includes(p));
              todasPerguntas.push(...restantes.slice(0, 7 - todasPerguntas.length));
            }
            // Se ainda não completou, puxa de qualquer lugar
            while (todasPerguntas.length < 7) {
              const pool = [...(banco.faceis || []), ...(banco.medias || []), ...(banco.dificeis || []), ...(banco[emprego.id] || [])];
              if (pool.length === 0) break;
              todasPerguntas.push(pool[Math.floor(Math.random() * pool.length)]);
            }
            const perguntas = todasPerguntas.slice(0, 7).map(p => {
              let certa = (p && p.r && p.r[0]) ? p.r[0] : "Resposta";
              let alts = (p && p.alternativas && Array.isArray(p.alternativas)) ? p.alternativas : [];
              // Se o JSON tiver menos de 4 alternativas, cria falsas para completar
              if (alts.length < 4) {
                alts = [certa, "Opcao A", "Opcao B", "Opcao C"];
                alts = embaralhar(alts);
              }
              return { p: (p && p.p) ? p.p : "Pergunta", r: [certa], alternativas: alts };
            });
            console.log("DEBUG PROVA: total perguntas =", perguntas.length);

            const prova = {
              empregoId: emprego.id,
              empregoNome: emprego.nome,
              perguntas,
              indice: 0,
              acertos: 0,
              from,
              timer: null
            };
            provasAtivas.set(__getNumLimpo(sender), prova);

            await sock.sendMessage(from, {
              text: `📝 *PROVA INICIADA!*\n\n💼 Cargo: *${emprego.nome}* ${emprego.emoji}\n❓ Perguntas: *7*\n✅ Acertos mínimos: *5*\n⏰ Tempo total: *10 minutos*\n\n🎯 Boa sorte, @${sender.split('@')[0]}!`,
              mentions: [sender]
            }, { quoted: msg });

            await new Promise(r => setTimeout(r, 1500));
            await enviarPerguntaShizuki(sock, from, sender);

            prova.timer = setTimeout(async () => {
              const p = provasAtivas.get(__getNumLimpo(sender));
              if (!p) return;
              provasAtivas.delete(__getNumLimpo(sender));
              await sock.sendMessage(from, {
                text: `⏰ *TEMPO ESGOTADO!*\n\nVocê acertou *${p.acertos}/7*.\n❌ Precisa de *5* pra passar.\n\n💡 Tente de novo em 10 minutos.`
              });
            }, 600000);
          }
          return
    }
  }
};
