<template>
    <div v-if="dataAlbum" :class="`scroll-square ${big?'square-big':''}`">
        <router-link :to="`/${type}${dataAlbum.hasOwnProperty('id')?`?id=${dataAlbum.id}`:''}`">
            <div class="preview-image" :style="`background-image: url(${image})`"></div>
        </router-link>
        <p class="preview-title">{{dataAlbum.name}}</p>
        <p v-if="dataAlbum.hasOwnProperty('description')" class="preview-description md-accent"
           v-html="dataAlbum.description"/>
    </div>
</template>

<script>
    import baseUrl from '../../node/BaseUrl';
    import path from 'path';

    export default {
        name: "AlbumSquare",
        props: {
            big: {
                type: Boolean,
                default: false,
            },
            album: Object,
            type: {
                type: String,
                default: 'album',
            },
        },
        data() {
            return {
                image: '',
                dataAlbum: {},
            }
        },
        mounted() {
            this.dataAlbum = this.album;
            if (this.type === 'liked-songs') {
                this.dataAlbum = {
                    name: 'Liked Tracks',
                };
                this.image = path.join(baseUrl, '/img/liked.png').replace(/\\/gi, '/');
            } else if (this.type === 'category') {
                if (this.dataAlbum.icons.length > 0)
                    this.image = this.dataAlbum.icons[0].url;
                else
                    this.image = path.join(baseUrl, '/img/notfound.png').replace(/\\/gi, '/');
            } else {
                if (this.dataAlbum.images.length > 0)
                    this.image = this.dataAlbum.images[0].url;
                else
                    this.image = path.join(baseUrl, '/img/notfound.png').replace(/\\/gi, '/');
            }
        },
        methods: {},
    }
</script>

<style scoped>

    .scroll-square {
        min-width: 120px;
        min-height: 140px;
        margin-right: 10px;
        cursor: pointer;
        max-width: 120px;
    }

    .scroll-square:last-child {
        padding-right: 135px;
    }

    .square-big {
        min-width: 160px;
        max-width: 160px;
        min-height: 180px;
    }

    .square-big:last-child {
        padding-right: 175px;
    }

    .square-big .preview-image {
        min-width: 160px;
        min-height: 160px;
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
        font-size: 13px;
        margin: 5px;
        min-width: 120px;
        font-weight: bold;
        line-height: 150%;
        max-height: 60px;
        overflow-y: hidden;
    }

    .preview-description {
        font-size: 11px;
        margin: 5px;
        min-width: 120px;
        text-overflow: ellipsis;
        word-wrap: break-word;
        overflow: hidden;
        max-height: 65px;
        opacity: 0.7;
        font-weight: bolder;
        line-height: 150%;
    }
</style>