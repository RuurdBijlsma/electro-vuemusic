import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import Directories from "../../node/Directories";

class Credentials extends EventEmitter {
    constructor() {
        super();
        let dir = Directories.files;
        console.log(Directories);
        this.credentialsFile = path.join(dir, 'credentials.json');
        console.log('Credentials file location', path.resolve(this.credentialsFile));
        this.spotifyId = '';
        this.spotifySecret = '';
        this.youtubeKey = '';
        this.importFromFile();
    }

    filled() {
        return this.spotifySecret !== '' && this.spotifyId !== '' && this.youtubeKey !== '';
    }

    importFromFile() {
        try {
            let data = fs.readFileSync(this.credentialsFile);
            data = JSON.parse(data);
            this.spotifyId = data.spotifyId;
            this.spotifySecret = data.spotifySecret;
            this.youtubeKey = data.youtubeKey;
        } catch (e) {
            console.warn("Error importing credentials", e);
        }
    }

    async save() {
        return new Promise((resolve, reject) => {
            let data = JSON.stringify({
                spotifyId: this.spotifyId,
                spotifySecret: this.spotifySecret,
                youtubeKey: this.youtubeKey,
            });
            fs.writeFile(this.credentialsFile, data, err => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }
}

export default new Credentials();