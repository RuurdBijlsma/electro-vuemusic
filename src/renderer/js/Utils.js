export default class Utils {
    static getServer() {
        return this.isLocal() ? 'http://localhost:3000' : 'https://ruurd.dev:3000';
    }

    static isLocal() {
        return location.href.includes('localhost') ||
            location.href.includes('127.0.0.1') ||
            location.href.includes('192.168.0');
    }

    static secondsToHms(seconds) {
        if (isNaN(seconds) || seconds === undefined)
            return '0:00';

        seconds = Math.round(seconds);
        let h = Math.floor(seconds / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = seconds % 60;
        h = h.toString();
        m = m.toString();
        s = s.toString();
        if (h !== '0') {
            m = m.padStart(2, '0');
            s = s.padStart(2, '0');
        }
        s = s.padStart(2, '0');

        if (h === '0')
            return `${m}:${s}`;
        else return `${h}:${m}:${s}`;
    }

    static shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    static trackToQuery(track){
        return `${track.name} - ${track.artists.map(a => a.name).join(', ')}`;
    }
}