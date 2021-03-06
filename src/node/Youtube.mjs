import Utils from "../renderer/js/Utils";
import ytdl from "ytdl-core";
import fs from "fs";
import youtubeSearch from "youtube-search";
import Credentials from "../renderer/js/Credentials";
import ffBinaries from 'ffbinaries';
import child_process from 'child_process';
import path from 'path';
import EventEmitter from 'events';
import http from 'http';
import https from 'https';
import Directories from "./Directories";
import store from '../renderer/store';

process.env.FLUENTFFMPEG_COV = 0;

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

        setInterval(() => {
            console.log("Clearning searchCache");
            this.searchCache = {};
        }, 1000 * 60 * 60 * 24 * 20);
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
                this.ffmpegPath = path.join(Directories.files, './ffmpeg');
                resolve(this.ffmpegPath);
                this.downloadingFfmpeg = false;
                this.emit('downloadedFfmpeg');
            });
        });
    }

    async ffmpegMetadata(fileInput, fileOutput, coverImageFile, tags, processHolder) {
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
            processHolder.process = exec(command, (error, stdout, stderr) => {
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
            let file = fs.createWriteStream(destinationFile);
            let requester = http;
            if (url.startsWith('https'))
                requester = https;

            requester.get(url, response => {
                response.pipe(file);
                response.on('end', () => {
                    response.unpipe(file);
                    response.destroy();
                    file.close();
                    resolve();
                });
            }).on('error', e => reject(e));
        });
    }

    async wait(ms) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), ms);
        });
    }

    async download(stream, destinationFile, spotifyTrack) {
        return new Promise(resolve => {
            let tempFile1 = path.join(Directories.temp, destinationFile + '.tmp.mp3');
            let tempFile2 = path.join(Directories.temp, destinationFile + '.ffmpeg.mp3');
            let destinationPath = path.join(Directories.music, destinationFile);
            console.log("Created download stream", spotifyTrack, store);
            let done = false;
            let processHolder = {process: false};
            //For debug retrying the meta data and rename process
            let finalize = () => {
            };
            let cancel = () => {
                // finalize();
                console.warn("CANCELLING DOWNLOAD", spotifyTrack, done, processHolder);
                if (!done)
                    stream.destroy();
                else if (processHolder.process)
                    processHolder.process.kill();

                resolve(false);
                store.commit('setDownload', [spotifyTrack, -2, -2, cancel]);
            };

            let writer = fs.createWriteStream(tempFile1, {flags: 'w'});

            stream.on('progress', async (chunkLength, downloaded, totalLength) => {
                downloaded = +downloaded;
                totalLength = +totalLength;
                store.commit('setDownload', [spotifyTrack, downloaded, totalLength, cancel]);
                console.log("Download progress", spotifyTrack, downloaded / totalLength, downloaded, totalLength);
                if (downloaded === totalLength) {
                    done = true;
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
                    let imageDir = '';
                    if (hasImage) {
                        imageDir = path.join(Directories.temp, Utils.trackToQuery(spotifyTrack) + '.tmp.jpg');
                        await this.downloadFile(spotifyTrack.album.images[0].url, imageDir);
                    }
                    stream.unpipe(writer);
                    writer.close();
                    // stream.close();
                    stream.destroy();
                    finalize = async () => {
                        await this.ffmpegMetadata(tempFile1, tempFile2, imageDir, tags, processHolder);
                        if (processHolder.process)
                            processHolder.process.kill();
                        processHolder.process = false;
                        console.log("Renaming temp ffmpeg file to destination file");
                        fs.rename(tempFile2, destinationPath, err => {
                            console.log("Deleting temp file", tempFile2, 'err?', err);
                            store.commit('setDownload', [spotifyTrack, -1, -1, cancel]);
                            resolve(true);
                            if (imageDir)
                                fs.unlink(imageDir, err => {
                                    if (err)
                                        console.warn('Could not delete temp file', imageDir, err);
                                });
                            fs.unlink(tempFile1, err => {
                                if (err)
                                    console.warn("Could not delete temp file", tempFile1, err);
                            });
                        });
                    }
                    store.commit('setDownload', [spotifyTrack, downloaded, totalLength, cancel]);
                    setTimeout(() => {
                        finalize();
                    }, 2000);
                }
            });

            console.log("Creating temp file");
            stream.pipe(writer);
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
        if (!this.searchCache.hasOwnProperty(key)) {
            let result = await this.searchYt(query, maxResults, category);
            this.searchCache[key] = result;
            return result;
        }

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

let yt = new Youtube();
export default yt;