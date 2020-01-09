import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

console.log("Store 1");
export default new Vuex.Store({
    state: {
        track: null,
        queue: [],
        shuffle: false,
        repeat: true,
    },
    mutations: {
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
    }
});
console.log("Store 2");