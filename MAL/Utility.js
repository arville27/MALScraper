const axios = require('axios').default;

const headers = {
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'en-US,en;q=0.9',
    'cache-control': 'max-age=0',
    'sec-ch-ua': '" Not;A Brand";v="99", "Microsoft Edge";v="97", "Chromium";v="97"',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'same-origin',
    'upgrade-insecure-requests': '1',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

/**
 *
 * @param {Object} queryParam params object for axios option
 * @param {string} path MyAnimeList pathname
 * @returns Raw response from MyAnimeList
 */
async function apiCall(queryParam = null, path = '', url = 'https://myanimelist.net') {
    try {
        const options = {
            headers: headers,
        };
        if (queryParam) options['params'] = queryParam;
        const { data } = await axios.get(url + path, options);
        return data;
    } catch (error) {
        throw Error('Error while requesting page');
    }
}

module.exports = { apiCall };
