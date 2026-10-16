import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function start() {
  const args = [path.join(__dirname, 'index.js'), ...process.argv.slice(2)];
  
  console.log('🚀 [START] Iniciando o bot...');

  const p = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc']
  });

  p.on('message', (data) => {
    if (data === 'reset') {
      console.log('🔄 [RESTART] Reiniciando processo do bot...');
      p.kill();
      start();
    }
  });

  p.on('exit', (code) => {
    console.error(`⚠️ [EXIT] O bot foi encerrado (Código: ${code})`);
    if (code !== 0) {
      console.log('🔄 [RECONNECT] Reiniciando automaticamente...');
      start();
    }
  });
}

start();
