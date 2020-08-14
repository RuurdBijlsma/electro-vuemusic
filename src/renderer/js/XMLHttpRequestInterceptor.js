import SpotifyApi from "./SpotifyApi";

export default class XMLHttpRequestInterceptor {
    constructor() {
        this.options = {
            mode: 'cors',
        };
        this.url = '';
        this.readyState = 0;
        this.status = 0;
        this.onreadystatechange = () => {
        };
        this.responseText = '';
    }

    async send(postData) {
        this.options.body = postData;

        await this.sendLive();
    }

    async sendLive() {
        console.log("Checking spotify authorization before request", {
            authorized: SpotifyApi.authorized(),
            refreshToken: SpotifyApi.auth.refresh
        });
        if (!SpotifyApi.authorized() && SpotifyApi.auth.refresh !== null) {
            console.warn("Request was made, but spotify is not authorized, or has no refresh token", {
                authorized: SpotifyApi.authorized(),
                refreshToken: SpotifyApi.auth.refresh
            });
            let refresh = await SpotifyApi.refreshToken();
            console.warn("New refresh token", refresh);
            SpotifyApi.saveRefresh(refresh);
            console.log("Saving refresh token before continuing with request:", this.url, this.options);
        }
        let response = await fetch(this.url, this.options);
        this.readyState = 4;
        this.status = response.status;
        this.responseText = await response.text();
        this.onreadystatechange();
    }

    open(type, url) {
        this.options.method = type;
        this.url = url;
    }

    abort(...args) {
        console.info("abort", ...args);
    }

    setRequestHeader(key, value) {
        if (!this.options.hasOwnProperty('headers'))
            this.options.headers = {};
        this.options.headers[key] = value;
    }
}