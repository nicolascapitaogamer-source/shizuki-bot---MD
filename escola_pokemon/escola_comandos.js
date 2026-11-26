import { criarMissaoGrupo } from './escola_missoes_grupo.js';
import { getAluno, salvarEscola, carregarEscola, classificarNota, getParceiro } from './escola_core.js';
import { sortearEvento } from './escola_eventos.js';
import { iniciarMissao } from './escola_combate.js';
import { iniciarProva } from './escola_prova.js';
import { treinarPokemon, alimentarPokemon } from './escola_treino.js';
import { minhaMissao, abandonarMissao, historicoMissoes } from './escola_missoes_logica.js';
import { missaoDiaria } from './escola_missoes_especiais.js';
import { rankPokemon, lendarios, eventoPokemon, premios } from './escola_ranking.js';
import { treinoEscolar } from './atividades/treino_escolar.js';
import { excursao } from './atividades/excursao.js';
import { clubePokemon } from './atividades/clube_pokemon.js';
import { campoEscolar } from './atividades/campo_escolar.js';
import { competicao } from './atividades/competicao.js';
import { verParceiro, trocarParceiro } from './escola_parceiro.js';

function menuAulas() {
    return `╭━━━〔 🎓 𝐒𝐀𝐋𝐀𝐒 𝐃𝐄 𝐀𝐔𝐋𝐀 〕━━━╮
┃
┃ 📖 *Escolha uma aula:*
┃
┃ 1️⃣ *!aulaespecies* - Espécies
┃ 2️⃣ *!aulabatalha* - Estratégias
┃ 3️⃣ *!aulaevolucao* - Evoluções
┃ 4️⃣ *!aulacuidados* - Cuidados
┃ 5️⃣ *!aulatipos* - Tipos e Vantagens
┃
┃ 🔙 *!escolapokemon* - Voltar
┃
╰━━━━━━━━━━━━━━━━━━━━━╯`;
}

export async function processarComandoEscola(sock, msg, from, sender, comando, args) {
    const aluno = getAluno(sender);
    const db = carregarEscola();

    switch (comando) {
        case 'escolapokemon':
            const menu = `╭━━━〔 🏫 𝐄𝐒𝐂𝐎𝐋𝐀 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮
┃
┃ 🎒 *Aluno(a):* @${sender.split('@')[0]}
┃ 📊 *Nota Atual:* ${aluno.nota.toFixed(1)} (${classificarNota(aluno.nota)})
┃ 🧠 *Nível de Medo:* ${aluno.medo}%
┃
┃ ━━━━━━━━━━━━━━━━━━━━━━━━
┃
┃ 📖 *O que deseja fazer hoje?*
┃
┃ 🎓 *!aulapokemon* - Escolher aula
┃ 📝 *!prova* - Fazer a prova
┃ ⏱️ *!recreio* - Descansar (Eventos)
┃ 📚 *!biblioteca* - Estudar sozinho
┃ 🐾 *!parceiro* - Ver seu Pokémon
┃ ⚔️ *!missao* - Enfrentar um Boss
┃
┃ 💡 _Dica: Estude para perder o medo!_
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;
            await sock.sendMessage(from, { text: menu, mentions: [sender] }, { quoted: msg });
            break;

        case 'aulapokemon':
            await sock.sendMessage(from, { text: menuAulas() }, { quoted: msg });
            break;

        case 'aulaespecies':
        case 'aulabatalha':
        case 'aulaevolucao':
        case 'aulacuidados':
        case 'aulatipos':
            const agora = Date.now();
            const cooldownAula = 10 * 60 * 1000;
            const ultima = aluno.ultimaAula || 0;
            
            if (agora - ultima < cooldownAula) {
                const restante = Math.ceil((cooldownAula - (agora - ultima)) / 60000);
                await sock.sendMessage(from, { text: `⏳ *Calma, treinador!*\n\nVocê precisa descansar um pouco antes da próxima aula.\n⏰ *Tempo restante:* ${restante} minuto(s)` }, { quoted: msg });
                break;
            }

            db[sender].medo = Math.max(0, db[sender].medo - 4);
            db[sender].nota = Math.min(10, db[sender].nota + 0.2);
            db[sender].aulas += 1;
            db[sender].ultimaAula = agora;
            salvarEscola(db);

            const textos = {
                aulaespecies: `╭━━━〔 📖 𝐀𝐔𝐋𝐀 𝐃𝐄 𝐏𝐎𝐊𝐄́𝐌𝐎𝐍 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professor Carvalho:*\n┃ "Hoje vamos estudar as espécies!"\n┃\n┃ 🌿 *Pokémon de Grama* precisam de sol.\n┃ 🔥 *Pokémon de Fogo* são explosivos.\n┃ 💧 *Pokémon de Água* adoram nadar.\n┃\n┃ 📚 *Você aprendeu sobre a natureza!*\n┃ 📉 *Medo reduzido:* -4\n┃ 📈 *Nota aumentada:* +0.2\n┃\n┃ 🧠 *Medo Atual:* ${db[sender].medo}%\n┃ 📊 *Nota Atual:* ${db[sender].nota.toFixed(1)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                aulabatalha: `╭━━━〔 ⚔️ 𝐀𝐔𝐋𝐀 𝐃𝐄 𝐁𝐀𝐓𝐀𝐋𝐇𝐀 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professor Kukui:*\n┃ "Vamos treinar sua coragem!"\n┃\n┃ 🥊 *Ataque Rápido* pode virar o jogo.\n┃ 🛡️ *Defesa Sólida* evita danos.\n┃ ⚡ *Velocidade* é essencial.\n┃\n┃ 💪 *Você perdeu o medo de lutar!*\n┃ 📉 *Medo reduzido:* -4\n┃ 📈 *Nota aumentada:* +0.2\n┃\n┃ 🧠 *Medo Atual:* ${db[sender].medo}%\n┃ 📊 *Nota Atual:* ${db[sender].nota.toFixed(1)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                aulaevolucao: `╭━━━〔 ✨ 𝐀𝐔𝐋𝐀 𝐃𝐄 𝐄𝐕𝐎𝐋𝐔𝐂̧𝐀̃𝐎 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professora Juniper:*\n┃ "A evolução é um mistério lindo!"\n┃\n┃ 🪨 *Pedras* evoluem certos Pokémon.\n┃ ❤️ *Amizade* faz outros evoluírem.\n┃ 📈 *Experiência* é o caminho comum.\n┃\n┃ 🌟 *Você entendeu o poder da evolução!*\n┃ 📉 *Medo reduzido:* -4\n┃ 📈 *Nota aumentada:* +0.2\n┃\n┃ 🧠 *Medo Atual:* ${db[sender].medo}%\n┃ 📊 *Nota Atual:* ${db[sender].nota.toFixed(1)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                aulacuidados: `╭━━━〔 🍎 𝐀𝐔𝐋𝐀 𝐃𝐄 𝐂𝐔𝐈𝐃𝐀𝐃𝐎𝐒 〕━━━╮\n┃\n┃ 🧑‍🏫 *Enfermeira Joy:*\n┃ "Cuidar é tão importante quanto lutar!"\n┃\n┃ 🍖 *Alimente* seu Pokémon com carinho.\n┃ 💊 *Poções* curam ferimentos.\n┃ 🛁 *Banho* aumenta a amizade.\n┃\n┃ 💜 *Você aprendeu a ser um bom treinador!*\n┃ 📉 *Medo reduzido:* -4\n┃ 📈 *Nota aumentada:* +0.2\n┃\n┃ 🧠 *Medo Atual:* ${db[sender].medo}%\n┃ 📊 *Nota Atual:* ${db[sender].nota.toFixed(1)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
                aulatipos: `╭━━━〔 📊 𝐀𝐔𝐋𝐀 𝐃𝐄 𝐓𝐈𝐏𝐎𝐒 〕━━━╮\n┃\n┃ 🧑‍🏫 *Professor Oak:*\n┃ "Conhecer os tipos é a chave da vitória!"\n┃\n┃ 💧 *Água* vence 🔥 *Fogo*.\n┃ 🌿 *Grama* vence 💧 *Água*.\n┃ 🔥 *Fogo* vence 🌿 *Grama*.\n┃  ⚡ *Elétrico* vence 💧 *Água*.\n┃\n┃ 🧠 *Você dominou a tabela de tipos!*\n┃ 📉 *Medo reduzido:* -4\n┃ 📈 *Nota aumentada:* +0.2\n┃\n┃ 🧠 *Medo Atual:* ${db[sender].medo}%\n┃ 📊 *Nota Atual:* ${db[sender].nota.toFixed(1)}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            };

            await sock.sendMessage(from, { text: textos[comando] }, { quoted: msg });
            break;

        case 'parceiro':
            if (args && args.length > 0) {
                await trocarParceiro(sock, msg, from, sender, args[0]);
            } else {
                await verParceiro(sock, msg, from, sender);
            }
            break;

        case 'missao':
            await iniciarMissao(sock, msg, from, sender, args);
            break;


        case 'prova':
            await iniciarProva(sock, msg, from, sender);
            break;

        case 'treinar':
            await treinarPokemon(sock, msg, from, sender);
            break;

        case 'alimentar':
            await alimentarPokemon(sock, msg, from, sender, args);
            break;

        case 'treinoescolar':
            await treinoEscolar(sock, msg, from, sender);
            break;

        case 'excursao':
            await excursao(sock, msg, from, sender);
            break;

        case 'clubepokemon':
            await clubePokemon(sock, msg, from, sender);
            break;

        case 'campoescolar':
            await campoEscolar(sock, msg, from, sender);
            break;

        case 'competicao':
            await competicao(sock, msg, from, sender);
            break;

        case 'rankpokemon':
            await rankPokemon(sock, msg, from, sender);
            break;

        case 'lendarios':
            await lendarios(sock, msg, from, sender);
            break;

        case 'eventopokemon':
            await eventoPokemon(sock, msg, from, sender);
            break;

        case 'premios':
            await premios(sock, msg, from, sender);
            break;

        case 'missaodiaria':
            await missaoDiaria(sock, msg, from, sender);
            break;

        case 'historicomissoes':
            await historicoMissoes(sock, msg, from, sender);
            break;

        
        case 'biblioteca': {
            const db = carregarEscola();
            const aluno = db[sender];
            const agora = Date.now();
            
            if (agora - (aluno.ultimaBiblioteca || 0) < 5 * 60 * 1000) {
                const restante = Math.ceil((5 * 60 * 1000 - (agora - (aluno.ultimaBiblioteca || 0))) / 60000);
                await sock.sendMessage(from, { text: `╭━━━〔 📚 𝐁𝐈𝐁𝐋𝐈𝐎𝐓𝐄𝐂𝐀 〕━━━╮\n┃\n┃ ⏳ *Você já estudou recentemente!*\n┃\n┃ ⏰ *Volte em ${restante} minuto(s).*\n┃\n╰━━━━━━━━━━━━━━━━━━━━━╯` }, { quoted: msg });
                break;
            }
            
            // Efeitos
            db[sender].nota = Math.min(10, db[sender].nota + 0.2);
            db[sender].medo = Math.max(0, db[sender].medo - 2);
            db[sender].ultimaBiblioteca = agora;
            salvarEscola(db);
            
            await sock.sendMessage(from, { 
                text: `╭━━━〔 📚 𝐁𝐈𝐁𝐋𝐈𝐎𝐓𝐄𝐂𝐀 〕━━━╮\n┃\n┃ 📖 *Você passou um tempo estudando*\n┃ *na biblioteca da escola...*\n┃\n┃ 📈 *Nota aumentada:* +0.2\n┃ 😨 *Medo reduzido:* -2%\n┃\n┃ 💡 _Volte em 5 minutos para estudar_\n┃ _mais._\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯` 
            }, { quoted: msg });
            break;
        }

        case 'minhamissao':
            await minhaMissao(sock, msg, from, sender);
            break;

        case 'abandonarmissao':
            await abandonarMissao(sock, msg, from, sender);
            break;

        case 'historicomissoes':
            await historicoMissoes(sock, msg, from, sender);
            break;

        case 'medo':
            let textoMedo = "";
            if (aluno.medo > 70) textoMedo = "Você tem medo de Pokémons fortes e raros! 😨";
            else if (aluno.medo > 30) textoMedo = "Você já consegue encarar Pokémons médios, mas ainda teme os lendários. 😬";
            else textoMedo = "Você é destemido! Nenhum Pokémon te assusta. 😎";
            
            await sock.sendMessage(from, { 
                text: `╭━━━〔 🧠 𝐀𝐍𝐀́𝐋𝐈𝐒𝐄 𝐃𝐄 𝐌𝐄𝐃𝐎 〕━━━╮\n┃\n┃ 👨‍🏫 *Professor:* "Vamos ver como está seu coração..."\n┃\n┃ 🔴 *Medo Atual:* ${aluno.medo}/100\n┃ 📉 *Status:* ${textoMedo}\n┃\n┃ 💡 _Assista aulas para reduzir o medo!_\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯` 
            }, { quoted: msg });
            break;

        case 'recreio':
            const evento = sortearEvento(aluno.medo);
            
            if (evento.tipo === 'nota') db[sender].nota = Math.min(10, db[sender].nota + evento.valor);
            if (evento.tipo === 'medo') db[sender].medo = Math.min(100, db[sender].medo + evento.valor);
            
            salvarEscola(db);
            
            await sock.sendMessage(from, { 
                text: `╭━━━〔 ⏱️ 𝐈𝐍𝐓𝐄𝐑𝐕𝐀𝐋𝐎 〕━━━╮\n┃\n┃ ${evento.msg}\n┃\n╰━━━━━━━━━━━━━━━━━━━━━━━╯` 
            }, { quoted: msg });
            break;

        default:
            return false;
    }
    return true;
}
