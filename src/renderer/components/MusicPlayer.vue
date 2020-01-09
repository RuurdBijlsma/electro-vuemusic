<template>
    <div>
        <audio ref="audio"/>
        <div class="music-player" v-if="track !== null && queue.length > 0">
            <md-content :class="`player-page${fullPage ? ' show-full-page' : ''}`">
                <div class="background-blur" :style="`background-image: url(${track.album.images[0].url})`"></div>
                <div class="background-gradient"
                     :style="`background-image: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,1) 100%)`"></div>
                <div class="page-content">
                    <div class="up">
                        <div class="top-bar">
                            <md-button class="md-icon-button" @click="closeFullPage">
                                <md-icon>keyboard_arrow_down</md-icon>
                            </md-button>
                        </div>
                        <div v-if="track.album.images.length > 0" class="preview-image"
                             :style="`background-image: url(${track.album.images[0].url})`"></div>
                    </div>
                    <div class="down">
                        <p class="md-headline">{{track.name}}</p>
                        <artists-span :artists="track.artists"/>
                        <md-button class="md-icon-button page-local" v-if="local">
                            <md-icon>
                                cloud_download
                            </md-icon>
                            <md-tooltip>Playing offline</md-tooltip>
                        </md-button>
                        <md-button class="md-icon-button page-local" v-else>
                            <md-icon>
                                wifi_tethering
                            </md-icon>
                            <md-tooltip>Playing online stream</md-tooltip>
                        </md-button>

                        <div class="complete-seek">
                            <div class="track-time" v-if="$refs.hasOwnProperty('audio')">
                                {{toHms($refs.audio.currentTime)}}
                            </div>
                            <div class="seek-container seek-page" ref="seekContainerPage" @mousedown="down"
                                 @touchstart="down($event.touches[0])">
                                <md-content class="seek">
                                    <md-content class="seek-progress md-accent"
                                                :style="`width: ${Math.round(seekProgress * 100)}%`"/>
                                    <md-content class="seek-thumb md-accent"
                                                :style="`left: ${Math.round(seekProgress * 100)}%`"/>
                                </md-content>
                            </div>
                            <div class="track-time">
                                {{($refs.hasOwnProperty('audio') && $refs.audio.duration) ? toHms($refs.audio.duration)
                                : ''}}
                            </div>
                        </div>
                        <div class="controls">
                            <md-button class="md-icon-button" @click="$store.commit('toggleRepeat')">
                                <md-icon :class="repeat ? 'md-primary' : ''">repeat</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="skip(-1)">
                                <md-icon>skip_previous</md-icon>
                            </md-button>
                            <md-button class="play md-icon-button" v-if="loadingAudio">
                                <md-icon>cached</md-icon>
                            </md-button>
                            <md-button class="play md-icon-button" v-else-if="!playing"
                                       @click="play">
                                <md-icon>play_arrow</md-icon>
                            </md-button>
                            <md-button class="play md-icon-button" v-else @click="pause">
                                <md-icon>pause</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="skip(1)">
                                <md-icon>skip_next</md-icon>
                            </md-button>
                            <md-button class="md-icon-button" @click="$store.commit('toggleShuffle')">
                                <md-icon :class="shuffle ? 'md-primary' : ''">shuffle</md-icon>
                            </md-button>
                        </div>
                    </div>
                    <md-content class="snippet-content">
                        <track-list class="queue-snippet" :tracks="queueSnippet" :snippet="true"/>
                    </md-content>
                </div>
            </md-content>
            <md-content :class="`player-bar${fullPage ? ' hide-bar' : ''}`">
                <div class="top-player">
                    <div v-if="track.album.images.length > 0" class="track-image" @click="openFullPage"
                         :style="`background-image: url(${track.album.images[track.album.images.length - 1].url})`"></div>
                    <div class="info-text">
                        <span @click="openFullPage">{{track.name}}</span>
                        <span class="dot">•</span>
                        <artists-span :artists="track.artists"/>
                    </div>
                    <md-button class="md-icon-button local-icon" v-if="local">
                        <md-icon>
                            cloud_download
                        </md-icon>
                        <md-tooltip md-direction="top">Playing offline</md-tooltip>
                    </md-button>
                    <md-button class="md-icon-button local-icon" v-else>
                        <md-icon>
                            wifi_tethering
                        </md-icon>
                        <md-tooltip md-direction="top">Playing online stream</md-tooltip>
                    </md-button>
                </div>
                <div class="bottom-player">
                    <div class="left-content">
                        <md-button class="md-icon-button" @click="$store.commit('toggleShuffle')" v-if="windowWidth > 700">
                            <md-icon :class="$store.state.shuffle?'md-primary':'gray'">shuffle</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="skip(-1)">
                            <md-icon>skip_previous</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" v-if="loadingAudio">
                            <md-icon>cached</md-icon>
                        </md-button>
                        <md-button :class="`md-icon-button${windowWidth > 700?' play-circle':''}`" v-else-if="!playing"
                                   @click="play">
                            <md-icon>play_arrow</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" v-else @click="pause">
                            <md-icon>pause</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="skip(1)">
                            <md-icon>skip_next</md-icon>
                        </md-button>
                        <md-button class="md-icon-button" @click="$store.commit('toggleRepeat')" v-if="windowWidth > 700">
                            <md-icon :class="$store.state.repeat?'md-primary':'gray'">repeat</md-icon>
                        </md-button>
                    </div>
                    <div class="middle-content">

                        <div class="complete-seek">
                            <div class="track-time" v-if="$refs.hasOwnProperty('audio') && windowWidth > 600">
                                {{toHms($refs.audio.currentTime)}}
                            </div>
                            <div class="seek-container" ref="seekContainer"
                                 :style="`width: ${windowWidth > 600 ? 'calc(100% - 110px)' : '100%'}`"
                                 @mousedown="down"
                                 @touchstart="down($event.touches[0])">
                                <md-content class="seek">
                                    <md-content class="seek-progress md-primary"
                                                :style="`width: ${Math.round(seekProgress * 100)}%`"/>
                                    <md-content class="seek-thumb md-primary"
                                                :style="`left: ${Math.round(seekProgress * 100)}%`"/>
                                </md-content>
                            </div>
                            <div class="track-time" v-if="windowWidth > 600">
                                {{($refs.hasOwnProperty('audio') && $refs.audio.duration) ? toHms($refs.audio.duration)
                                : ''}}
                            </div>
                        </div>
                        <!--                        <div class="seek-container" ref="seekContainer" @mousedown="down"-->
                        <!--                             @touchstart="down($event.touches[0])">-->
                        <!--                            <md-content class="seek">-->
                        <!--                                <md-content class="seek-progress md-primary"-->
                        <!--                                            :style="`width: ${Math.round(seekProgress * 100)}%`"/>-->
                        <!--                                <md-content class="seek-thumb md-primary"-->
                        <!--                                            :style="`left: ${Math.round(seekProgress * 100)}%`"/>-->
                        <!--                            </md-content>-->
                        <!--                        </div>-->
                    </div>
                    <div class="right-content">
                        <md-button :key="favoriteButtonKey" v-if="track.hasOwnProperty('favorite')"
                                   class="md-icon-button"
                                   @click="toggleFavorite">
                            <md-icon v-if="track.favorite">favorite</md-icon>
                            <md-icon v-else>favorite_border</md-icon>
                        </md-button>
                        <div class="volume" v-if="windowWidth > 650">
                            <md-button class="md-icon-button volume-icon">
                                <md-icon>volume_up</md-icon>
                            </md-button>
                            <input v-model="volume" class="volume-input" type="range" min="0" max="1" step="0.01">
                        </div>
                    </div>
                </div>
            </md-content>
        </div>
    </div>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";
    import SpotifyApi from "../js/SpotifyApi";
    import Utils from "../js/Utils";
    import TrackList from "./TrackList";

    console.log("MusicPlayer 1");
    export default {
        name: "MusicPlayer",
        components: {TrackList, ArtistsSpan},
        data() {
            return {
                windowWidth: innerWidth,
                fullPage: false,
                track: null,
                queue: [],
                queueSnippet: [],
                shuffledQueue: [],
                favoriteButtonKey: 0,
                toggling: false,
                seekProgress: 0.7,
                playing: false,
                loadingAudio: false,
                dontPlay: false,
                interval: -1,
                seeking: false,
                local: false,
                shuffle: false,
                repeat: true,
                volume: 1,
            }
        },
        mounted() {
            if (this.queue.length === 0 && localStorage.getItem('queue') !== null)
                this.$store.commit('setQueue', JSON.parse(localStorage.queue));

            if (!this.track && localStorage.getItem('track') !== null) {
                this.dontPlay = true;
                this.$store.commit('setTrack', JSON.parse(localStorage.track));
            }

            if (localStorage.getItem('repeat') !== null)
                this.$store.commit('setRepeat', JSON.parse(localStorage.repeat));
            if (localStorage.getItem('shuffle') !== null)
                this.$store.commit('setShuffle', JSON.parse(localStorage.shuffle));

            if (localStorage.getItem('volume') !== null)
                this.volume = JSON.parse(localStorage.volume);

            let audio = this.$refs.audio;

            audio.onplay = () => {
                // navigator.mediaSession.playbackState = 'playing';
                this.playing = true;
            };
            audio.onpause = () => {
                // navigator.mediaSession.playbackState = 'paused';
                this.playing = false;
            };

            this.interval = setInterval(() => {
                if (!audio.duration)
                    this.seekProgress = 0;
                else {
                    this.seekProgress = audio.currentTime / audio.duration;
                    this.setMediaPosition();
                }
            }, 1000 / 30);

            document.addEventListener('mousemove', e => this.move(e));
            document.addEventListener('touchmove', e => this.move(e.touches[0]));
            document.addEventListener('mouseup', () => this.seeking = false);
            document.addEventListener('touchend', () => this.seeking = false);

            window.addEventListener('resize', this.updateWindowSize);

            this.updateQueueSnippet();
        },
        methods: {
            updateWindowSize() {
                this.windowWidth = window.innerWidth
            },
            openFullPage() {
                this.fullPage = true;
            },
            closeFullPage() {
                this.fullPage = false;
            },
            down(e) {
                this.seeking = true;
                this.move(e);
            },
            move(e) {
                if (this.seeking) {
                    let container = this.fullPage ? this.$refs.seekContainerPage : this.$refs.seekContainer;
                    let x = e.pageX - container.offsetLeft;
                    let progress = x / container.offsetWidth;
                    progress = Math.min(1, Math.max(0, progress));
                    let audio = this.$refs.audio;
                    if (audio.duration)
                        audio.currentTime = audio.duration * progress;
                }
            },
            async playSong(previousTrack, track) {
                let play = !this.dontPlay;
                this.dontPlay = false;

                if (previousTrack !== null && previousTrack.id === track.id && play)
                    return await this.play();

                await this.loadSong(track);
                if (play)
                    await this.play();

            },
            async loadSong(track) {
                return new Promise(async resolve => {
                    let audio = this.$refs.audio;
                    this.loadingAudio = true;
                    this.setTrackMetaData(track);

                    let {url, local} = await SpotifyApi.getUrl(Utils.trackToQuery(track));
                    console.log(url);
                    audio.src = url;
                    this.local = local;
                    audio.onended = () => this.skip(1);
                    audio.oncanplay = () => {
                        this.loadingAudio = false;
                        resolve();
                    }
                });
            },
            async play() {
                await this.$refs.audio.play();
            },
            async pause() {
                this.$refs.audio.pause();
            },
            async skip(n) {
                if (n === -1 && this.$refs.audio.currentTime > 5) {
                    this.$refs.audio.currentTime = 0;
                    return;
                }
                let currentIndex = this.getTrackIndex(this.track);
                let newIndex = (currentIndex + n) % this.queue.length;
                if (newIndex < 0)
                    newIndex += this.queue.length;
                this.$store.commit('setTrack', this.getQueue()[newIndex]);
            },
            getQueue() {
                return this.$store.state.shuffle ? this.shuffledQueue : this.queue;
            },
            getTrackIndex(track) {
                let queue = this.getQueue();
                return queue.findIndex(t => t.id === track.id);
            },
            setMediaPosition() {
                let audio = this.$refs.audio;
                if (audio.duration && navigator.hasOwnProperty('mediaSession') && navigator.mediaSession.hasOwnProperty('setPositionState')) {
                    navigator.mediaSession.setPositionState({
                        duration: audio.duration,
                        playbackRate: 1,
                        position: audio.currentTime,
                    })
                }
            },
            setTrackMetaData(track) {
                let artistsString = track.artists.map(a => a.name).join(', ');
                document.title = track.name + ' - ' + artistsString;
                // document.querySelector('meta[name="theme-color"').content = track.color;

                if (!('mediaSession' in navigator))
                    return;

                let image = 'img/notfound.png';
                if (track.album.images.length > 0)
                    image = track.album.images[0].url;

                // eslint-disable-next-line no-undef
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: track.name,
                    artist: artistsString,
                    album: track.album.name,
                    artwork: [
                        {src: image, type: 'image/png'},
                    ]
                });
                navigator.mediaSession.setActionHandler('play', async () => {
                    await this.play();
                });
                navigator.mediaSession.setActionHandler('pause', async () => {
                    await this.pause();
                });
                navigator.mediaSession.setActionHandler('previoustrack', () => {
                    this.skip(-1);
                });
                navigator.mediaSession.setActionHandler('nexttrack', () => {
                    this.skip(1);
                });
            },
            async toggleFavorite() {
                if (this.toggling) return;
                if (!this.track) return;
                this.toggling = true;

                if (!this.track.hasOwnProperty('favorite')) {
                    this.track.favorite = (await SpotifyApi.api.containsMySavedTracks([this.track.id]))[0];
                    console.log("This track favorite status was unknown, it's now", this.track.favorite);
                }

                if (this.track.favorite) {
                    let response = await SpotifyApi.api.removeFromMySavedTracks([this.track.id]);
                    console.log("removed", this.track.id, {response});
                    this.track.favorite = false;
                } else {
                    let response = await SpotifyApi.api.addToMySavedTracks([this.track.id]);
                    console.log("added", this.track.id, {response});
                    this.track.favorite = true;
                }
                this.favoriteButtonKey++;
                this.toggling = false;
            },
            toHms: Utils.secondsToHms,
            updateQueueSnippet() {
                if (!this.track)
                    return;
                let queue = this.getQueue();
                let index = queue.findIndex(t => t.id === this.track.id);
                if (index === -1) {
                    console.log("Current track", this.track.name, "not found in queue:", queue);
                    this.queueSnippet = [];
                    return;
                }
                let beforeItems = 3;
                let afterItems = 5;
                let sliceStart = Math.max(0, index - beforeItems);
                let sliceEnd = index + afterItems;
                this.queueSnippet = queue.slice(sliceStart, sliceEnd);
            }
        },
        watch: {
            $route() {
                this.fullPage = false;
            },
            volume() {
                localStorage.volume = this.volume;
                this.$refs.audio.volume = this.volume;
            },
            '$store.state.queue'() {
                //Only triggers on actual queue change, so shuffling here is fine
                this.queue = this.$store.state.queue;
                this.updateQueueSnippet();
                this.shuffledQueue = Utils.shuffleArray(JSON.parse(JSON.stringify(this.queue)));
                localStorage.queue = JSON.stringify(this.queue);
            },
            '$store.state.track'() {
                let previous = this.track;
                this.track = this.$store.state.track;
                this.updateQueueSnippet();
                this.playSong(previous, this.track);
                localStorage.track = JSON.stringify(this.track);
            },
            '$store.state.shuffle'() {
                this.shuffle = this.$store.state.shuffle;
                this.updateQueueSnippet();
                localStorage.shuffle = this.$store.state.shuffle;
            },
            '$store.state.repeat'() {
                this.repeat = this.$store.state.repeat;
                localStorage.repeat = this.$store.state.repeat;
            },
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.updateWindowSize);
            clearInterval(this.interval);
        }
    }
    console.log("MusicPlayer 2");
</script>

<style scoped>
    .music-player {
        pointer-events: none;
    }

    .player-bar {
        pointer-events: all;
        transform: translateY(-56px);
        width: 100vw;
        height: 106px;
        display: flex;
        flex-direction: column;
        background-color: #3b3b3b !important;
        padding: 8px;
        z-index: 2;
    }

    .top-player {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .track-image {
        min-width: 40px;
        height: 40px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 2px;
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    }

    .info-text {
        overflow-x: auto;
        white-space: nowrap;
        flex-grow: 1;
        margin-left: 15px;
    }

    .info-text::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }

    .info-text > span {
        display: inline-block;
        padding-top: 10px;
        padding-bottom: 10px;
    }

    .dot {
        padding-left: 5px;
        padding-right: 5px;
    }

    .local-icon {
        margin: 0;
        opacity: 0.7;
    }

    .page-local {
        opacity: 0.7;
        margin: -10px 0 0;
    }

    .bottom-player {
        display: flex;
        justify-content: space-between;
    }

    .left-content {
        display: flex;
    }

    .bottom-player .md-icon-button {
        margin: 0;
    }

    .md-icon-button {
        transform: scale(0.85);
    }

    .middle-content {
        flex-grow: 1;
        padding: 0 15px;
    }

    .seek-container {
        height: 30px;
        width: calc(100% - 110px);
        display: flex;
        justify-content: start;
        flex-direction: column;
        cursor: pointer;
    }

    .seek {
        pointer-events: none;
        width: 100%;
        display: inline-block;
        height: 6px;
        top: 8px;
        position: relative;
        border-radius: 3px;
    }

    .seek-progress {
        height: 100%;
        border-radius: 3px;
    }

    .seek-thumb {
        transform: translate(-9px, -12px);
        width: 18px;
        height: 18px;
        position: relative;
        border-radius: 50%;
    }

    .right-content {
        display: flex;
    }

    .volume-icon {
        transform: scale(0.85) translateY(-11px);
    }

    .volume {
        padding: 10px;
    }

    .volume-input {
        transform: translateY(2px);
        -webkit-appearance: none;
        width: 100px;
        height: 14px;
        border-radius: 7px;
        background-color: rgba(255, 255, 255, 0.2);
        cursor: pointer;
    }

    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 14px;
        height: 14px;
        border-radius: 7px;
        background-color: var(--md-theme-default-primary)
    }

    input[type=range]:focus {
        outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
    }

    input[type=range]::-ms-track {
        width: 100%;
        cursor: pointer;

        /* Hides the slider so custom styles can be added */
        background: transparent;
        border-color: transparent;
        color: transparent;
    }

    .player-page {
        pointer-events: all;
        width: 100%;
        height: 100%;
        position: fixed;
        top: 0;
        left: 0;
        transition: 0.2s;
        transform: translateY(100vh);
        z-index: 3;
        overflow-x: hidden;
    }

    .show-full-page {
        transform: translateY(0px);
    }

    .background-blur {
        width: 100vw;
        height: 100%;
        top: 0;
        left: 0;
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        filter: blur(50px);
        position: fixed;
        pointer-events: none;
        z-index: 0;
    }

    .background-gradient {
        width: 100vw;
        height: 100%;
        pointer-events: none;
        position: fixed;
        z-index: 0;
        top: 0;
        left: 0;
    }

    .page-content {
        width: 100vw;
        height: 100%;
        position: fixed;
        z-index: 1;
        top: 0;
        left: 0;
        text-align: center;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .up {
        min-height: 45%;
    }

    .down {
        min-height: 32%;
    }

    .down .md-headline {
        min-height: 80px;
        max-height: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70%;
        position: relative;
        left: 15%;
        text-align: center;
        display: block;
        margin-bottom: 0px;
    }

    .top-bar {
        display: flex;
        justify-content: center;
    }

    .top-bar .md-icon-button {
        transform: scale(1.5);
        opacity: 0.5;
    }

    .preview-image {
        width: 80vw;
        max-width: 300px;
        max-height: 300px;
        height: 80vw;
        margin: 10vw;
        position: relative;
        box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: inline-block;
    }

    .player-page .complete-seek {
        padding: 20px;
    }

    .complete-seek {
        display: flex;
        padding: 10px;
        justify-content: space-between;
    }

    .complete-seek .track-time {
        width: 35px;
    }

    .track-time:nth-child(1) {
        text-align: left;
    }

    .track-time:nth-child(2) {
        text-align: right;
    }

    .seek-page {
        margin-top: -10px;
        display: block;
        width: calc(100% - 120px);
    }

    .seek-page .seek {
        filter: invert();
    }

    .seek-page .seek > * {
        filter: invert();
    }

    .controls .md-icon-button {
        margin: 10px;
        transform: scale(1);
    }

    .play {
        margin: 20px;
        transform: scale(1.5) !important;
        box-shadow: 0 0 0 1px white;
    }

    .gray{
        opacity:0.7;
    }

    .play-circle{
        transform: scale(1) !important;
        box-shadow: 0 0 0 1px white;
    }

    .snippet-content {
        margin: 10px;
        border-radius: 5px;
    }

    .queue-snippet {
        padding: 20px;
    }

</style>