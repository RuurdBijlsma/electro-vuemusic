<template>
    <div class="track-item">
        <div class="left-content" :style="`
            width: ${lite?'calc(100vw - 110px)':'calc(100vw - 140px)'};
        `">
            <md-icon class="md-primary active-icon"
                     v-if=" $store.state.track !== null && $store.state.track.id === track.id">volume_up
            </md-icon>
            <div class="text-content" :style="`
                overflow-x: ${lite?'hidden':'auto'};
                width: ${lite?'100%':'calc(100% - 5px)'};
                text-overflow: ${lite?'ellipsis':'inherit'};
             `">
                <span class="text" @click="playSong">{{track.name}}</span>
                <span class="text dot">•</span>
                <artists-span class="text" :artists="track.artists"/>
            </div>
        </div>

        <div class="right-content">
            <span class="text" @click="playSong">{{toHms(track.duration_ms / 1000)}}</span>

            <md-button class="md-icon-button" @click="toggleFavorite" v-if="!lite && favorite !== undefined">
                <md-icon v-if="isFavorite">favorite</md-icon>
                <md-icon v-else>favorite_border</md-icon>
            </md-button>

            <md-menu class="menu" md-size="auto" md-align-trigger>
                <md-button class="md-icon-button" md-menu-trigger>
                    <md-icon>more_vert</md-icon>
                </md-button>

                <md-menu-content>
                    <md-menu-item v-if="lite && isFavorite" @click="toggleFavorite">Remove from saved tracks
                    </md-menu-item>
                    <md-menu-item v-if="lite && !isFavorite" @click="toggleFavorite">Add to saved tracks</md-menu-item>
                    <md-menu-item :to="`/radio?seed_tracks=${track.id}`" >Song radio</md-menu-item>
                    <md-menu-item v-if="track.hasOwnProperty('album')" :to="`/album?id=${track.album.id}`">
                        Go to album
                    </md-menu-item>
                    <md-menu-item v-if="!lite" @click="playlistDialog">Add to playlist</md-menu-item>
                </md-menu-content>
            </md-menu>
        </div>

        <md-dialog v-if="!lite" :md-active.sync="showDialog">
            <md-dialog-title>Add to playlist</md-dialog-title>

            <md-field class="select-field">
                <md-select v-model="selectedPlaylist" name="selectedPlaylist">
                    <md-option value="none">None</md-option>
                    <md-option v-for="playlist in playlists" :key="playlist.id" :value="playlist.id">{{playlist.name}}
                    </md-option>
                </md-select>
            </md-field>

            <md-dialog-actions>
                <md-button @click="showDialog = false">Cancel</md-button>
                <md-button class="md-primary" @click="addToPlaylist">Add to track to playlist</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import Utils from "../js/Utils";
    import ArtistsSpan from "./ArtistsSpan";
    import SpotifyApi from "../js/SpotifyApi";

    export default {
        name: "TrackItem",
        components: {ArtistsSpan},
        props: {
            //Spotify track object
            track: Object,
            favorite: {
                type: Boolean,
                default: undefined,
            },
            lite: {
                type: Boolean,
                default: false,
            }
        },
        data() {
            return {
                toggling: false,
                isFavorite: false,
                showDialog: false,
                playlists: [],
                selectedPlaylist: 'none',
            }
        },
        mounted() {
            this.isFavorite = this.favorite;
        },
        methods: {
            async addToPlaylist() {
                console.log(this.track, this.selectedPlaylist);
                if (this.selectedPlaylist === 'none') {
                    alert("Selected playlist can't be 'None'!");
                    return;
                }
                let response = await SpotifyApi.api.addTracksToPlaylist(this.selectedPlaylist, [this.track.uri]);
                console.log(`added ${this.track.name} to playlist ${this.selectedPlaylist}`, response);
                this.showDialog = false;
            },
            async playlistDialog() {
                let currentUser = await SpotifyApi.api.getMe();
                let playlists = await SpotifyApi.api.getUserPlaylists({limit: 50});
                this.playlists = playlists.items.filter(i => i.owner.display_name === currentUser.display_name || i.collaborative);
                console.log(this.playlists);
                this.showDialog = true;
            },
            playSong() {
                this.$emit("play");
            },
            async toggleFavorite() {
                if (this.toggling) return;
                this.toggling = true;
                if (this.isFavorite) {
                    let response = await SpotifyApi.api.removeFromMySavedTracks([this.track.id]);
                    console.log("removed", this.track.id, {response});
                    this.isFavorite = false;
                } else {
                    let response = await SpotifyApi.api.addToMySavedTracks([this.track.id]);
                    console.log("added", this.track.id, {response});
                    this.isFavorite = true;
                }
                this.toggling = false;
            },
            toHms: Utils.secondsToHms,
        },
        watch: {
            favorite() {
                this.isFavorite = this.favorite;

            },
            'track.favorite'() {

            }
        }
    }
</script>

<style scoped>
    .track-item {
        display: flex;
        justify-content: space-between;
    }

    .left-content {
        display: flex;
        justify-content: left;
        width: calc(100vw - 140px);
        text-align: left;
    }

    .right-content {
        display: flex;
        justify-content: right;
    }

    .right-content .md-icon-button {
        margin-right: -10px;
    }

    .active-icon {
        margin-right: 5px;
        transform: scale(0.8);
    }

    .text-content::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
    }

    .text-content {
        width: 100%;
        white-space: nowrap;
        overflow-x: hidden;
    }

    .md-icon-button {
        transform: scale(0.85);
        vertical-align: middle;
    }

    .text {
        vertical-align: middle;
        line-height: 42px;
    }

    .dot {
        padding-left: 5px;
        padding-right: 5px;
    }

    .select-field {
        margin: 20px;
        width: calc(100% - 40px);
    }

</style>