const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;

let mimeLookup = {
    '.js' : 'application/javascript',
    '.html' : 'text/html',
    '.jpg' : 'image/jpeg'
};

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Course Servegigiottr</title>
        </head>
        <body>
            <h1>Hello from Cheyauna!</h1>
            <p>This page is being served by Node.js and Express.</p>
        </body>
        </html>
    `);
});

app.get('/api/getName', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.json({name: 'mine'});
});

app.get('/api/getImage', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.sendFile('public/alani.jpg');
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
});