import path from "path";
import fs from "fs";
import Directories from "../../node/Directories";


export default class Utils {
    static cleanTempFolder() {
        let files = fs.readdirSync(Directories.temp);
        for (const file of files) {
            fs.unlinkSync(path.join(Directories.temp, file));
        }
    }

    static syncLocalStorage() {
        //Handle localStorage to file sync
        let dir = Directories.files;
        let localStorageFile = path.join(dir, 'localStorage.json');
        Utils.syncInterval = setInterval(() => {
            let data = JSON.stringify(localStorage);
            fs.writeFileSync(localStorageFile, data);
        }, 3000);
        if (fs.existsSync(localStorageFile)) {
            let ls = JSON.parse(fs.readFileSync(localStorageFile));
            for (let key in ls)
                if (ls.hasOwnProperty(key) && localStorage.getItem(key) === null) {
                    console.log("Importing localStorage ", key, "from file");
                    localStorage[key] = ls[key];
                } else {
                    console.log("NOT importing localStorage", key, "from file");
                }
        }
    }

    static getServer() {
        return this.isLocal() ? 'http://localhost:3000' : 'https://ruurd.dev:3000';
    }

    static isLocal() {
        return location.href.includes('localhost') ||
            location.href.includes('127.0.0.1') ||
            location.href.includes('192.168.0');
    }

    static secondsToHms(seconds) {
        if (isNaN(seconds) || seconds === undefined)
            return '0:00';

        seconds = Math.round(seconds);
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = seconds % 60;
        h = h.toString();
        m = m.toString();
        s = s.toString();
        if (h !== '0') {
            m = m.padStart(2, '0');
            s = s.padStart(2, '0');
        }
        s = s.padStart(2, '0');

        if (h === '0')
            return `${m}:${s}`;
        else return `${h}:${m}:${s}`;
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static trackToQuery(track) {
        return `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
    }

    static bytesToReadable(bytes) {
        let length = Math.log10(bytes);
        if (length < 2) {
            return bytes + ' B';
        } else if (length < 5) {
            return (bytes / 1024).toFixed(2) + ' kB';
        } else if (length < 8) {
            return (bytes / (1024 ** 2)).toFixed(2) + ' MB';
        } else if (length < 12) {
            return (bytes / (1024 ** 3)).toFixed(2) + ' GB';
        } else if (length < 15) {
            return (bytes / (1024 ** 4)).toFixed(2) + ' TB';
        }
        return 'very bige bytes';
    }
}