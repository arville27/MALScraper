const cheerio = require('cheerio');
const { AnimeEntry, MangaEntry } = require('./MALEntry');
const { apiCall } = require('./Utility');

class MALScraper {
    static Status = Object.freeze({
        AIRING: 1,
        FINISHIED_AIRING: 2,
        NOT_YET_AIRING: 3,
    });

    /**
     *
     * @param {String} query Keyword to find anime
     * @param {Status} status Anime Status
     * @returns List of AnimeEntry
     */
    static async searchAnime(query, status) {
        const path = '/anime.php';
        const param = {
            cat: 'anime',
            q: query,
        };
        if (status) param['status'] = status;

        const data = await apiCall(param, path);
        const $ = cheerio.load(data);
        const resultsTable = $('#content .js-categories-seasonal.js-block-list.list table');
        return resultsTable
            .find('tbody tr')
            .next()
            .map((i, el) => {
                const entry = $(el).children().first();
                const thumbnail = entry.find('img').attr()['data-src'];
                const title = entry.next().find('.title a').first().text().trim();
                const url = entry.next().find('.title a').first().attr()['href'];
                const desc = entry
                    .next()
                    .find('.pt4')
                    .text()
                    .trim()
                    .replace(/read more.$/, '');
                const type = entry.next().next().text().trim();
                const epsCount = entry.next().next().next().text().trim();
                const rating = entry.next().next().next().next().text().trim();
                return new AnimeEntry({ title, thumbnail, url, desc, type, rating, epsCount });
            })
            .get();
    }

    /**
     *
     * @param {String} query Keyword to find manga
     * @returns List of MangaEntry
     */
    static async searchManga(query) {
        const path = '/manga.php';
        const param = {
            cat: 'manga',
            q: query,
        };

        const data = await apiCall(param, path);
        const $ = cheerio.load(data);
        const resultsTable = $('#content .js-categories-seasonal.js-block-list.list table');
        return resultsTable
            .find('tbody tr')
            .next()
            .map((_, el) => {
                const entry = $(el).children().first();
                const thumbnail = entry.find('img').attr()['data-src'];
                const title = entry.next().find('a').first().text().trim();
                const desc = entry
                    .next()
                    .find('.pt4')
                    .text()
                    .trim()
                    .replace(/read more.$/, '');
                const url = entry.next().find('a').first().attr()['href'];
                const type = entry.next().next().text().trim();
                const volumeCount = entry.next().next().next().text().trim();
                const rating = entry.next().next().next().next().text().trim();
                return new MangaEntry({ title, thumbnail, url, desc, type, rating, volumeCount });
            })
            .get();
    }
}

module.exports = { MALScraper };
