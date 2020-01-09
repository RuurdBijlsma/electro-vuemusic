<template>
    <div v-if="category!==null">
        <div class="info-preview">
            <div class="category-image" :style="`background-image: url(${image})`"></div>
            <p class="md-title">{{category.name}}</p>
            <p class="md-caption">
                {{title}}
            </p>
        </div>
        <div class="grid">
            <album-square v-for="playlist in playlists" :key="playlist.id" :album="playlist" type="playlist"
                          class="playlist"/>
        </div>
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import AlbumSquare from "../components/AlbumSquare";

    export default {
        name: "Category",
        components: {AlbumSquare},
        data() {
            return {
                category: null,
                image: '',
                title: 'Category',
                playlists: [],
            }
        },
        async mounted() {
            if (!this.$route.query.hasOwnProperty('id')) {
                await this.$router.push('/');
                return;
            }


            let id = this.$route.query.id;
            this.category = await SpotifyApi.api.getCategory(id, {limit: 50});
            this.image = this.category.icons.length > 0 ? this.category.icons[0].url : 'img/notfound.png';
            this.playlists = (await SpotifyApi.api.getCategoryPlaylists(id, {limit: 50})).playlists.items;
            console.log(this.category, this.playlists);
        }
    }
</script>

<style scoped>
    .info-preview {
        text-align: center;
    }

    .category-image {
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

    .grid {
        text-align: center;
    }

    .playlist {
        margin: 20px;
        display: inline-grid;
    }
</style>