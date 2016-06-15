const sqlite3 = require('sqlite3').verbose();
let selectedFiles;
const analyzeDb = (index, callback) => {
    let skipBuggyIteration = true;
    const existingDb = new sqlite3.Database(selectedFiles[index]);
    existingDb.get('select * from sqlite_master', (err) => {
        if (err !== true && err) {
            callback(err);
        } else if (skipBuggyIteration) {
            skipBuggyIteration = false;
        } else if (++index < selectedFiles.length) {
            analyzeDb(index, callback);
        } else {
            selectedFiles = null;
            callback();
        }
    });
};

class Analyser {
    isValidDBs(files, callback) {
        if (typeof callback !== 'function') {
            throw new ReferenceError(`${callback} is not a function`);
        }
        selectedFiles = files;
        analyzeDb(0, callback);
    }
}

export default Analyser;
