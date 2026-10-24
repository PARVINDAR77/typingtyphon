const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/SEO STZK/.gemini/antigravity-ide/brain/f8c6a5f2-d447-4703-93e5-14c518733ed2/.system_generated/logs/transcript_full.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":401')) {
    try {
      const obj = JSON.parse(line);
      fs.writeFileSync('step401_code.tsx', obj.tool_calls[0].args.CodeContent);
      console.log('Successfully wrote step401_code.tsx');
      process.exit(0);
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  }
});
