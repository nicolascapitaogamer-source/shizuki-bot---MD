const W = 50;
const rgb = (r, g, b) => '\x1b[38;2;' + r + ';' + g + ';' + b + 'm';
const R = '\x1b[0m';
const B = '\x1b[1m';
const C = {
  verde: rgb(34, 197, 94),
  verdeEsc: rgb(21, 128, 61),
  verdeCla: rgb(134, 239, 172),
  branco: rgb(255, 255, 255),
  cinza: rgb(148, 163, 184),
  amarelo: rgb(250, 204, 21),
  vermelho: rgb(248, 113, 113),
};
const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, '');
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - strip(s).length));
const out = (s = '') => process.stdout.write(s + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const mix = (t) => rgb(
  Math.round(21 + 234 * t),
  Math.round(163 + 92 * t),
  Math.round(74 + 181 * t)
);
const grad = (txt, a = 0, b = 1) => {
  const ch = [...txt];
  return ch.map((c, i) => c === ' ' ? c :
    mix(a + (b - a) * (i / Math.max(1, ch.length - 1))) + c
  ).join('') + R;
};
const LOGO = [
  '███████╗██╗  ██╗██╗███████╗██╗   ██╗██╗  ██╗██╗',
  '██╔════╝██║  ██║██║╚══███╔╝██║   ██║██║ ██╔╝██║',
  '███████╗███████║██║  ███╔╝ ██║   ██║█████╔╝ ██║',
  '╚════██║██╔══██║██║ ███╔╝  ██║   ██║██╔═██╗ ██║',
  '███████║██║  ██║██║███████╗╚██████╔╝██║  ██╗██║',
  '╚══════╝╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝',
];

export function banner({ versao = '4.3', dono = '' } = {}) {
  out();
  LOGO.forEach((l, i) => {
    out(' ' + grad(l, i * 0.04, 0.55 + i * 0.08));
  });
  out();
  const nome = C.verde + B + 'Shizuki Bot' + R + C.branco + B + ' - ' + R + C.verde + B + 'MD' + R;
  out(' ' + nome + '  ' + C.cinza + 'Versão ' + versao + R);
  out(' ' + C.verdeEsc + '━'.repeat(W - 2) + R);
  if (dono) out(' ' + C.cinza + 'dono ' + C.branco + dono + R);
  out();
}

export function section(t) {
  const n = Math.max(2, W - t.length - 6);
  const linha = C.verdeEsc + '─'.repeat(n) + R;
  out(' ' + C.verde + '◆' + R + ' ' + C.branco + B + t.toUpperCase() + R + ' ' + linha);
}
export const fim = () => {};
export const ok = (t) => out(' ' + C.verde + '✔' + R + ' ' + C.branco + t + R);
export const aviso = (t) => out(' ' + C.amarelo + '▲ ' + t + R);
export const erro = (t) => out(' ' + C.vermelho + '✖ ' + t + R);
export const info = (t) => out(' ' + C.verdeCla + '›' + R + ' ' + C.cinza + t + R);
export const espaco = () => out();

export function caixa(titulo, linhas) {
  const cor = C.verde;
  const rotW = Math.max(...linhas.map((l) => l[0].length));
  const corpo = linhas.map((l) => C.cinza + l[0].padEnd(rotW) + R + '  ' + l[1]);
  const inner = Math.max(W - 4, titulo.length + 4, ...corpo.map((l) => strip(l).length));
  const t = ' ' + titulo + ' ';
  const topo = '─'.repeat(inner - t.length);
  out(' ' + cor + '╭─' + B + t + R + cor + topo + '╮' + R);
  corpo.forEach((l) => out(' ' + cor + '│' + R + ' ' + pad(l, inner) + cor + '│' + R));
  out(' ' + cor + '╰' + '─'.repeat(inner + 1) + '╯' + R);
}

export function barra(a, t, l = 24) {
  const f = Math.round((a / t) * l);
  const cheio = C.verde + '█'.repeat(f);
  const vazio = C.verdeEsc + '░'.repeat(l - f) + R;
  return cheio + vazio + ' ' + C.branco + a + '/' + t + R;
}

export function spinner(texto) {
  const fr = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  let txt = texto;
  const draw = () => process.stdout.write(
    '\r\x1b[2K ' + C.verde + fr[i++ % fr.length] + R + ' ' + C.branco + txt + R);
  draw();
  const id = setInterval(draw, 80);
  const acaba = (s, c, t) => {
    clearInterval(id);
    process.stdout.write('\r\x1b[2K ' + c + s + R + ' ' + C.branco + (t || txt) + R + '\n');
  };
  return {
    set: (t) => { txt = t; },
    ok: (t) => acaba('✔', C.verde, t),
    falha: (t) => acaba('✖', C.vermelho, t),
  };
}

export function modulo(i, total, nome) {
  process.stdout.write('\r\x1b[2K ' + C.verde + '▸' + R + ' ' + barra(i, total, 18) + ' ' + C.cinza + nome + R);
  if (i === total) process.stdout.write('\r\x1b[2K');
}

export function resumo({ modulos, total, comandos, hooks = 0, falhas = 0, tempo = '' }) {
  caixa('RESUMO', [
    ['Módulos', barra(modulos, total, 16)],
    ['Comandos', C.verde + B + comandos + R],
    ['Hooks', C.branco + hooks + R],
    ['Falhas', (falhas ? C.vermelho : C.verde) + falhas + R],
    ['Tempo', C.branco + tempo + R],
  ]);
  out();
}

export function repetidos(lista = []) {
  return;
  const m = lista.slice(0, 4).join(', ');
  const mais = lista.length > 4 ? '…' : '';
  aviso(lista.length + ' comandos repetidos (o último vence): ' + m + mais);
  out();
}

export function conectando() {
  return spinner('Conectando ao WhatsApp...');
}

export function conectado({ numero, dono = '', prefixo = '!' }) {
  const linhas = [
    ['Status', C.verde + '●' + R + ' ' + C.branco + B + 'Online' + R],
    ['Número', C.branco + numero + R],
  ];
  if (dono) linhas.push(['Dono', C.branco + dono + R]);
  linhas.push(['Prefixo', C.verde + prefixo + R]);
  linhas.push(['Hora', C.branco + new Date().toLocaleString('pt-BR') + R]);
  out();
  caixa('CONECTADO', linhas);
  out();
  const msg = 'Shizuki Bot - MD pronto! Aguardando mensagens...';
  out(' ' + C.verde + '✦' + R + ' ' + grad(msg, 0.2, 1));
  out();
}

export function desconectado(motivo = '', reconectando = true) {
  out();
  erro('Conexão encerrada' + (motivo ? ': ' + motivo : ''));
  if (reconectando) info('Tentando reconectar...');
}

export function codigoPareamento(codigo) {
  out();
  caixa('PAREAMENTO', [
    ['Código', C.verde + B + codigo + R],
    ['Como', C.cinza + 'WhatsApp > Aparelhos conectados' + R],
    ['', C.cinza + '> Conectar com número de telefone' + R],
  ]);
  out();
}

export function log(tipo, cmd, onde = '') {
  const h = new Date().toLocaleTimeString('pt-BR');
  const cor = { cmd: C.verde, msg: C.branco, erro: C.vermelho }[tipo] || C.cinza;
  out(' ' + C.cinza + h + R + ' ' + cor + B + tipo.toUpperCase().padEnd(4) + R +
    ' ' + C.branco + cmd + R + ' ' + C.cinza + onde + R);
}

export { sleep, C };

if (process.argv[1] && process.argv[1].endsWith('visual.js')) {
  (async () => {
    banner({ dono: '5500000000000' });
    section('Carregando módulos');
    for (let i = 1; i <= 22; i++) { modulo(i, 22, 'modulo' + i + '.js'); await sleep(40); }
    resumo({ modulos: 22, total: 22, comandos: 429, hooks: 6, falhas: 0, tempo: '1.12s' });
    section('Conexão');
    const s = conectando(); await sleep(1200); s.ok('Sessão restaurada');
    conectado({ numero: '5500000000000', dono: '5500000000000', prefixo: '!' });
    log('cmd', '!menu', 'Grupo Teste');
  })();
}
