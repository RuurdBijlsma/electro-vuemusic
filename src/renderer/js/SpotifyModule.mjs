import Credentials from "./Credentials";

export default class SpotifyModule {
    async refresh(refreshToken) {
        console.log('refresh');
        let response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'post',
            body: `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${Credentials.spotifyId}&client_secret=${Credentials.spotifySecret}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        let t = await response.text();
        try {
            return JSON.parse(t);
        } catch (e) {
            console.log("Error", e.message, "t = ", t);
        }
    }

    async token(redirectUrl, authCode) {
        console.log('token', Credentials.spotifySecret, redirectUrl, authCode);
        let response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'post',
            body: `grant_type=authorization_code&code=${authCode}&redirect_uri=${redirectUrl}&client_id=` +
                `${Credentials.spotifyId}&client_secret=${Credentials.spotifySecret}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        let t = await response.text();
        try {
            return JSON.parse(t);
        } catch (e) {
            console.log("Error", e.message, "t = ", t);
        }
    }
}