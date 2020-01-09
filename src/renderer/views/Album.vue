<template>
    <div v-if="album!==null">
        <div class="info-preview">
            <div class="album-image" :style="`background-image: url(${album.images[0].url})`"></div>
            <p class="md-title">
                <md-button class="md-icon-button" @click="toggleFavorite">
                    <md-icon v-if="favorite">favorite</md-icon>
                    <md-icon v-else>favorite_border</md-icon>
                </md-button>
                <span class="album-name">{{album.name}}</span>
            </p>
            <p class="md-caption">
                Album by
                <artists-span :artists="album.artists"/>
                • {{new Date(album.release_date).getFullYear()}}
            </p>
        </div>
        <track-list :track-retrieve="trackRetrieve"/>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import TrackList from "../components/TrackList";
    import ArtistsSpan from "../components/ArtistsSpan";

    export default {
        name: "Album",
        components: {ArtistsSpan, TrackList},
        data() {
            return {
                album: null,
                trackRetrieve: null,
                favorite: false,
                toggling: false,
            }
        },
        async mounted() {
            if (!this.$route.query.hasOwnProperty('id')) {
                await this.$router.push('/');
                return;
            }

            let id = this.$route.query.id;
            this.album = await SpotifyApi.api.getAlbum(id);

            this.trackRetrieve = async (offset, limit) => {
                let tracks = (await SpotifyApi.api.getAlbum(id, {
                    offset,
                    limit
                })).tracks.items;
                tracks.forEach(t => t.album = this.album);
                console.log(this.album);
                return tracks;
            };

            console.log(this.album);

            let favorite = await SpotifyApi.api.containsMySavedAlbums([id]);
            this.favorite = favorite[0];
        },
        methods: {
            async toggleFavorite() {
                if (this.toggling) return;
                this.toggling = true;
                if (this.favorite) {
                    let response = await SpotifyApi.api.removeFromMySavedAlbums([this.album.id]);
                    console.log("removed", this.album.id, {response});
                    this.favorite = false;
                } else {
                    let response = await SpotifyApi.api.addToMySavedAlbums([this.album.id]);
                    console.log("added", this.album.id, {response});
                    this.favorite = true;
                }
                this.toggling = false;
            },
        }
    }
</script>

<style scoped>
    .info-preview {
        text-align: center;
    }

    .album-name {
        padding: 7px 0px;
        display: inline-block;
        vertical-align: middle;
    }

    .md-icon-button {
        transform: scale(0.85);
    }

    .album-image {
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
    }
</style>