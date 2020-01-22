<template>
    <div id="app">
        <md-app class="my-app" md-mode="fixed">
            <md-app-toolbar class="md-primary toolbar">
                <div class="left-content">
                    <md-button v-if="$route.path !== '/'" class="md-icon-button back-button" @click="$router.go(-1)">
                        <md-icon>arrow_back_ios</md-icon>
                    </md-button>
                    <md-button to="/">
                        <md-icon>music_note</md-icon>
                        <span class="button-text">VueMusic</span>
                    </md-button>
                </div>
                <div class="drag-region"></div>
                <div class="right-content">
                    <md-button class="md-icon-button" to="/downloads">
                        <md-icon>cloud_download</md-icon>
                    </md-button>
                    <md-button class="md-icon-button" to="/settings">
                        <md-icon>settings</md-icon>
                    </md-button>
                    <md-button class="md-icon-button" @click="minimize()">
                        <md-icon>minimize</md-icon>
                    </md-button>
                    <md-button class="md-icon-button" v-if="fullscreen" @click="exitFullscreen">
                        <md-icon>fullscreen_exit</md-icon>
                    </md-button>
                    <md-button class="md-icon-button" v-else @click="goFullscreen()">
                        <md-icon>fullscreen</md-icon>
                    </md-button>
                    <md-button class="md-icon-button" @click="closeApp()">
                        <md-icon>close</md-icon>
                    </md-button>
                </div>
            </md-app-toolbar>
            <md-app-drawer md-permanent="full" class="drawer md-scrollbar">
                <md-list>
                    <md-list-item to="/" exact>
                        <md-icon>home</md-icon>
                        <span class="md-list-item-text">Home</span>
                    </md-list-item>
                    <md-list-item to="/browse">
                        <md-icon>explore</md-icon>
                        <span class="md-list-item-text">Browse</span>
                    </md-list-item>
                    <md-list-item to="/search">
                        <md-icon>search</md-icon>
                        <span class="md-list-item-text">Search</span>
                    </md-list-item>
                </md-list>
                <md-list class="md-dense">
                    <md-subheader class="smol-subheader">Your Library</md-subheader>

                    <md-list-item to="/liked-songs">
                        <span class="md-list-item-text">Liked Songs</span>
                    </md-list-item>
                    <md-list-item to="/library/albums">
                        <span class="md-list-item-text">Albums</span>
                    </md-list-item>
                    <md-list-item to="/library/artists">
                        <span class="md-list-item-text">Artists</span>
                    </md-list-item>
                    <md-list-item to="/library/playlists">
                        <span class="md-list-item-text">Playlists</span>
                    </md-list-item>

                    <md-subheader class="smol-subheader" v-if="playlists.length > 0">Playlists</md-subheader>
                    <md-list-item exact :to="`/playlist?id=${playlist.id}`" v-for="playlist in playlists"
                                  :key="playlist.id"
                                  class="playlist-list-item">
                        <span class="md-list-item-text">{{playlist.name}}</span>
                    </md-list-item>
                </md-list>
            </md-app-drawer>
            <md-app-content>
                <router-view/>
            </md-app-content>
        </md-app>
        <music-player class="music-player" :wide="windowWidth >= 600"/>
        <md-bottom-bar class="bottom-bar" md-sync-route v-if="windowWidth < 600">
            <md-bottom-bar-item to="/" exact md-label="Home" md-icon="home"/>
            <md-bottom-bar-item to="/browse" exact md-label="Browse" md-icon="explore"/>
            <md-bottom-bar-item to="/search" md-label="Search" md-icon="search"/>
            <md-bottom-bar-item to="/library" md-label="Your Library" md-icon="library_music"/>
        </md-bottom-bar>
    </div>
</template>

<script>
    //TODO:
    //Improve now playing for big screens
    //Improve loading of liked songs
    //Fix seek/volume bars for white theme

    import SpotifyApi from "./js/SpotifyApi";
    import MusicPlayer from "./components/MusicPlayer";
    import electron from 'electron';
    import Credentials from "./js/Credentials";
    import Utils from "./js/Utils";

    const remote = electron.remote;


    console.log(Credentials, SpotifyApi);
    let win = remote.getCurrentWindow();

    export default {
        name: 'home',
        components: {MusicPlayer},
        data() {
            return {
                fullscreen: false,
                playlists: [],
                routeHistory: [],
                windowWidth: window.innerWidth,
                windowInterval: -1,
            }
        },
        async mounted() {
            window.addEventListener('resize', () => {
                this.fullscreen = win.isMaximized();
                this.windowWidth = window.innerWidth;
                this.updateBottomPadding();
            });

            document.addEventListener('keypress', e => {
                if (e.key === '`') {
                    remote.getCurrentWindow().openDevTools();
                }
                if (e.key === 'r' && e.ctrlKey)
                    location.reload();
            });

            this.init();
            //Being sure bottom padding is correct, it's overwritten somewhere after this function by vue-material
            this.updateBottomPadding();
            setTimeout(() => {
                this.updateBottomPadding();
            }, 10);
            setTimeout(() => {
                this.updateBottomPadding();
            }, 100);
            this.windowInterval = setInterval(() => {
                this.updateBottomPadding();
            }, 500);
        },
        methods: {
            updateBottomPadding() {
                let element = document.querySelector('.my-app');
                let currentPadding = element.style.paddingBottom;
                if (this.windowWidth >= 600 && currentPadding !== '106px') {
                    console.log("RESIZE TO BIG");
                    element.style.paddingBottom = '106px';
                } else if (this.windowWidth < 600 && currentPadding !== '162px') {
                    console.log("RESIZE TO SMOL");
                    element.style.paddingBottom = '162px';
                }
            },
            async init() {
                if (!Credentials.filled()) {
                    await this.$router.push('/settings');
                    return;
                }
                if (!SpotifyApi.authorized() && navigator.onLine) {
                    if (SpotifyApi.auth.refresh !== null) {
                        console.log("Doing short refresh token :)");
                        await SpotifyApi.fullRefresh();
                    } else {
                        console.log("Push login" + '\n' + JSON.parse(localStorage.auth).refresh + '\n' + SpotifyApi.auth.refresh);
                        await this.$router.push('/login');
                        return;
                    }
                }

                console.log(SpotifyApi);
                this.checkTrackState();

                this.playlists = (await SpotifyApi.api.getUserPlaylists()).items;
                console.log('playlists in app.vue', this.playlists)
            },
            minimize() {
                win.minimize();
            },
            goFullscreen() {
                win.maximize();
                this.fullscreen = true;
            },
            exitFullscreen() {
                win.unmaximize();
                this.fullscreen = false;
            },
            closeApp() {
                win.close();
            },
            checkTrackState() {
                if (this.$store.state.track === null) {
                    document.querySelector('.my-app').style.paddingBottom = '56px';
                } else {
                    document.querySelector('.my-app').style.paddingBottom = 'calc(56px + 106px)';
                }
            }
        },
        beforeDestroy() {
            clearInterval(this.windowInterval);
            if (Utils.hasOwnProperty('syncInterval'))
                clearInterval(Utils.syncInterval);
        },
        watch: {
            '$store.state.track'() {
                this.checkTrackState();
            },
            $route() {
                let hist = this.routeHistory[this.routeHistory.length - 1];
                if (hist && (hist.includes('login') || hist.includes('settings'))) {
                    //Coming from login page
                    this.init();
                }
                this.routeHistory.push(this.$route.path);
                console.log("HISTORY", this.routeHistory);
            },
        }
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css?family=Material+Icons|Montserrat|Roboto:400,400i,500,600,700,800,900&display=swap');

    p, span {
        cursor: inherit;
    }

    #app {
        font-family: 'Montserrat', 'Roboto', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .my-app {
        /*padding-bottom: calc(56px + 106px);*/
        max-height: 100vh;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
    }

    .toolbar .drag-region {
        -webkit-app-region: drag;
        flex-grow: 2;
        height: calc(100% - 10px);
        top: 5px;
        position: relative;
    }

    .drawer {
        padding-top: 10px;
        max-width: 200px !important;
    }

    .smol-subheader {
        font-size: 10px !important;
        text-transform: uppercase;
    }

    .playlist-list-item {
        opacity: 0.9;
        font-size: 10px !important;
    }

    .bottom-bar {
        position: fixed;
        bottom: 0;
        height: 56px;
    }

    .back-button {
        transform: translateY(4px);
    }

    .button-text {
        margin-left: 10px;
        font-size: 15px;
        vertical-align: middle;
    }

    .music-player {
        position: fixed;
        bottom: 0;
        z-index: 3;
    }
</style>
