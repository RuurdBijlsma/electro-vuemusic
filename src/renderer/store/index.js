import Vuex from "vuex";
import Vue from "vue";
import Utils from "../js/Utils";

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        track: null,
        queue: [],
        shuffle: false,
        repeat: true,
        downloads: [],
    },
    mutations: {
        setDownload(state, [track, downloaded, total, cancel]) {
            let index = state.downloads.findIndex(d => d.track.id === track.id);

            if (index === -1) {
                index = state.downloads.length;
                state.downloads.push({
                    track,
                    downloaded: Utils.bytesToReadable(downloaded),
                    total: Utils.bytesToReadable(total),
                    cancel,
                    progress: downloaded / total
                });
            } else {
                state.downloads[index].downloaded = Utils.bytesToReadable(downloaded);
                if (downloaded > 0)
                    state.downloads[index].progress = downloaded / total;
                else
                    state.downloads[index].progress = downloaded;
            }

            if (downloaded === -2)
                state.downloads.splice(index, 1);
        },
        toggleShuffle(state) {
            state.shuffle = !state.shuffle;
        },
        toggleRepeat(state) {
            state.repeat = !state.repeat;
        },
        setShuffle(state, shuffle) {
            state.shuffle = shuffle;
        },
        setRepeat(state, repeat) {
            state.repeat = repeat;
        },
        setTrack(state, track) {
            state.track = track;
        },
        setQueue(state, queue) {
            state.queue = queue;
        },
    },
});