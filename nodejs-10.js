const readline = require('readline');
const https = require('https');

const key = 'AIzaSyCbKn1iDQDGAcYG69-XjzW_BjMPbFCQJMw';
const model = 'gemini-2.0-flash';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'T:\\>: '
});

console.log('[INFO] ------------------------------------------------------------------------');
console.log('[INFO] BUILD SUCCESS');
console.log('[INFO] ------------------------------------------------------------------------');
console.log('[INFO] Total time:  1.775 s');
console.log('[INFO] Finished at: 2025-09-21T22:49:11+07:00');
console.log('[INFO] ------------------------------------------------------------------------\n');
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
      r.on('end', () => {
        if (r.statusCode >= 200 && r.statusCode < 300) {
          try {
            res(JSON.parse(body));
          } catch (e) {
            rej('Lỗi khi parse JSON: ' + e.message);
          }
        } else {
          rej(body);
        }
      });
    });
    req.on('error', rej);
    req.write(JSON.stringify(data));
    req.end();
  });
}

rl.on('line', async function (line) {
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
          maxOutputTokens: 8192,
          candidateCount: 1,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      });
      const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi.';
      console.log(`\n[INFO] project created from Old (1.x) Archetype in dir: 
[INFO] ------------------------------------------------------------------------\n${reply}

[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  1.775 s
[INFO] Finished at: 2025-09-21T22:49:11+07:00
[INFO] ------------------------------------------------------------------------
`);
    } catch (err) {
      console.log('Gemini: Lỗi hoặc key sai.\nChi tiết:', err);
    }

    rl.prompt();
    return;
  }

  buffer.push(line);
  rl.prompt();
}).on('close', function () {
  process.exit(0);
});