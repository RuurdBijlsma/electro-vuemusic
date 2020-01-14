import ytdl from "ytdl-core";
import fs from "fs";
import youtubeSearch from "youtube-search";
import Credentials from "../renderer/js/Credentials";
// import taglib from 'taglib2';

class Youtube {
    constructor() {
        this.baseUrl = 'http://www.youtube.com/watch?v=';
        this.ytdlOptions = {
            quality: 'highestaudio',
            filter: 'audioonly',
        };
        this.searchCache = {};
    }

    urlById(id) {
        return this.baseUrl + id;
    }

    async download(stream, destinationFile) {
        return new Promise(resolve => {
            console.log("Created download stream");

            stream.on('progress', (chunkLength, downloaded, totalLength) => {
                if (downloaded === totalLength) {
                    console.log("Youtube", "Download FINISHED ", destinationFile);
                    console.log("Renaming temp file to normal file");
                    fs.rename(destinationFile + '.temp', destinationFile, err => {

                        if (err) console.warn("Youtube", "Could not rename destination file", destinationFile);
                        resolve(downloaded);
                    });
                }
            });

            console.log("Creating temp file");
            stream.pipe(fs.createWriteStream(destinationFile + '.temp', {flags: 'w'}));
        })
    }

    async getSongByteLength(songUrl, options) {
        return new Promise((resolve, reject) => {

            let stream = ytdl(songUrl, options);
            stream.on('response', httpResponse => {
                resolve(parseInt(httpResponse.headers["content-length"]));
                stream.destroy();
            });
            stream.on('error', error => {
                reject(error);
                stream.destroy();
            });
        })

    }

    timeout(ms, promise) {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                reject(new Error("timeout"))
            }, ms);
            promise.then(resolve, reject);
        })
    }

    async getStream(id) {
        return ytdl(this.urlById(id), this.ytdlOptions);
    }

    decodeEntities(encodedString) {
        const translate_re = /&(nbsp|amp|quot|lt|gt);/g;
        const translate = {
            "nbsp": " ",
            "amp": "&",
            "quot": "\"",
            "lt": "<",
            "gt": ">"
        };
        return encodedString.replace(translate_re, function (match, entity) {
            return translate[entity];
        }).replace(/&#(\d+);/gi, function (match, numStr) {
            const num = parseInt(numStr, 10);
            return String.fromCharCode(num);
        });
    }

    async search(query, maxResults = 5, category) {
        let key = query + maxResults + category;
        if (!this.searchCache.hasOwnProperty(key))
            this.searchCache[key] = await this.searchYt(query, maxResults, category);

        return this.searchCache[key];
    }

    async searchYt(query, maxResults = 5, category) {
        const key = Credentials.youtubeKey;
        console.log('Youtube', "Search:", query);

        return new Promise((resolve, error) => {
            const opts = {
                maxResults,
                key: key,
                type: 'video'
            };
            if (category !== undefined)
                opts.videoCategoryId = category;

            youtubeSearch(query, opts, (err, results) => {
                if (err) error(err);
                if (results) resolve(results);
                else resolve("Not found, YoutubeSearch error");
            });
        });
    }
}

export default new Youtube();