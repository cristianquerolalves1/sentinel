const { cyan, red, yellow, green, magenta, bold } = require("colorette");
const Table = require("cli-table3");

class TerminalReporter {
    static print(results) {
        if (!results?.length) {
            console.log(green("\n✔ No secrets found.\n"));
            return;
        }

        console.log(
            bold(cyan(`\n🚨 Sentinel found ${results.length} potential secrets:\n`))
        );

        const table = new Table({
            head: ["Severity", "Rule", "File", "Line", "Match"],
            colWidths: [12, 25, 45, 8, 50],
            wordWrap: true
        });

        results.forEach(r => {
            const sev =
                r.severity === "critical"
                    ? red(bold("CRITICAL"))
                    : r.severity === "high"
                    ? red("HIGH")
                    : r.severity === "medium"
                    ? yellow("MEDIUM")
                    : r.severity === "low"
                    ? green("LOW")
                    : magenta("INFO");

            table.push([
                sev,
                r.ruleName,
                r.file,
                r.line,
                (r.match || "").toString()
            ]);
        });

        console.log(table.toString());

        console.log(bold(cyan("\nSummary:\n")));

        const byType = results.reduce((a, r) => {
            a[r.ruleName] = (a[r.ruleName] || 0) + 1;
            return a;
        }, {});

        const bySeverity = results.reduce((a, r) => {
            const sev = r.severity || "info";
            a[sev] = (a[sev] || 0) + 1;
            return a;
        }, {});

        console.log(cyan("By type:"));
        Object.entries(byType).forEach(([k, v]) =>
            console.log(`  ${k}: ${v}`)
        );

        console.log(cyan("\nBy severity:"));
        Object.entries(bySeverity).forEach(([k, v]) =>
            console.log(`  ${k}: ${v}`)
        );
    }
}

module.exports = TerminalReporter;
