<template>
    <span>
        <span v-for="(artist, i) in artists" :key="artist.id">
            <span v-if="i !== 0">, </span>
            <router-link :to="`/artist?id=${artist.id}`">{{artist.name}}</router-link>
        </span>
    </span>
</template>

<script>
    console.log("ArtistsSpan 1");
    export default {
        name: "ArtistsSpan",
        props: {
            artists: {
                type: Array,
                default: () => [],
            }
        }
    }
    console.log("ArtistsSpan 2");
</script>

<style scoped>

</style>