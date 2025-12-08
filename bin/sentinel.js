#!/usr/bin/env node
const { Command } = require('commander');
const path = require('path');
const fs = require('fs');
const CLI = require('../src/cli');
const pkg = require('../package.json');

const program = new Command();

program
  .name('sentinel')
  .description('🛡️ Sentinel CLI — Code never leaks')
  .version(pkg.version)
  .usage('<directory> [options]')
  .showHelpAfterError(true)
  .showSuggestionAfterError(true);

program
  .argument('[directory]', 'Directory to scan')
  .option('--fast', 'Fast scan using regex patterns only', false)
  .option('--deep', 'Deep scan: regex + entropy + heuristics', false)
  .option('--json', 'Generate JSON report', false)
  .option('--html', 'Generate HTML report', false)
  .option('--ignore <dirs...>', 'Directories to ignore', ['node_modules', '.git', 'assets'])
  .option('--verbose', 'Verbose logging', false)
  .option('--entropy-threshold <n>', 'Entropy threshold', parseFloat)
  .option('--filter <rules...>', 'Filter by specific rule names', []);

program.action(async (directory, options) => {

  if (!directory) {
    console.log("\n❓ No directory provided.\n");
    program.help({ error: false });
    return;
  }

  const dir = path.resolve(directory);

  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory does not exist: ${dir}`);
    process.exit(1);
  }

  try {
    await CLI.run(dir, options);
  } catch (err) {
    console.error('❌ Error:', err.message || err);
    process.exit(1);
  }
});

// ---------- PARSE ----------
if (process.argv.length <= 2) {
  // sentinel → no args → show help automatically
  program.help({ error: false });
}

program.parse(process.argv);
