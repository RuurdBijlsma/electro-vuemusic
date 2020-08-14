import SpotifyAuthorization from "./SpotifyAuthorization";
import SpotifyWebApi from 'spotify-web-api-js';
import Utils from "./Utils";
import SpotifyModule from "./SpotifyModule";
import VmModule from "../../node/VmModule";

class SpotifyApi {
    constructor() {
        Utils.syncLocalStorage();
        this.spotifyModule = new SpotifyModule();
        this.vmModule = new VmModule();
        console.log(this.vmModule);

        this.server = Utils.getServer();
        this.clientId = 'cd272aa2194c46c7a460e9a202f66002';
        let url = location.origin + (location.pathname + (location.pathname.endsWith('/') ? '' : '/') + '#/login').replace(/\/\//gi, '/');
        console.log("REDIRECT URL:", url);
        this.redirectUrl = encodeURIComponent(url);
        this.authUrl = 'https://accounts.spotify.com/';
        this.scopes = encodeURIComponent('ugc-image-upload user-read-email user-read-private playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private user-library-modify user-library-read user-top-read user-read-recently-played user-follow-read user-follow-modify');
        this.api = new SpotifyWebApi();

        this.loadAuth();
        if (this.authorized())
            this.api.setAccessToken(this.auth.token);
    }

    async getUrls(spotifyTrack) {
        return this.vmModule.stream(spotifyTrack);
    }

    saveAuth() {
        if (this.auth.token !== null)
            this.api.setAccessToken(this.auth.token);
        localStorage.auth = JSON.stringify(this.auth);
    }

    loadAuth() {
        if (localStorage.getItem('auth') !== null)
            this.auth = SpotifyAuthorization.import(localStorage.auth);
        else {
            this.auth = new SpotifyAuthorization();
        }
    }

    authorized() {
        if (this.auth.code === null){
            console.log("Not authorized because no auth code");
            return false;
        }
        if (this.auth.token === null){
            console.log("Not authorized because no auth token");
            return false;
        }
        const tokenLife = 3600 * 1000;
        const refreshTimeout = tokenLife - 3000 * 1000;
        // const refreshTimeout = tokenLife - 6 * 1000;
        // console.log(this.auth.expires, (+new Date()))
        if (this.auth.expires - refreshTimeout <= (+new Date())){
            console.log("Not authorized because expired auth", this.auth.expires, refreshTimeout, +new Date());
            return false;
        }
        return true;
    }

    saveRefresh(refreshObject) {
        this.auth.token = refreshObject.access_token;
        this.auth.scope = refreshObject.scope;
        this.auth.expires = (+new Date()) + refreshObject.expires_in * 1000;
        this.saveAuth();
    }

    saveToken(tokenObject) {
        this.auth.token = tokenObject.access_token;
        this.auth.refresh = tokenObject.refresh_token;
        this.auth.scope = tokenObject.scope;
        this.auth.expires = (+new Date()) + tokenObject.expires_in * 1000;
        this.saveAuth();
    }

    saveAuthCode(code) {
        this.auth.code = code;
        this.saveAuth();
    }

    async fullRefresh() {
        let token = await this.refreshToken();
        this.saveRefresh(token);
    }

    async refreshToken() {
        if (this.auth.refresh === null) {
            console.warn("No refresh code set");
            return;
        }

        return this.spotifyModule.refresh(this.auth.refresh);
        // let response = await fetch(this.server + '/refresh', {
        //     method: 'post',
        //     body: JSON.stringify({
        //         'refresh_token': this.auth.refresh,
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });
        // return await response.json();
    }

    async getToken() {
        if (this.auth.code === null) {
            console.warn("No auth code set");
            return;
        }

        return this.spotifyModule.token(this.redirectUrl, this.auth.code);
        // let response = await fetch(this.server + '/token', {
        //     method: 'post',
        //     body: JSON.stringify({
        //         'redirect_url': this.redirectUrl,
        //         'auth_code': this.auth.code
        //     }),
        //     headers: {
        //         'Content-Type': 'application/json'
        //     }
        // });
        // return await response.json();
    }
}

export default new SpotifyApi();