const DONO = 'nick dev';
const CRIADOR = 'nick dev';
export async function marca(sock, msg, from) {
  const user = msg.pushName || 'Usuário';
  let grupo = 'Privado';
  if (String(from).endsWith('@g.us')) {
    try {
      const f = globalThis.__getGroupMetadata;
      const md = f ? await f(from) : await sock.groupMetadata(from);
      grupo = md.subject;
    } catch (e) { grupo = 'Grupo'; }
  }
  const pack = '💜 𝐒𝐡𝐢𝐳𝐮𝐤𝐢 𝐁𝐨𝐭 - 𝐌𝐃';
  const author = '╭ 👤 ' + user + '\n├ 👑 Criador: ' + CRIADOR +
    '\n├ 🛠 Dono: ' + DONO + '\n╰ 👥 ' + grupo;
  return { pack, author };
}
export function exifDe(pack, author) {
  const json = { 'sticker-pack-id': 'shizuki-bot', 'sticker-pack-name': pack, 'sticker-pack-publisher': author, emojis: ['💜'] };
  const attr = Buffer.from([0x49,0x49,0x2A,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
  const jb = Buffer.from(JSON.stringify(json), 'utf-8');
  const exif = Buffer.concat([attr, jb]);
  exif.writeUIntLE(jb.length, 14, 4);
  return exif;
}
