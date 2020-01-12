<template>
    <div>
        <p class="md-title">Settings</p>
        <md-button v-if="loggedIn" @click="logOut" class="md-raised md-dense md-primary">Log out</md-button>

        <p>You must set the following information to use this application:</p>

        <md-field>
            <label>Spotify Client ID</label>
            <md-input v-model="spotifyId"/>
        </md-field>

        <md-field>
            <label>Spotify Client Secret</label>
            <md-input v-model="spotifySecret"/>
        </md-field>

        <md-field>
            <label>Youtube API Key </label>
            <md-input v-model="youtubeKey"/>
        </md-field>

        <p>{{status}}</p>
        <md-button class="md-raised md-primary" @click="save">Save</md-button>
    </div>
</template>

<script>
    import electron from 'electron';
    import SpotifyApi from "../js/SpotifyApi";
    import Credentials from "../js/Credentials";

    export default {
        name: "Settings",
        data() {
            return {
                spotifyId: '',
                spotifySecret: '',
                youtubeKey: '',
                loggedIn: false,
                status: '',
            }
        },
        async mounted() {
            this.importFromCredentials();

            this.loggedIn = SpotifyApi.authorized();
        },
        methods: {
            importFromCredentials() {
                this.spotifySecret = Credentials.spotifySecret;
                this.spotifyId = Credentials.spotifyId;
                this.youtubeKey = Credentials.youtubeKey;
            },
            async save() {
                Credentials.spotifyId = this.spotifyId;
                Credentials.spotifySecret = this.spotifySecret;
                Credentials.youtubeKey = this.youtubeKey;
                await Credentials.save();
                if (Credentials.filled()) {
                    await this.$router.push('/');
                } else {
                    this.status = 'You have to fill in the fields';
                }
            },
            external(e) {
                console.log(e);
                e.preventDefault();
                electron.shell.openExternal(e.target.href);
            },
            logOut() {
                localStorage.clear();
                location.href = location.origin + location.pathname
            }
        }
    }
</script>

<style scoped>
</style>