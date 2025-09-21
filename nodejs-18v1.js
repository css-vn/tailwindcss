import readline from 'readline';
import https from 'https';
const key = 'AIzaSyCzjAT1ZWKS3fmh4nTB4OE_bKjo9HfcFTc';
const model = 'gemini-2.0-flash';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'T:\>: '
});
console.log('VITE v6.3.5  ready in 632 ms');
console.log('\n');
console.log(' ➜  Local:   http://localhost:5173/');
console.log(' ➜  Network: use --host to expose');
console.log(' ➜  press h + enter to show help\n');
rl.prompt();
let buffer = [];
function post(data) {
  return new Promise((res, rej) => {
    const opts = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${key}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, r => {
      let body = '';
      r.on('data', c => body += c);
      r.on('end', () => r.statusCode >= 200 && r.statusCode < 300 ? res(JSON.parse(body)) : rej(body));
    });
    req.on('error', rej);
    req.write(JSON.stringify(data));
    req.end();
  });
}
rl.on('line', async line => {
  if (line.trim() === '/exit') process.exit(0);
  if (line.trim() === '/send') {
    if (buffer.length === 0) {
      rl.prompt();
      return;
    }
    const allInput = buffer.join('\n').trim();
    buffer = [];
    if (!allInput) {
      rl.prompt();
      return;
    }
    const lines = allInput.split('\n');
    let code, request;
    if (lines.length > 1) {
      code = lines.slice(0, -1).join('\n');
      request = lines[lines.length - 1].trim();
    } else {
      code = allInput;
      request = '';
    }
    if (!request) {
      console.log('Bạn chưa nhập yêu cầu cụ thể. Vui lòng nhập yêu cầu vào dòng cuối cùng sau code rồi gửi lại.');
      rl.prompt();
      return;
    }
    const promptText = `
Đây là đoạn code:
${code}
Làm theo yêu cầu sau và không giải thích: ${request}
`.trim();
    try {
      const d = await post({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 2048,
          candidateCount: 1,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      });
      const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi.';
      console.log(`\n> ontapcuoikyv2@0.0.0 dev
  > vite ---\n${reply}

  VITE v6.3.5  ready in 632 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

`);
    } catch {
      console.log('Gemini: Lỗi hoặc key sai.');
    }
    rl.prompt();
    return;
  }
  buffer.push(line);
  rl.prompt();
}).on('close', () => process.exit(0));

//winget install OpenJS.NodeJS