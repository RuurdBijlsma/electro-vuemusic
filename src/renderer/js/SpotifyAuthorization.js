console.log("SpotifyAuth 1");
export default class SpotifyAuthorization {
    constructor(code = null, token = null, refresh = null, expires = null, scope = null) {
        this.code = code;
        this.token = token;
        this.refresh = refresh;
        this.expires = expires;
        this.scope = scope;
    }

    static import(string) {
        let authObject = JSON.parse(string);
        return new SpotifyAuthorization(authObject.code, authObject.token, authObject.refresh, authObject.expires, authObject.scope);
    }
}
console.log("SpotifyAuth 2");