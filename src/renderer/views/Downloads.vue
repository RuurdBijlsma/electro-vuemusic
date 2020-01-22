import path from "path";
<template>
    <div>
        <p class="md-title">Downloads</p>

        <p class="md-caption" v-if="$store.state.downloads.length === 0">
            There are no ongoing downloads, once a download is in progress it will appear here.
        </p>

        <md-card class="download" v-for="download in $store.state.downloads" :key="download.track.id">
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title title">{{download.track.name}}</div>
                    <artists-span class="artists-text md-subhead" :artists="download.track.artists"/>
                </md-card-header-text>

                <md-card-media>
                    <img :src="getImage(download.track)" alt="Album cover">
                </md-card-media>
            </md-card-header>
            <md-progress-bar class="md-primary" :md-mode="`${download.progress===1?'in':''}determinate`"
                             :md-value="download.progress * 100" v-if="download.progress !== -1"/>

            <md-card-actions md-alignment="space-between">
                <md-button disabled v-if="download.progress >= 0 && download.progress < 1">
                    Downloading {{download.downloaded}} / {{download.total}}
                </md-button>
                <md-button disabled v-else-if="download.progress === 1">
                    Processing metadata...
                </md-button>
                <md-button disabled v-else>
                    Downloaded
                    <md-icon class="md-primary">check</md-icon>
                </md-button>
                <md-button @click="download.cancel" v-if="download.progress === -1">Dismiss</md-button>
                <md-button @click="download.cancel" v-else>Cancel</md-button>
            </md-card-actions>
        </md-card>
    </div>
</template>

<script>
    import {baseUrl} from '../../node/BaseUrl';
    import ArtistsSpan from "../components/ArtistsSpan";

    export default {
        name: "Downloads",
        components: {ArtistsSpan},
        data() {
            return {}
        },
        async mounted() {

        },
        methods: {
            getImage(track) {
                if (track.hasOwnProperty('album') && track.album.images.length > 0)
                    return track.album.images[0].url;

                return path.join(baseUrl, '/img/liked.png').replace(/\\/gi, '/');
            }
        }
    }
</script>

<style scoped>
    .download {
        background-color: rgba(128, 128, 128, 0.2);
        margin-bottom: 30px;
        max-width: 500px;
    }

    .artists-text {
        font-size: 15px !important;
    }
</style>