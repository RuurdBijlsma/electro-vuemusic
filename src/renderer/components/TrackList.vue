<template>
    <div class="track-list" v-if="renderedTracks.length>0">
        <p class="song-count" v-if="!snippet">
            <span>{{dataTracks.length}} song<span v-if="dataTracks.length !== 1">s</span></span>
            <span> • </span>
            <span>{{toHms(dataTracks.map(t=>t.duration_ms).reduce((a,b)=>a+b) / 1000)}}</span>
        </p>
        <md-button class="md-raised md-primary shuffle-button" v-if="!snippet && dataTracks.length > 1"
                   @click="shuffle">
            <md-icon class="shuffle-icon">shuffle</md-icon>
            <span class="shuffle-text">Shuffle</span>
        </md-button>
        <recycle-scroller
                :items="renderedTracks"
                class="recycle-list"
                :item-size="50"
                key-field="id"
                v-slot="{ item, index }">
            <track-item class="track-item" :track="item" :favorite="snippet ? undefined : favorites[index]"
                        @play="playTrack(item)"/>
        </recycle-scroller>
    </div>
    <div v-else>
        <p>No tracks found</p>
    </div>
</template>

<script>
    /* eslint-disable no-constant-condition */

    import TrackItem from "./TrackItem";
    import Utils from "../js/Utils";
    import SpotifyApi from "../js/SpotifyApi";

    const maxRender = 50;

    export default {
        name: "TrackList",
        components: {TrackItem},
        props: {
            //TrackRetrieve should be a function with input params: (offset, limit), output: list of track objects
            trackRetrieve: {
                type: Function,
                default: null,
            },
            tracks: {
                type: Array,
                default: () => [],
            },
            snippet: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                dataTracks: [],
                renderedTracks: [],
                favorites: [],
                interval: -1,
            }
        },
        async mounted() {
            if (this.tracks.length > 0 || this.trackRetrieve === null) {
                //Initial tracks has been set, don't use api to get more ||
                this.dataTracks = this.tracks;
                console.log('initialTracks set!', this.tracks);
                this.renderedTracks = this.dataTracks.slice(0, maxRender);
                this.favorites = await this.checkSavedTracks(this.dataTracks);
                return;
            }

            console.log("Automatically retrieving all tracks");


            this.dataTracks = await this.getAll();
            this.favorites = await this.checkSavedTracks(this.dataTracks);
            this.renderedTracks = this.dataTracks.slice(0, maxRender);

            document.querySelector('.md-app-scroller').addEventListener('scroll', this.handleScroll);
        },
        methods: {
            shuffle() {
                if (!this.$store.state.shuffle)
                    this.$store.commit('toggleShuffle');
                this.$store.commit('setQueue', this.dataTracks);
                let randomTrack = this.dataTracks[Math.floor(Math.random() * this.dataTracks.length)];
                this.$store.commit('setTrack', randomTrack);
            },
            playTrack(track) {
                this.$store.commit('setTrack', track);
                if (!this.snippet)
                    this.$store.commit('setQueue', this.dataTracks);
            },
            async checkSavedTracks(tracks) {
                if (tracks.length === 0)
                    return;

                let maxBatch = 50;
                let favorites = [];
                for (let i = 0; i < tracks.length; i += maxBatch) {
                    let slice = tracks.slice(i, i + maxBatch);
                    favorites = favorites.concat(await SpotifyApi.api.containsMySavedTracks(slice.map(t => t.id)))
                }

                for (let i = 0; i < favorites.length; i++)
                    tracks[i].favorite = favorites[i];

                return favorites;
            },
            async getAll() {
                this.dataTracks = [];
                let limit = 50,
                    offset = 0;

                while (true) {
                    let [complete, newTracks] = await this.getMore(this.dataTracks, offset, limit);
                    // console.log({complete, newTracks});

                    offset += newTracks.length;
                    this.dataTracks = this.dataTracks.concat(newTracks);
                    if (this.dataTracks.length > 20 && this.renderedTracks.length < 20)
                        this.renderedTracks = this.dataTracks.slice(0, 20);

                    if (complete || newTracks.length < limit)
                        return this.dataTracks;
                }
            },
            async getMore(existingTracks, offset = 0, limit = 50) {
                let complete = false;

                let newTracks = await this.trackRetrieve(offset, limit);
                newTracks = newTracks.filter(n => n !== null);

                let filteredNewTracks = newTracks.filter(track => !existingTracks.map(t => t.id).includes(track.id));

                if (filteredNewTracks.length !== newTracks.length) {
                    complete = true;
                }


                return [complete, filteredNewTracks];
            },
            handleScroll() {
                let scroller = document.querySelector('.md-app-scroller');
                let bottomDistance = scroller.scrollHeight - (scroller.scrollTop + scroller.offsetHeight);
                if (bottomDistance < 200) {
                    this.renderedTracks = this.renderedTracks.concat(this.dataTracks.slice(this.renderedTracks.length, this.renderedTracks.length + maxRender));
                }
            },
            toHms: Utils.secondsToHms,
        },
        watch: {
            async tracks() {
                this.dataTracks = this.tracks;
                this.renderedTracks = this.dataTracks.slice(0, maxRender);
                this.favorites = await this.checkSavedTracks(this.dataTracks);
            }
        },
        destroyed() {
            document.querySelector('.md-app-scroller').removeEventListener('scroll', this.handleScroll);
            clearInterval(this.interval);
        }
    }
</script>

<style scoped>
    .track-list {
        /*padding-bottom: 20px;*/
    }

    .song-count {
        opacity: 0.6;
        font-size: 11px;
        text-align: center;
    }

    .shuffle-button {
        width: 60%;
        border-radius: 20px;
        display: block;
        margin: 20px auto;
    }

    .shuffle-icon {
        margin-right: 10px;
        vertical-align: middle;
        transform: scale(0.8);
    }

    .shuffle-text {
        vertical-align: middle;
        font-weight: bolder;
    }
</style>