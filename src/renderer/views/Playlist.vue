<template>
    <div v-if="playlist!==null">
        <div class="info-preview">
            <div class="playlist-image" v-if="playlist.images.length > 0"
                 :style="`background-image: url(${playlist.images[0].url})`"></div>
            <p class="md-title">
                <md-button class="md-icon-button" @click="toggleFavorite">
                    <md-icon v-if="favorite">favorite</md-icon>
                    <md-icon v-else>favorite_border</md-icon>
                </md-button>
                <span class="playlist-name">{{playlist.name}}</span>
            </p>
            <p class="md-caption" v-if="playlist.description !== 'false'" v-html="playlist.description"/>
            <p class="md-caption">
                Playlist by {{playlist.owner.display_name}}
            </p>
        </div>
        <track-list :track-retrieve="trackRetrieve"/>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import TrackList from "../components/TrackList";

    export default {
        name: "Playlist",
        components: {TrackList},
        data() {
            return {
                playlist: null,
                trackRetrieve: null,
                favorite: false,
                toggling: false,
            }
        },
        async mounted() {
            this.init();
        },
        methods: {
            async init() {
                if (!this.$route.query.hasOwnProperty('id')) {
                    await this.$router.push('/');
                    return;
                }

                let id = this.$route.query.id;
                this.trackRetrieve = async (offset, limit) => (await SpotifyApi.api.getPlaylist(id, {
                    offset,
                    limit
                })).tracks.items.map(item => item.track);

                this.playlist = await SpotifyApi.api.getPlaylist(id);

                let me = await SpotifyApi.api.getMe();
                let favorite = await SpotifyApi.api.areFollowingPlaylist(id, [me.id]);
                this.favorite = favorite[0];
            },
            async toggleFavorite() {
                if (this.toggling) return;
                this.toggling = true;
                if (this.favorite) {
                    let response = await SpotifyApi.api.unfollowPlaylist(this.playlist.id);
                    console.log("removed", this.playlist.id, {response});
                    this.favorite = false;
                } else {
                    let response = await SpotifyApi.api.followArtists(this.playlist.id);
                    console.log("added", this.playlist.id, {response});
                    this.favorite = true;
                }
                this.toggling = false;
            },
        },
        watch: {
            $route() {
                this.playlist = null;
                this.trackRetrieve = null;
                this.favorite = false;
                this.toggling = false;
                this.init();
            }
        }
    }
</script>

<style scoped>
    .info-preview {
        text-align: center;
    }

    .playlist-name {
        padding: 7px 0px;
        display: inline-block;
        vertical-align: middle;
    }

    .md-icon-button {
        transform: scale(0.85);
    }

    .playlist-image {
        width: 150px;
        height: 150px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: block;
        margin: 30px auto;
        border-radius: 3px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .info-preview .md-title {
        font-weight: bold;
        margin-bottom: 0;
    }

    .info-preview .md-caption {
        max-width: 60%;
        display: block;
        margin: 10px auto;
    }
</style>