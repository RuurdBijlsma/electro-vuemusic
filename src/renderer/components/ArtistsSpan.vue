<template>
    <span>
        <span v-for="(artist, i) in artists" :key="artist.id">
            <span v-if="i !== 0">, </span>
            <router-link :to="`/artist?id=${artist.id}`">{{artist.name}}</router-link>
        </span>
    </span>
</template>

<script>
    export default {
        name: "ArtistsSpan",
        props: {
            artists: {
                type: Array,
                default: () => [],
            }
        }
    }
</script>

<style scoped>

</style>