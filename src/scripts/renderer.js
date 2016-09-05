/**
 * Created by VenomVendor on 06/May/16.
 */
import fs from 'fs';
import { remote } from 'electron';

import Analyser from './controller/analyser';

const sqlite = require('sqlite3').verbose();

const analyser = new Analyser();
const dialog = remote.dialog;
const outputPath = 'final.sqlite';

fs.exists(outputPath, (exists) => {
    if (exists) {
        fs.unlinkSync(outputPath);
    }
    const db = new sqlite.Database(outputPath);
    db.serialize(() => {
    });
    db.close();
});

const openFile = () => {
    dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections']
    }, (selectedFiles) => {
        if (selectedFiles === undefined) {
            return;
        }
        analyser.isValidDBs(selectedFiles, (err) => {
            if (err) {
                console.log(err);
            } else {
                const dest = document.getElementById('selected-files');
                dest.innerHTML = `<i>${selectedFiles.join(', ')}</i>`;
            }
        });
    });
};

const select = document.getElementById('select-directory-new');
select.addEventListener('click', (e) => {
    e.preventDefault();
    openFile();
});

console.log(`Node:${process.versions.node}\nChrome:${process.versions.chrome}\nElectron:${process.versions.electron}`);
