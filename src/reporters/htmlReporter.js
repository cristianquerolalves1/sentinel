const fs = require('fs');

function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function highlightMatch(text, match) {
    if (!text || !match) return escapeHtml(text);
    const escaped = escapeHtml(match);
    const regex = new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "gi");
    return escapeHtml(text).replace(regex, m => `<mark>${m}</mark>`);
}

function generateHTMLReport(results, outputPath) {
    const severityColors = {
        critical: "#d50000",
        high: "#ff1744",
        medium: "#ff9100",
        low: "#2979ff",
        info: "#9e9e9e"
    };

    const rows = results.map(r => {
        const safeMatch = escapeHtml(r.match);
        const safeContext = highlightMatch(r.context || r.snippet || "", r.match);

        return `
<tr data-rule="${r.ruleName}" data-severity="${r.severity}">
    <td>
        <b>${escapeHtml(r.ruleName)}</b><br>
        <small>${escapeHtml(r.provider || "builtin")}</small>
    </td>
    <td>${escapeHtml(r.file)}</td>
    <td>${r.line || 0}</td>
    <td><pre>${safeMatch}</pre></td>
    <td><pre>${safeContext}</pre></td>
    <td><span class="sev sev-${r.severity}">${r.severity}</span></td>
</tr>`;
    }).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Sentinel Report</title>
<style>
body {
    margin: 0;
    padding: 25px;
    font-family: "Inter", Arial, sans-serif;
    background: #f0f2f5;
    color: #222;
}

@media (prefers-color-scheme: dark) {
    body {
        background: #121212;
        color: #e5e5e5;
    }
    table, th, td {
        border-color: #333 !important;
    }
    th {
        background: #1f1f1f !important;
    }
}

h1 {
    font-size: 32px;
    margin-bottom: 10px;
}

.search-box {
    margin: 15px 0;
}

input[type="search"] {
    width: 100%;
    padding: 12px;
    font-size: 15px;
    border-radius: 8px;
    border: 1px solid #ccc;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    border: 1px solid #ddd;
}

th, td {
    padding: 14px;
    border: 1px solid #ddd;
}

th {
    background: #222;
    color: #fff;
    cursor: pointer;
}

pre {
    white-space: pre-wrap;
    margin: 0;
}

mark {
    background: #ffeb3b;
    padding: 2px;
    border-radius: 3px;
}

.sev {
    padding: 4px 10px;
    border-radius: 6px;
    color: white;
    font-weight: bold;
    text-transform: capitalize;
}

.sev-critical { background: #d50000; }
.sev-high     { background: #ff1744; }
.sev-medium   { background: #ff9100; }
.sev-low      { background: #2979ff; }
.sev-info     { background: #9e9e9e; }
</style>

<script>
function initSearch() {
    const input = document.getElementById("search");
    const rows = document.querySelectorAll("tbody tr");

    input.addEventListener("input", () => {
        const q = input.value.toLowerCase();
        rows.forEach(r => {
            r.style.display = r.innerText.toLowerCase().includes(q) ? "" : "none";
        });
    });
}

function initSort() {
    document.querySelectorAll("th").forEach((th, idx) => {
        th.addEventListener("click", () => {
            const tbody = th.closest("table").querySelector("tbody");
            const rows = Array.from(tbody.querySelectorAll("tr"));
            const asc = th.dataset.asc = !(th.dataset.asc === "true");

            rows.sort((a,b) => {
                const A = a.children[idx].innerText.toLowerCase();
                const B = b.children[idx].innerText.toLowerCase();
                return asc ? A.localeCompare(B) : B.localeCompare(A);
            });

            rows.forEach(r => tbody.appendChild(r));
        });
    });
}

window.onload = () => {
    initSearch();
    initSort();
};
</script>

</head>
<body>

<h1>Sentinel Security Scan Report</h1>
<p><b>Generated:</b> ${new Date().toLocaleString()}</p>
<p><b>Total Secrets Found:</b> ${results.length}</p>

<div class="search-box">
    <input type="search" id="search" placeholder="Search in results...">
</div>

<table>
<thead>
<tr>
    <th>Rule</th>
    <th>File</th>
    <th>Line</th>
    <th>Match</th>
    <th>Context</th>
    <th>Severity</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

</body>
</html>
`;

    fs.writeFileSync(outputPath, html, "utf-8");
}

module.exports = { generateHTMLReport };
