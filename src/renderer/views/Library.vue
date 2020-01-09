<template>
    <div>
        <md-tabs class="tabs">
            <md-tab id="tab-playlists" md-label="Playlists" md-icon="playlist_play">
                <md-button class="liked-songs md-raised md-accent" :to="`/liked-songs`">Liked Tracks
                </md-button>
                <md-button class="new-playlist-button" @click="showCreateDialog">
                    <md-icon class="new-playlist-icon">add</md-icon>
                    <div class="new-playlist-text">Create new playlist</div>
                </md-button>
                <album-row v-for="playlist in playlists" :key="playlist.id" :album="playlist" type="playlist"/>
            </md-tab>
            <md-tab id="tab-artists" md-label="Artists" md-icon="face">
                <album-row v-for="artist in artists" :key="artist.id" :album="artist" type="artist"/>
            </md-tab>
            <md-tab id="tab-albums" md-label="Albums" md-icon="album">
                <album-row v-for="album in albums" :key="album.id" :album="album" type="album"/>
            </md-tab>
        </md-tabs>
        <md-dialog :md-active.sync="showDialog">
            <md-dialog-title>Create new playlist</md-dialog-title>

            <md-field class="field">
                <label>Playlist name</label>
                <md-input v-model="playlistName"/>
            </md-field>
            <md-field class="field">
                <label>Playlist description</label>
                <md-textarea v-model="playlistDescription"/>
            </md-field>
            <div class="field">
                <p class="md-caption">A playlist cannot be both public and collaborative</p>
                <md-switch v-model="playlistPublic">Publicly accessible</md-switch>
                <md-switch v-model="playlistCollaborative" value="1">Collaborative</md-switch>
            </div>

            <md-dialog-actions>
                <md-button class="md-primary" @click="showDialog = false">Close</md-button>
                <md-button class="md-primary" @click="createPlaylist">Create</md-button>
            </md-dialog-actions>
        </md-dialog>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import AlbumRow from "../components/AlbumRow";

    export default {
        name: "Library",
        components: {AlbumRow},
        data() {
            return {
                playlists: [],
                albums: [],
                showDialog: false,
                artists: [],
                playlistName: '',
                playlistDescription: '',
                playlistPublic: true,
                playlistCollaborative: false,
            }
        },
        async mounted() {
            await this.updatePlaylists();
            this.artists = (await SpotifyApi.api.getFollowedArtists()).artists.items;

            this.albums = (await SpotifyApi.api.getMySavedAlbums()).items.map(i => i.album)
        },
        methods: {
            async updatePlaylists() {
                let playlists = (await SpotifyApi.api.getUserPlaylists()).items;
                this.playlists = playlists.sort(a => {
                    if (a.owner.display_name === 'Spotify')
                        return -1;
                    return 1;
                });
            },
            showCreateDialog() {
                this.showDialog = true;
            },
            async createPlaylist() {
                let me = await SpotifyApi.api.getMe();

                let response = await SpotifyApi.api.createPlaylist(me.id, {
                    name: this.playlistName,
                    public: this.playlistPublic,
                    collaborative: this.playlistCollaborative,
                    description: this.playlistCollaborative
                });
                console.log("Created playlist: ", this.playlistName, response);
                this.showDialog = false;
                this.updatePlaylists();
            }
        },
        watch: {
            playlistCollaborative() {
                if (this.playlistCollaborative)
                    this.playlistPublic = false;
            },
            playlistPublic() {
                if (this.playlistPublic)
                    this.playlistCollaborative = false;
            }
        }
    }
</script>

<style scoped>
    .tabs {
        padding-bottom: 20px;
        margin-left: -15px;
        margin-top: -15px;
        width: calc(100% + 30px)
    }

    .liked-songs {
        width: 50%;
        display: block;
        margin: 25px auto;
    }

    .new-playlist-button {
        display: flex !important;
    }

    .new-playlist-icon {
        transform: scale(0.85);
        margin-right: 10px;
    }

    .new-playlist-text {
        display: inline-block;
        vertical-align: middle;
    }

    .field {
        margin: 20px;
        width: calc(100% - 40px);
    }

</style>