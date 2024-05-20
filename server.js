const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/data', (req, res) => {
    const results = [];
    fs.createReadStream('netflix_titles.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
