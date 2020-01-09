console.log("XMLHttpRequestInterceptor 1");
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
        this.cacheKey = 'xml';
        this.useCache = !navigator.onLine;
    }

    get urlCacheKey() {
        return this.url + JSON.stringify(this.options)
    }

    async send(postData) {
        this.options.body = postData;

        if (this.useCache)
            if (await this.sendCached())
                return;

        try {
            this.sendLive();
        } catch (e) {
            if (await this.sendCached())
                return;
            this.readyState = 4;
            this.status = e.status;
            this.onreadystatechange();
        }
    }

    async sendLive() {
        let response = await fetch(this.url, this.options);
        let cache = await caches.open(this.cacheKey);
        await cache.put(this.urlCacheKey, response);
        if (!await this.sendCached())
            throw Error('Response that was JUST cached is now not found?');
    }

    async sendCached() {
        let cachedResponse = await caches.match(this.urlCacheKey);
        if (cachedResponse) {
            this.readyState = 4;
            this.status = cachedResponse.status;
            this.responseText = await cachedResponse.text();
            this.onreadystatechange();
            return true;
        }
        return false;
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
console.log("XMLHttpRequestInterceptor 2");