<template>
    <div>
        Login start
    </div>
</template>

<script>
    import SpotifyApi from "../js/SpotifyApi";
    import Credentials from "../js/Credentials";

    export default {
        name: "SpotifyLoginStart",
        async mounted() {
            if(!Credentials.imported && !Credentials.importing)
                await Credentials.importFromFile();

            if (SpotifyApi.auth.refresh !== null) {
                this.refreshToken();
                return;
            }
            if (SpotifyApi.auth.code === null && !location.search.includes('?code=')) {
                this.getCode();
            } else if (location.search.includes('?code=') && SpotifyApi.auth.token === null) {
                this.catchCode();
            } else {
                this.getToken();
            }
        },
        methods: {
            getCode() {
                location.href = `${SpotifyApi.authUrl}authorize?client_id=${SpotifyApi.clientId}&response_type=code&redirect_uri=${SpotifyApi.redirectUrl}&scope=${SpotifyApi.scopes}`;
            },
            catchCode() {
                let url = location.search.split('?code=');
                if (url.length < 2) {
                    console.log("Couldn't retrieve code form url");
                    //wrong
                    return;
                }
                let code = url[1];
                // console.log(code);
                SpotifyApi.saveAuthCode(code);
                history.replaceState(null, "login", location.pathname + (location.pathname.endsWith('/') ? '' : '/') + "#/login");
                this.getToken();
            },
            async getToken() {
                let token = await SpotifyApi.getToken();
                SpotifyApi.saveToken(token);
                console.log('Received token', SpotifyApi.auth);
                await this.$router.push('/');
            },
            async refreshToken() {
                let refresh = await SpotifyApi.refreshToken();
                SpotifyApi.saveRefresh(refresh);
                console.log('Refreshed token', SpotifyApi.auth);
                await this.$router.go(-1);
            },
        }
    }
</script>

<style scoped>

</style>