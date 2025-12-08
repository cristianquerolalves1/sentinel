const fs = require('fs');

function generateJSONReport(results, outputPath) {
    const summary = results.reduce(
        (acc, r) => {
            acc.total++;
            acc.byType[r.ruleName] = (acc.byType[r.ruleName] || 0) + 1;
            acc.bySeverity[r.severity || "info"] =
                (acc.bySeverity[r.severity || "info"] || 0) + 1;
            return acc;
        },
        { total: 0, byType: {}, bySeverity: {} }
    );

    const report = {
        timestamp: new Date().toISOString(),
        totalSecretsFound: summary.total,
        secretsByType: summary.byType,
        secretsBySeverity: summary.bySeverity,
        filesScanned: [...new Set(results.map(r => r.file))].length,
        results
    };

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), "utf-8");
}

module.exports = { generateJSONReport };
