import Utils from "../renderer/js/Utils";

process.env.FLUENTFFMPEG_COV = 0;

import ytdl from "ytdl-core";
import fs from "fs";
import youtubeSearch from "youtube-search";
import Credentials from "../renderer/js/Credentials";
import ffBinaries from 'ffbinaries';
import child_process from 'child_process';
import path from 'path';
import EventEmitter from 'events';
import downloadFile from 'download-file';
import Directories from "./Directories";

const exec = child_process.exec;

console.log("Downloaded");


class Youtube extends EventEmitter {
    constructor() {
        super();
        this.baseUrl = 'http://www.youtube.com/watch?v=';
        this.ytdlOptions = {
            quality: 'highestaudio',
            filter: 'audioonly',
        };
        this.searchCache = {};
        this.ffmpegPath = false;
        this.downloadingFfmpeg = false;
    }

    tagsToString(tags) {
        let result = [];
        for (let tag in tags)
            if (tags.hasOwnProperty(tag))
                if (tags[tag] instanceof Array)
                    for (let part of tags[tag])
                        result.push(`-metadata ${tag}="${part}"`);
                else
                    result.push(`-metadata ${tag}="${tags[tag]}"`);
        return result.join(' ');
    }

    async getFfmpegPath() {
        return new Promise(resolve => {
            if (this.ffmpegPath)
                return resolve(this.ffmpegPath);
            if (this.downloadingFfmpeg)
                return this.once('downloadedFfmpeg', () => resolve(this.ffmpegPath));

            ffBinaries.downloadBinaries(['ffmpeg'], {destination: Directories.files}, () => {
                this.ffmpegPath = path.resolve('./ffmpeg');
                resolve(this.ffmpegPath);
                this.downloadingFfmpeg = false;
                this.emit('downloadedFfmpeg');
            });
        });
    }

    async ffmpegMetadata(fileInput, fileOutput, coverImageFile, tags) {
        return new Promise(async (resolve, reject) => {
            let ffmpegPath = await this.getFfmpegPath();
            let command;
            if (coverImageFile) {
                command = `${ffmpegPath} -y -i "${fileInput}" -i "${coverImageFile}"` +
                    ` -map 0:0 -map 1:0 -id3v2_version 3 -metadata:s:v title="Album cover" -metadata:s:v comment="Cover (Front)" ` +
                    `${this.tagsToString(tags)} "${fileOutput}"`;
            } else {
                command = `${ffmpegPath} -y -i "${fileInput}"` +
                    `${this.tagsToString(tags)} "${fileOutput}"`;
            }
            console.log("Executing ffmpeg command", command);
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return reject(error);
                }
                // console.log(`stdout: ${stdout}`);
                // console.log(`stderr: ${stderr}`);
                resolve({err: stderr, out: stdout});
            });
        })
    }

    urlById(id) {
        return this.baseUrl + id;
    }

    async downloadFile(url, destinationFile) {
        return new Promise((resolve, reject) => {
            const options = {
                directory: Directories.temp,
                filename: destinationFile
            };

            downloadFile(url, options, err => {
                if (err) reject(err);
                resolve();
            });
        })
    }

    async download(stream, destinationFile, spotifyTrack) {
        return new Promise(resolve => {
            let tempFile1 = path.join(Directories.temp, destinationFile + '.tmp');
            let tempFile2 = path.join(Directories.temp, destinationFile + '.ffmpeg.mp3');
            let destinationPath = path.join(Directories.music, destinationFile);
            console.log("Created download stream", spotifyTrack);

            stream.on('progress', async (chunkLength, downloaded, totalLength) => {
                if (downloaded === totalLength) {
                    console.log("Youtube", "Download FINISHED ", destinationFile);
                    let tags = {
                        title: spotifyTrack.name,
                        artist: spotifyTrack.artists.map(a => a.name),
                        disc: spotifyTrack.disc_number,
                        track: spotifyTrack.track_number,
                    };
                    if (spotifyTrack.hasOwnProperty('album'))
                        tags.album = spotifyTrack.album.name;
                    console.log("FFMPEGing file metadata", tags);

                    let hasImage = spotifyTrack.hasOwnProperty('album') && spotifyTrack.album.images.length > 0;
                    let imageFile = '';
                    if (hasImage) {
                        imageFile = Utils.trackToQuery(spotifyTrack) + '.tmp.jpg';
                        await this.downloadFile(spotifyTrack.album.images[0].url, imageFile);
                    }
                    let imageDir = imageFile ? path.join(Directories.temp, imageFile) : '';
                    await this.ffmpegMetadata(tempFile1, tempFile2, imageDir, tags);
                    console.log("Renaming temp ffmpeg file to destination file");
                    fs.rename(tempFile2, destinationPath, err => {
                        console.log("Deleting temp file", tempFile2, 'err?', err);
                        resolve(downloaded);
                        if (imageFile)
                            fs.unlink(imageDir, err => {
                                if (err)
                                    console.warn('Could not delete temp file', imageDir, err);
                            });
                        fs.unlink(tempFile1, err => {
                            if (err)
                                console.warn("Could not delete temp file", tempFile1, err);
                        });
                    })
                }
            });

            console.log("Creating temp file");
            stream.pipe(fs.createWriteStream(tempFile1, {flags: 'w'}));
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