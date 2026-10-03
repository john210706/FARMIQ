const net = require('node:net');
const { fail } = require('../domain');

async function scan(bytes) {
  const host = process.env.CLAMAV_HOST;
  if (!host) {
    if (process.env.CLAMAV_REQUIRED === 'true') fail(503, 'File scanning is not configured');
    return;
  }
  let result;
  try {
    result = await new Promise((resolve, reject) => {
      const socket = net.createConnection({ host, port: Number(process.env.CLAMAV_PORT || 3310) });
      let response = '';
      socket.setTimeout(10000, () => socket.destroy(new Error('Scan timed out')));
      socket.on('error', reject);
      socket.on('data', (data) => {
        response += data.toString();
        if (response.length > 4096) socket.destroy(new Error('Invalid scan response'));
        else if (response.includes('\0')) {
          resolve(response.replaceAll('\0', '').trim());
          socket.end();
        }
      });
      socket.on('end', () =>
        response ? resolve(response.replaceAll('\0', '').trim()) : reject(new Error('Empty scan response')),
      );
      socket.on('connect', () => {
        socket.write('zINSTREAM\0');
        const size = Buffer.alloc(4);
        size.writeUInt32BE(bytes.length);
        socket.write(size);
        socket.write(bytes);
        socket.write(Buffer.alloc(4));
      });
    });
  } catch {
    fail(503, 'File scanning is temporarily unavailable. Please try again later.');
  }
  if (result.endsWith(' FOUND')) fail(400, 'The uploaded file failed the security scan');
  if (result !== 'stream: OK') fail(503, 'File scanning could not confirm this file is safe');
}
module.exports = { scan };
