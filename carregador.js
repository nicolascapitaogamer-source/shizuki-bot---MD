import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export async function carregarComandos(pasta = './comandos') {
  const mapa = {};
  if (!fs.existsSync(pasta)) return mapa;
  for (const sub of fs.readdirSync(pasta, { withFileTypes: true })) {
    if (!sub.isDirectory()) continue;
    const dir = path.join(pasta, sub.name);
    for (const arq of fs.readdirSync(dir)) {
      if (!arq.endsWith('.js')) continue;
      try {
        const mod = (await import(pathToFileURL(path.resolve(dir, arq)).href)).default;
        if (!mod || !Array.isArray(mod.nomes) || typeof mod.executar !== 'function') continue;
        for (const n of mod.nomes) mapa[String(n).toLowerCase()] = { ...mod, pasta: sub.name };
      } catch (e) {
        console.log('Erro ao carregar', sub.name + '/' + arq + ':', e.message);
      }
    }
  }
  return mapa;
}
