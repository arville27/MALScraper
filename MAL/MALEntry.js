const { apiCall } = require('./Utility');
const cheerio = require('cheerio');

class MALEntry {
    constructor({ title, thumbnail, url, desc, type, rating }) {
        this.title = title;
        this.smallThumbnail = thumbnail;
        this.url = url;
        this.shortDesc = desc;
        this.type = type;
        this.rating = rating;
    }

    /**
     *
     * @param {String[]} listMetadata Raw text from every section
     * @returns Single Object representing the metadata section
     */
    #processMetadata(listMetadata) {
        const masterObj = {};
        listMetadata.forEach((data) => {
            const [untrimmedKey, ...value] = data.split(':');
            const key = untrimmedKey.trim();
            const singleStringValue = value
                .join(':')
                .trim()
                .replaceAll(/\s{2,}/g, ' ');

            // Split value to array for relevant key
            const representAsArray =
                key === 'Genres' ||
                key === 'Theme' ||
                key === 'Producers' ||
                key === 'Genre' ||
                key === 'Authors';
            masterObj[key] = representAsArray ? singleStringValue.split(', ') : singleStringValue;

            // Extra checks to ensure relevant result
            if (key === 'Genres' || key === 'Theme' || key === 'Genre') {
                // Removes duplicate word for anime in certain key
                masterObj[key] = masterObj[key].map((word) => word.slice(0, word.length / 2));
            } else if (key === 'Producers' && masterObj[key].includes('None found')) {
                // Change none found to empty array
                masterObj[key] = [];
            } else if (key === 'Demographic') {
                // Removes duplicate word for manga in certain key
                const demographic = masterObj[key];
                masterObj[key] = demographic.slice(0, demographic.length / 2);
            }
        });
        return masterObj;
    }

    async fetchDetails() {
        const data = await apiCall(null, '', this.url);

        const $ = cheerio.load(data);
        const contentWrapper = $('#contentWrapper');

        // Content is main div that consist of 2 big div which are metadata and details
        const content = contentWrapper.find('#content table tbody tr');

        // Metadata is left narrow menu
        const metadata = content.first().children().first().children();
        const poster = metadata.first().find('img').attr()['data-src'];

        const alternativeTitleSection = metadata.find('h2').first();
        const alternativeTitles = alternativeTitleSection
            .nextUntil('h2')
            .filter((_, el) => el.tagName === 'div')
            .map((_, el) => {
                return $(el)
                    .text()
                    .trim()
                    .replaceAll(/\s{2,}/g, '\n')
                    .split('\n');
            })
            .get();

        const informationSection = metadata.find('h2').filter((i) => i === 1);
        const informations = informationSection
            .nextUntil('h2')
            .filter((_, el) => el.tagName === 'div')
            .map((_, el) => {
                return $(el).text().trim();
            })
            .get();

        this.poster = poster;
        this.alternativeTitles = this.#processMetadata(alternativeTitles);
        this.informations = this.#processMetadata(informations);
        return this;
    }
}

class AnimeEntry extends MALEntry {
    constructor({ title, thumbnail, url, desc, type, rating, epsCount }) {
        super({ title, thumbnail, url, desc, type, rating });
        this.epsCount = epsCount;
    }
}

class MangaEntry extends MALEntry {
    constructor({ title, thumbnail, url, desc, type, rating, volumeCount }) {
        super({ title, thumbnail, url, desc, type, rating });
        this.volumeCount = volumeCount;
    }
}

module.exports = { MALEntry, AnimeEntry, MangaEntry };
