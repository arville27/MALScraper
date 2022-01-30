const { MALScraper } = require('./MAL');

(async () => {
    const res = (await MALScraper.searchManga('Steins gate')).slice(0, 5);
    res.forEach(async (entry) => console.log(await entry.fetchDetails()));
})();
