import SpotifyApi from "./SpotifyApi";

console.log("Cacher 1");
export default class Cacher {
    constructor() {
        this.cachingNow = [];
        this.events = {};
        this.cacheName = 'music';
    }

    async getLocalUrl(query) {
        let cache = await caches.match(query);
        if (cache)
            return URL.createObjectURL(await cache.blob());
        return false;
    }

    async cache(query) {
        if (this.cachingNow.includes(query))
            return await this.once('cached' + query);
        this.cachingNow.push(query);

        let cache = await caches.open(this.cacheName);
        let downloadUrl = SpotifyApi.getDownloadUrl(query);
        try {
            console.log("Fetching", downloadUrl, "for cache");
            let response = await fetch(downloadUrl, {mode: 'cors'});
            await cache.put(query, response);
        } catch (e) {
            console.warn("Error downloading", downloadUrl, e);
        }

        console.info("Cache complete!", query);
        this.cachingNow.splice(this.cachingNow.indexOf(query), 1);
        this.fire('cached' + query);
    }


    fire(event) {
        if (this.events[event])
            for (let i = this.events[event].length - 1; i >= 0; i--)
                this.events[event][i]();
    }

    once(event) {
        return new Promise(resolve => {
            let callback;
            callback = () => {
                this.off(event, callback);
                resolve();
            };
            this.on(event, callback);
        });
    }

    on(event, callback) {
        if (!this.events[event])
            this.events[event] = [];

        this.events[event].push(callback);
    }

    off(event, callback) {
        if (event in this.events)
            this.events[event].splice(this.events[event].indexOf(callback), 1);
        else
            console.warn(`Trying to remove ${event} event, but it does not exist`);

    }
}
console.log("Cacher 2");