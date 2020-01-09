<template>
    <div>

        <md-tabs class="tabs">
            <md-tab id="tab-categories" md-label="Categories" md-icon="playlist_play">
                <div class="tunable">
                    <md-button to="/tune" class="md-raised md-accent">Generate tunable playlist</md-button>
                    <p class="md-caption">Generate a playlist of recommended tracks based on a number of tunable factors, such as acousticness, danceability and much more</p>
                </div>
                <div class="grid">
                    <album-square v-for="category in categories"
                                  :key="category.id"
                                  type="category"
                                  :album="category"
                                  class="square"/>
                </div>
            </md-tab>
            <md-tab id="tab-genres" md-label="Genres" md-icon="bubble_chart">
                <md-list>
                    <md-list-item v-for="genre in genres" :key="genre"
                                  :to="`/radio?seed_genres=${genre.replace(/ /gi, '-').toLowerCase()}`">{{genre}}
                    </md-list-item>
                </md-list>
            </md-tab>
        </md-tabs>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import AlbumSquare from "../components/AlbumSquare";

    export default {
        name: "Browse",
        components: {AlbumSquare},
        data() {
            return {
                categories: [],
                genres: [],
            }
        },
        async mounted() {
            this.categories = (await SpotifyApi.api.getCategories({limit: 50})).categories.items;

            this.genres = (await SpotifyApi.api.getAvailableGenreSeeds()).genres
                .map(g => g.split('-')
                    .map(w => w.substr(0, 1).toUpperCase() + w.substr(1)).join(' '));
        }
    }
</script>

<style scoped>
    .tunable{
        text-align: center;
        padding-top:15px;
    }
    .tabs {
        padding-bottom: 20px;
        margin-left: -15px;
        margin-top: -15px;
        width: calc(100% + 30px)
    }

    .grid {
        text-align: center;
    }

    .square {
        display: inline-grid;
        margin: 20px;
    }
</style>