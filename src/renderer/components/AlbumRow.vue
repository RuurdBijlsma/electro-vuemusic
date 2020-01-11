<template>
    <div class="scroll-square">
        <router-link :to="`/${type}?id=${album.id}`">
            <div class="preview-image"
                 :style="`background-image: url(${image}); border-radius: ${type==='artist'?'50%': '3px'}`"></div>
        </router-link>
        <div class="text-info">
            <p class="preview-title">{{album.name}}</p>
            <p v-if="type==='playlist'" class="preview-owner">{{album.owner.display_name}}</p>
            <artists-span v-if="type==='album'" class="preview-owner" :artists="album.artists"/>
        </div>
    </div>
</template>

<script>
    import ArtistsSpan from "./ArtistsSpan";
    export default {
        name: "AlbumRow",
        components: {ArtistsSpan},
        props: {
            album: Object,
            type: {
                type: String,
                default: 'album',
            },
        },
        data() {
            return {
                image: '',
            }
        },
        mounted() {
            if (this.album.images.length > 0)
                this.image = this.album.images[0].url;
            else
                this.image = 'img/notfound.png';
        },
    }
</script>

<style scoped>

    .scroll-square {
        height: 60px;
        cursor: pointer;
        display: flex;
        margin: 20px 0;
        min-width: 100%;
        max-width: 100%;
    }

    .preview-image {
        min-width: 60px;
        min-height: 60px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 3px;
        box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
    }

    .text-info {
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        padding: 8px;
    }

    .text-info > p {
        line-height: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
        font-size: 13px;
        max-width: calc(100vw - 120px);
    }

    .preview-owner {
        opacity: 0.8;
        font-size: 11px;
    }
</style>