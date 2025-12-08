const fs = require('fs');
const path = require('path');

class FileLoader {
  /**
   * @param {string} dir
   * @param {Array} ignoreDirs - directories to ignore by name
   * @param {Array} includeExtensions - e.g. ['.js','.html'], empty = all
   * @param {boolean} verbose
   * @returns {Array<string>}
   */
  static getAllFiles(dir, ignoreDirs = ['node_modules', '.git'], includeExtensions = [], verbose = false) {
    const results = [];
    if (!fs.existsSync(dir)) return results;

    function walk(current) {
      let list = [];
      try { list = fs.readdirSync(current); }
      catch (e) { if (verbose) console.warn(`Cannot read ${current}: ${e.message}`); return; }
      list.forEach(name => {
        const full = path.join(current, name);
        let stat;
        try { stat = fs.lstatSync(full); } catch (e) { if (verbose) console.warn(`lstat failed ${full}: ${e.message}`); return; }
        if (stat.isSymbolicLink()) return; 
        if (stat.isDirectory()) {
          if (!ignoreDirs.includes(name)) walk(full);
          else if (verbose) console.log(`Skipping dir ${full}`);
        } else {
          if (includeExtensions.length === 0 || includeExtensions.includes(path.extname(name))) {
            results.push(full);
            if (verbose) console.log(`Added file ${full}`);
          }
        }
      });
    }

    walk(dir);
    return results.sort();
  }
}

module.exports = FileLoader;
