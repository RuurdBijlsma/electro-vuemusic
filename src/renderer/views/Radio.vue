<template>
    <div>
        <div class="info-preview">
            <div class="radio-image" :style="`background-image: url(${image})`"></div>
            <p class="md-title">{{title}}</p>
            <p class="md-caption">{{subtitle}}</p>
        </div>
        <track-list :key="updateTracks" :track-retrieve="trackRetrieve"/>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import TrackList from "../components/TrackList";

    export default {
        name: "Radio",
        components: {TrackList},
        data() {
            return {
                trackRetrieve: null,
                image: '',
                title: 'Radio',
                subtitle: 'Radio',
                updateTracks: 0,
            }
        },
        async mounted() {
            this.init();
        },
        methods: {
            async init() {
                let options = this.$route.query;
                for (let key in options) {
                    if (!options.hasOwnProperty(key))
                        continue;
                    if (!isNaN(+options[key])) {
                        options[key] = +options[key];
                    }
                }

                let retrieveOptions = JSON.parse(JSON.stringify(options));
                delete retrieveOptions.custom;
                console.log({retrieveOptions});
                this.trackRetrieve = async (offset, limit) => {
                    retrieveOptions.offset = offset;
                    retrieveOptions.limit = limit;
                    let result = await SpotifyApi.api.getRecommendations(retrieveOptions);
                    return result.tracks;
                };
                this.updateTracks++;

                let tracks = [],
                    artists = [],
                    genres = [];
                if (options.hasOwnProperty('seed_tracks'))
                    tracks = options.seed_tracks.split(',');
                if (options.hasOwnProperty('seed_artists'))
                    artists = options.seed_artists.split(',');
                if (options.hasOwnProperty('seed_genres'))
                    genres = options.seed_genres.split(',');

                if (options.custom) {
                    this.image = './img/recommendation.png';
                    this.title = 'Custom Playlist';
                    let subtitle = '';
                    if (genres.length > 0) {
                        subtitle = genres.map(genre => genre.split('-')
                            .map(w => w.substr(0, 1).toUpperCase() + w.substr(1))
                            .join(' ')).join(', ');
                    }
                    this.subtitle = subtitle;
                } else if (tracks.length > 0) {
                    let result = await SpotifyApi.api.getTrack(tracks[0]);
                    this.image = result.album.images[0].url;
                    this.title = result.name + ' Song Radio';
                } else if (artists.length > 0) {
                    let result = await SpotifyApi.api.getArtist(artists[0]);
                    this.image = result.images[0].url;
                    this.title = result.name + ' Artist Radio';
                } else {
                    let optionsClone = JSON.parse(JSON.stringify(options));
                    optionsClone.limit = 1;
                    let firstTrack = (await SpotifyApi.api.getRecommendations(optionsClone)).tracks[0];
                    this.image = firstTrack.album.images[0].url;
                    this.title = genres[0].split('-')
                        .map(w => w.substr(0, 1).toUpperCase() + w.substr(1))
                        .join(' ');
                    this.subtitle = 'Genre Radio';
                }
            }
        },
        watch: {
            $route() {
                this.init();
            }
        }
    }
</script>

<style scoped>
    .info-preview {
        text-align: center;
    }

    .radio-image {
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