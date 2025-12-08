#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const { green, cyan, yellow, red, bold } = require('colorette');
const ora = require('ora').default;
const cliProgress = require('cli-progress');
const { Command } = require('commander');

const RegexScanner = require('./scanners/regexScanner');
const EntropyScanner = require('./scanners/entropyScanner');
const HeuristicScanner = require('./scanners/heuristicScanner');
const Detector = require('./core/detector');
const FileLoader = require('./core/fileLoader');
const { generateJSONReport } = require('./reporters/jsonReporter');
const { generateHTMLReport } = require('./reporters/htmlReporter');
const TerminalReporter = require('./reporters/terminalReporter');
const Deduplicator = require('./core/deduplicator');
class CLI {
    static async runCLI() {
        const program = new Command();
        program
            .name('sentinel')
            .description('Sentinel – Advanced secret scanning tool')
            .version('2.0.0');

        program
            .argument('<directory>', 'Directory to scan')
            .option('--fast', 'Fast scan using regex only', false)
            .option('--deep', 'Deep scan: regex + entropy + heuristic', false)
            .option('--json', 'Generate JSON report', false)
            .option('--html', 'Generate HTML report', false)
            .option('--ignore <dirs...>', 'Directories to ignore', ['node_modules', '.git'])
            .action(async (directory, options) => {
                await CLI.run(directory, options);
            });

        program.parseAsync(process.argv);
    }

    static async run(directory, options) {
        const absDir = path.resolve(directory);
        if (!fs.existsSync(absDir)) {
            console.log(red(`Directory does not exist: ${absDir}`));
            process.exit(1);
        }

        const files = FileLoader.getAllFiles(absDir, options.ignore, [], true);
        if (files.length === 0) {
            console.log(yellow('No files to scan.'));
            return;
        }

        console.log(cyan(`Scanning directory: ${absDir}`));
        console.log(cyan(`Scan mode: ${options.deep ? 'Deep' : 'Fast'}`));
        console.log(cyan(`Total files: ${files.length}`));

        const regexScanner = new RegexScanner();
        const entropyScanner = new EntropyScanner();
        const heuristicScanner = new HeuristicScanner();
        const detectors = [regexScanner, entropyScanner, heuristicScanner];

        const detector = new Detector(detectors, { verbose: true });
        let results = [];

        const spinner = ora({ text: 'Scanning files...' }).start();
        const progressBar = new cliProgress.SingleBar({
            format: 'Progress |' + green('{bar}') + '| {percentage}% || {value}/{total} files',
            barCompleteChar: '\u2588',
            barIncompleteChar: '\u2591',
            hideCursor: true
        });
        progressBar.start(files.length, 0);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            try {
                const content = fs.readFileSync(file, 'utf-8');
                const fileResults = detector.scan(file, content);
                results.push(...fileResults);
            } catch (err) {
                console.log(red(`Failed to read ${file}: ${err.message}`));
            }
            progressBar.update(i + 1);
        }

        progressBar.stop();
        spinner.stop();


        results = Deduplicator.deduplicate(results);
        results = Deduplicator.postProcess(results);

        if (options.json) {
            const jsonPath = path.join(process.cwd(), 'sentinel_report.json');
            generateJSONReport(results, jsonPath);
            console.log(green(`JSON report generated at: ${jsonPath}`));
        }
        if (options.html) {
            const htmlPath = path.join(process.cwd(), 'sentinel_report.html');
            generateHTMLReport(results, htmlPath);
            console.log(green(`HTML report generated at: ${htmlPath}`));
        }

        TerminalReporter.print(results);
        CLI.printSummary(results, files.length);
    }

    static deduplicateResults(results) {
        const seen = new Set();
        const unique = [];
        results.forEach(r => {
            const key = `${r.file}:${r.line}:${r.match}:${r.ruleName}`;
            if (!seen.has(key)) {
                unique.push(r);
                seen.add(key);
            }
        });
        return unique;
    }

    static printSummary(results, totalFiles) {
        console.log('\n' + bold(cyan('Scan Summary:')));
        console.log(cyan(`Total files scanned: ${totalFiles}`));
        console.log(cyan(`Total secrets found: ${results.length}`));

        const typesCount = results.reduce((acc, r) => {
            acc[r.ruleName] = (acc[r.ruleName] || 0) + 1;
            return acc;
        }, {});

        console.log(cyan('Secrets by type:'));
        for (const [type, count] of Object.entries(typesCount)) {
            console.log(cyan(`  ${type}: ${count}`));
        }
    }
}

module.exports = CLI;

CLI.runCLI();
