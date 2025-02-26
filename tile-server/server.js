const http = require('http');
const tilelive = require('tilelive');
const mbtiles = require('mbtiles');

// Ersetze den Pfad zur mbtiles-Datei
const mbtilesPath = '/home/hannes/Documents/osm-2020-02-10-v3.11_europe_germany.mbtiles';

tilelive.load(`mbtiles://${mbtilesPath}`, function (err, source) {
    if (err) throw err;

    const server = http.createServer((req, res) => {
        source.getTile(req.url.split('/').slice(-3).map(Number), (err, data, headers) => {
            if (err) {
                res.writeHead(404);
                res.end();
            } else {
                res.writeHead(200, headers);
                res.end(data);
            }
        });
    });

    server.listen(3000, () => {
        console.log('Tile server läuft auf http://localhost:3000');
    });
});
