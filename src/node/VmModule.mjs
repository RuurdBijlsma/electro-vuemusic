import cacher from './Cacher.mjs';
import youtube from './Youtube.mjs'
import path from 'path';
import ytdl from "ytdl-core";
import Utils from "../renderer/js/Utils";
import Directories from "./Directories";


export default class VmModule {
    constructor() {
        // const app = electron.remote.app;
        cacher.songDirectory = Directories.music;
        console.log("CACHER SONGDIRECTORY", cacher.songDirectory);
        cacher.createDir();
    }

    async stream(spotifyTrack) {
        return new Promise(async resolve => {
            let query = Utils.trackToQuery(spotifyTrack);
            console.log("Directory:", path.resolve(cacher.toPath(query)));
            let file = cacher.toPath(query);
            console.log(1);
            let exists = await cacher.fileExists(file);
            console.log(2);
            if (exists) {
                console.log(3);
                console.log('VueMusic', "Streaming file", file);
                resolve('file:///' + file);
                return;
            }
            console.log(4);
            console.log('VueMusic', "Streaming YouTube", query);
            let results = await youtube.search(query, 1);
            console.log("Youtube search results", results, youtube);
            let id = results[0].id;
            let stream = ytdl(youtube.urlById(id), youtube.ytdlOptions);
            console.log("Created stream", stream);

            stream.on('info', info => {
                let formats = info.formats
                    .sort((a, b) => b.averageBitrate - a.averageBitrate)
                    .sort((a, b) => b.audioBitrate - a.audioBitrate)
                    .sort((a, b) => b.mimeType.startsWith('audio') - a.mimeType.startsWith('audio'));
                console.log("Found song, format: ", formats[0], formats);
                resolve(formats[0].url);
            });

            cacher.cache(stream, spotifyTrack).then(hasDownloaded => {
                console.log("VueMusic", "cacheIfNotExists finished, downloaded?", hasDownloaded);
            });
        })
    }
}