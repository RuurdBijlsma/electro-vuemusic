import youtube from './Youtube.mjs';
import fs from 'fs';
import path from 'path';

class Cacher {
    constructor() {
        this.songDirectory = 'res/vue-music/files/';
        this.cachingSongs = [];
        this.events = {};
        this.maxConcurrentDownload = 1;
    }

    createDir() {
        if (!fs.existsSync(this.songDirectory)) {
            fs.mkdirSync(this.songDirectory);
        }
    }

    fileExists(file) {
        return new Promise((resolve) => {
            console.log("acceses file", file);
            resolve(fs.existsSync(file));
            return;
            // fs.access(file, (err) => {
            //     if (err){
            //         resolve(false);
            //         return;
            //     }
            //     resolve(true);
            // });
        });
    }

    async cacheIfNotExists(query) {
        let fileExists = await this.fileExists(this.toPath(query));
        console.log(query + " exists? ", fileExists);

        if (!fileExists)
            await this.cache(query);
    }

    toPath(query) {
        query = query.replace(/([^a-z0-9 ]+)/gi, '-');
        return path.join(this.songDirectory, query) + '.mp3';
    }

    timeout(ms) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms);
        });
    }

    async cache(query, stream) {
        return new Promise(async (resolve) => {
            if (this.cachingSongs.includes(query)) {
                resolve(false);
                return;
            }

            this.cachingSongs.push(query);

            let filePath = this.toPath(query);

            youtube.download(stream, filePath).then(() => {
                this.cachingSongs.splice(this.cachingSongs.indexOf(query), 1);
                resolve(true);
                this.fire('query' + query);
            });
        });
    }

    fire(event) {
        if (this.events[event])
            for (let i = this.events[event].length - 1; i >= 0; i--)
                this.events[event][i]();
    }

    once(event) {
        return new Promise(resolve => {
            let callback;
            callback = () => {
                this.off(event, callback);
                resolve();
            };
            this.on(event, callback);
        });
    }

    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];

        this.events[event].push(callback);
    }

    off(event, callback) {
        if (event in this.events)
            this.events[event].splice(this.events[event].indexOf(callback), 1);
        else
            console.warn('Cacher', `Trying to remove ${event} event, but it does not exist`);

    }
}

export default new Cacher();