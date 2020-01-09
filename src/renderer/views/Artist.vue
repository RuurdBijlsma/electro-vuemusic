<template>
    <div v-if="artist!==null">
        <div class="info-preview">
            <div v-if="artist.images.length>0" class="artist-image"
                 :style="`background-image: url(${artist.images[0].url})`"></div>
            <p class="md-title">
                <md-button class="md-icon-button" @click="toggleFavorite">
                    <md-icon v-if="favorite">favorite</md-icon>
                    <md-icon v-else>favorite_border</md-icon>
                </md-button>
                <span class="artist-name">{{artist.name}}</span>
            </p>
            <p class="md-caption">
                {{artist.followers.total}} follower<span v-if="artist.followers.total !== 1">s</span>
            </p>
            <md-button @click="$router.push('/radio?seed_artists='+artist.id)" class="md-accent md-dense md-raised">Go
                to Artist Radio
            </md-button>
        </div>
        <p class="md-subheading fade">Top Tracks by {{artist.name}}</p>
        <track-list :key="updateKey" :tracks="topTracks"/>
        <p class="md-subheading fade">Albums</p>
        <div class="new-releases horizontal-scroll">
            <album-square v-for="album in albums" :key="album.id" type="album" :album="album" :big="true"/>
        </div>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import TrackList from "../components/TrackList";
    import AlbumSquare from "../components/AlbumSquare";

    export default {
        name: "Artist",
        components: {AlbumSquare, TrackList},
        data() {
            return {
                artist: null,
                topTracks: [],
                updateKey: 0,
                albums: [],
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
            this.artist = await SpotifyApi.api.getArtist(id);
            this.topTracks = (await SpotifyApi.api.getArtistTopTracks(id, 'US')).tracks;
            console.log('top tracks', this.topTracks);
            this.updateKey++;
            this.albums = (await SpotifyApi.api.getArtistAlbums(id, {limit: 50})).items;

            let favorite = await SpotifyApi.api.isFollowingArtists([id]);
            this.favorite = favorite[0];
        },
        methods: {
            async toggleFavorite() {
                if (this.toggling) return;
                this.toggling = true;
                if (this.favorite) {
                    let response = await SpotifyApi.api.unfollowArtists([this.artist.id]);
                    console.log("removed", this.artist.id, {response});
                    this.favorite = false;
                } else {
                    let response = await SpotifyApi.api.followArtists([this.artist.id]);
                    console.log("added", this.artist.id, {response});
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

    .artist-name {
        padding: 7px 0px;
        display: inline-block;
        vertical-align: middle;
    }

    .md-icon-button {
        transform: scale(0.85);
    }

    .artist-image {
        width: 150px;
        height: 150px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        display: block;
        margin: 30px auto;
        border-radius: 50%;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .info-preview .md-title {
        font-weight: bold;
    }

    .fade {
        opacity: 0.6;
    }

    .horizontal-scroll {
        display: flex;
        overflow-x: auto;
        margin-left: -16px;
        margin-top: 10px;
        margin-bottom: 30px;
        width: calc(100% + 16px * 2);
        padding: 0 16px;
    }
</style>