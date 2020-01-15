import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import electron from "electron";

class Credentials extends EventEmitter {
    constructor() {
        super();
        let app = electron.app;
        if (electron.hasOwnProperty('remote'))
            app = electron.remote.app;
        let dir = path.join(app.getPath('music'), 'vuemusic');
        this.credentialsFile = path.join(dir, './credentials.json');
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