// Gerado de index.js (case 'uptadestart', linha 12348)
export default {
  nomes: ["uptadestart","upgradestart","updatestart","atualizar"],
  async executar(__x) {
    const { fs, execFile, isDono, sock, from, msg } = Object.assign({}, __x.utils, __x);
    {
{
            if (!isDono) { await sock.sendMessage(from, { text: '🚫 Apenas o dono e os líderes podem atualizar o bot!' }, { quoted: msg }); return }
            const _REPO = 'nicolascapitaogamer-source/shizuki-bot---MD', _TMP = './.update_tmp', _BAK = './.update_bak';
            const _cx = (t) => '╭━━━〔 🔄 𝐔𝐏𝐃𝐀𝐓𝐄 〕━━━╮\n┃\n┃ ' + t + '\n┃\n╰━━━━━━━━━━━━━━━━━━⬣';
            const _sent = await sock.sendMessage(from, { text: _cx('🔎 Procurando atualização no GitHub...') }, { quoted: msg });
            const _ed = async (t) => { try { await sock.sendMessage(from, { text: _cx(t), edit: _sent.key }); } catch (e) { await sock.sendMessage(from, { text: _cx(t) }); } };
            const _feitos = [];
            try {
              const _H = { headers: { 'User-Agent': 'shizuki-bot' } };
              const rc = await fetch('https://api.github.com/repos/' + _REPO + '/commits/main', _H);
              if (!rc.ok) throw new Error('GitHub respondeu ' + rc.status + ' (o repositório precisa ser público)');
              const sha = (await rc.json()).sha;
              let atual = null; try { atual = JSON.parse(fs.readFileSync('./update_version.json', 'utf8')).sha; } catch (e) {}
              if (atual === sha) { await _ed('ℹ️ Nenhuma atualização encontrada.\n┃ ✅ Seu bot já está atualizado.'); return }
              await _ed('⬇️ Atualizando...\n┃ Baixando os arquivos...');
              fs.rmSync(_TMP, { recursive: true, force: true }); fs.rmSync(_BAK, { recursive: true, force: true });
              const rt = await fetch('https://api.github.com/repos/' + _REPO + '/git/trees/' + sha + '?recursive=1', _H);
              if (!rt.ok) throw new Error('Não consegui listar os arquivos (' + rt.status + ')');
              const tree = await rt.json();
              if (tree.truncated) throw new Error('Repositório grande demais para listar');
              const lista = tree.tree.filter(x => x.type === 'blob'
                && !/^(node_modules\/|auth_|\.git|gifs\/|package-lock\.json)/.test(x.path)
                && !x.path.includes('.bak') && !/\.tmp$/.test(x.path)
                && (/\.(js|mjs)$/.test(x.path) || !fs.existsSync('./' + x.path)));
              if (!lista.length) throw new Error('Nenhum arquivo para atualizar');
              for (const f of lista) {
                const r = await fetch('https://raw.githubusercontent.com/' + _REPO + '/' + sha + '/' + encodeURI(f.path));
                if (!r.ok) throw new Error('Falha ao baixar ' + f.path);
                const d = _TMP + '/' + f.path; fs.mkdirSync(d.substring(0, d.lastIndexOf('/')), { recursive: true });
                fs.writeFileSync(d, Buffer.from(await r.arrayBuffer()));
              }
              for (const f of lista.filter(x => /\.(js|mjs)$/.test(x.path))) {
                await new Promise((ok, no) => execFile('node', ['--check', _TMP + '/' + f.path], (err) => err ? no(new Error('Erro de sintaxe em ' + f.path)) : ok()));
              }
              for (const f of lista) {
                const dest = './' + f.path, tinha = fs.existsSync(dest);
                if (tinha) { const b = _BAK + '/' + f.path; fs.mkdirSync(b.substring(0, b.lastIndexOf('/')), { recursive: true }); fs.copyFileSync(dest, b); }
                _feitos.push({ dest, bak: tinha ? _BAK + '/' + f.path : null });
                if (dest.includes('/', 2)) fs.mkdirSync(dest.substring(0, dest.lastIndexOf('/')), { recursive: true });
                fs.copyFileSync(_TMP + '/' + f.path, dest);
              }
              fs.writeFileSync('./update_version.json', JSON.stringify({ sha, data: new Date().toISOString() }));
              fs.writeFileSync('./restart.json', JSON.stringify({ chat: from, texto: '✅ Atualização concluída! O bot está online com as novidades!' }));
              await _ed('✅ Atualizado! (' + lista.length + ' arquivos)\n┃ 🔁 Reiniciando...');
              setTimeout(() => process.exit(42), 1500);
            } catch (e) {
              console.error('uptadestart:', e);
              for (const x of _feitos) { try { if (x.bak) fs.copyFileSync(x.bak, x.dest); else fs.rmSync(x.dest, { force: true }); } catch (e2) {} }
              await _ed('❌ Erro ao atualizar: ' + e.message + '\n┃ Nada foi alterado.');
            } finally {
              fs.rmSync(_TMP, { recursive: true, force: true });
            }
          }
          return
    }
  }
};
