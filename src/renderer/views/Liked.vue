<template>
    <div>
        <div class="info-preview">
            <p class="md-title">Liked Songs</p>
        </div>
        <track-list :key="updateTracks" :track-retrieve="trackRetrieve" :lite="false"/>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import TrackList from "../components/TrackList";

    export default {
        name: "Liked",
        components: {TrackList},
        data() {
            return {
                trackRetrieve: null,
                updateTracks: 0,
            }
        },
        async mounted() {
            this.trackRetrieve = async (offset, limit) => (await SpotifyApi.api.getMySavedTracks({
                offset,
                limit
            })).items.map(item => item.track);
            this.updateTracks++;
        }
    }
</script>

<style scoped>
    .info-preview {
        text-align: center;
    }

    .info-preview .md-title {
        font-weight: bold;
        margin-bottom: 0;
    }
</style>