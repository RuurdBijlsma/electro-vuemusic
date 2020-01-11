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
                        <span class="button-text">Spotify</span>
                    </md-button>
                </div>
                <div class="drag-region"></div>
                <div class="right-content">
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
            <md-app-content>
                <router-view/>
            </md-app-content>
        </md-app>
        <music-player class="music-player"/>
        <md-bottom-bar class="bottom-bar" md-sync-route>
            <md-bottom-bar-item to="/" exact md-label="Home" md-icon="home"/>
            <md-bottom-bar-item to="/browse" exact md-label="Browse" md-icon="explore"/>
            <md-bottom-bar-item to="/search" md-label="Search" md-icon="search"/>
            <md-bottom-bar-item to="/library" md-label="Your Library" md-icon="library_music"/>
        </md-bottom-bar>
    </div>
</template>

<script>
    //TODO:
    //Some songs are silent???


    import SpotifyApi from "./js/SpotifyApi";
    import MusicPlayer from "./components/MusicPlayer";
    import {remote} from 'electron';

    let win = remote.getCurrentWindow();

    export default {
        name: 'home',
        components: {MusicPlayer},
        data() {
            return {
                fullscreen: false,
            }
        },
        mounted() {
            if (!SpotifyApi.authorized() && navigator.onLine)
                this.$router.push('/login');

            console.log(SpotifyApi);
            this.checkTrackState();

            window.addEventListener('resize', () => {
                this.fullscreen = win.isMaximized();
            })
        },
        methods: {
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
        watch: {
            '$store.state.track'() {
                this.checkTrackState();
            }
        }
    }
</script>

<style>
    @import url('https://fonts.googleapis.com/css?family=Material+Icons|Montserrat|Roboto:400,400i,500,600,700,800,900&display=swap');

    #app {
        font-family: 'Montserrat', 'Roboto', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    .my-app {
        padding-bottom: calc(56px + 106px);
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
        z-index: 2;
    }
</style>
