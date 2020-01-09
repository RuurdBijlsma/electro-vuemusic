<template>
    <div>
        <p class="big-search md-headline">Search</p>
        <md-content class="search-box md-primary">

            <md-field md-inline>
                <label>
                    <md-icon>search</md-icon>
                    Artists, songs or albums</label>
                <md-input class="search-input" v-model="query" @keyup.enter="search"/>
            </md-field>
        </md-content>
        <md-content class="search-results" v-if="results">
            <p class="md-title">Tracks</p>
            <p class="md-caption" v-if="tracks.length === 0">No tracks found :(</p>
            <track-list :key="updateTracks" :tracks="tracks"/>
            <p class="md-title">Albums</p>
            <p class="md-caption" v-if="albums.length === 0">No albums found :(</p>
            <div class="albums horizontal-scroll">
                <album-square v-for="album in albums" :key="album.id" type="album" :album="album"/>
            </div>
            <p class="md-title">Playlists</p>
            <p class="md-caption" v-if="playlists.length === 0">No playlists found :(</p>
            <div class="artists horizontal-scroll">
                <album-square v-for="playlist in playlists" :key="playlist.id" type="playlist" :album="playlist"/>
            </div>
            <p class="md-title">Artists</p>
            <p class="md-caption" v-if="artists.length === 0">No artists found :(</p>
            <div class="playlists horizontal-scroll">
                <album-square v-for="artist in artists" :key="artist.id" type="artist" :album="artist"/>
            </div>
        </md-content>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import TrackList from "../components/TrackList";
    import AlbumSquare from "../components/AlbumSquare";

    export default {
        name: "Search",
        components: {AlbumSquare, TrackList},
        data() {
            return {
                query: '',
                results: false,
                tracks: [],
                albums: [],
                artists: [],
                playlists: [],
                updateTracks: 0,
            }
        },
        mounted() {
            if (this.$route.query.hasOwnProperty('q')) {
                this.query = this.$route.query.q;
                this.getSearchResults();
            }
        },
        methods: {
            async search() {
                await this.$router.push({
                    path: this.$route.path,
                    query: {q: this.query}
                });

                this.getSearchResults();
            },
            async getSearchResults() {
                let results = await SpotifyApi.api.search(this.query,
                    ['track', 'album', 'playlist', 'artist'], {limit: 8});


                this.tracks = results.tracks.items;
                this.updateTracks++;
                this.albums = results.albums.items;
                this.playlists = results.playlists.items;
                this.artists = results.artists.items;
                this.results = true;

            },
        },
        watch: {
            '$route.query.q': function () {
                this.query = this.$route.query.q || '';
                if (this.query === '')
                    this.results = false;
                else
                    this.getSearchResults();
            }
        }
    }
</script>

<style scoped>
    .big-search {
        text-align: center;
    }

    .search-box {
        padding: 5px 20px;
        border-radius: 5px;
    }

    .search-input {
        text-align: center !important;
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

    .scroll-square {
        min-width: 120px;
        min-height: 140px;
        margin-right: 10px;
        cursor: pointer;
        width: 100%;
    }

    .scroll-square:last-child {
        padding-right: 135px;
    }

    .preview-image {
        min-width: 120px;
        min-height: 120px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 3px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .preview-title {
        font-size: 11px;
        margin: 5px;
        min-width: 120px;
        font-weight: bolder;
        line-height: 150%;
    }

    .preview-description {
        font-size: 11px;
        margin: 5px;
        min-width: 120px;
        text-overflow: ellipsis;
        word-wrap: break-word;
        overflow: hidden;
        max-height: 60px;
        opacity: 0.6;
        font-weight: bolder;
        line-height: 150%;
    }

</style>