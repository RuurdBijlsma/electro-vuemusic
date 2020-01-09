<template>
    <div class="home">
        <span class="md-title">Made for you</span>
        <div class="recently-played horizontal-scroll">
            <album-square type="liked-songs"/>
            <album-square v-for="playlist in discoverPlaylists" :key="playlist.id" type="playlist" :album="playlist"/>
        </div>

        <span class="md-title">Recently played</span>
        <div class="recently-played horizontal-scroll">
            <album-square v-for="album in recentAlbums" :key="album.superId" type="album" :album="album"/>
        </div>

        <span class="md-title">Featured playlists</span>
        <div class="popular-playlists horizontal-scroll">
            <album-square v-for="playlist in featuredPlaylists" :key="playlist.id" type="playlist" :album="playlist"
                          :big="true"/>
        </div>
        <span class="md-title">New releases</span>
        <div class="new-releases horizontal-scroll">
            <album-square v-for="album in newReleases" :key="album.id" type="album" :album="album" :big="true"/>
        </div>

    </div>
</template>

<script>
    // @ is an alias to /src
    import SpotifyApi from "../js/SpotifyApi";
    import AlbumSquare from "../components/AlbumSquare";

    export default {
        name: 'home',
        components: {AlbumSquare},
        data() {
            return {
                recentAlbums: [],
                featuredPlaylists: [],
                newReleases: [],
                discoverPlaylists: [],
            }
        },
        async mounted() {
            let recentItems = await SpotifyApi.api.getMyRecentlyPlayedTracks({limit: 4});
            let recentAlbums = recentItems.items.map(item => item.track.album);
            recentAlbums.forEach((album, i) => album.superId = album.id + i.toString());
            this.recentAlbums = recentAlbums;

            this.featuredPlaylists = (await SpotifyApi.api.getFeaturedPlaylists()).playlists.items;

            this.newReleases = (await SpotifyApi.api.getNewReleases({limit: 10})).albums.items;

            const discoverNames = ['Discover Weekly', 'Release Radar', ...[...Array(10)].map((_, i) => 'Daily Mix ' + (i + 1))];
            if (localStorage.getItem('discoverPlaylists') === null) {
                let me = await SpotifyApi.api.getMe();
                let playlists = (await SpotifyApi.api.getUserPlaylists(me.id, {limit: 50})).items;
                console.log(playlists);
                this.discoverPlaylists = playlists.filter(playlist => discoverNames.findIndex(name => playlist.name.includes(name)) !== -1 && playlist.owner.display_name === 'Spotify');
                this.discoverPlaylists.sort((a, b) => {
                    let aI = discoverNames.findIndex(name => a.name.includes(name));
                    let bI = discoverNames.findIndex(name => b.name.includes(name));
                    return aI - bI;
                });
                if (this.discoverPlaylists.length > 0) {
                    console.log("Getting playlists via search, setting localStorage to:", this.discoverPlaylists);
                    localStorage.discoverPlaylists = JSON.stringify(this.discoverPlaylists);
                }
            } else {
                let playlists = JSON.parse(localStorage.discoverPlaylists);
                console.log("Getting discover playlists via localStorage: ", playlists);
                this.discoverPlaylists = playlists;
            }
        },
        methods: {}
    }
</script>

<style scoped>
    .horizontal-scroll {
        display: flex;
        overflow-x: auto;
        margin-left: -16px;
        margin-top: 10px;
        margin-bottom: 30px;
        width: calc(100% + 16px * 2);
        padding: 0 16px;
    }
</style>
