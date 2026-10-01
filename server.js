const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use("/public", serveIndex(path.join(__dirnname, "public")));

const upload multer({dest:"./uploads"})

let mimeLookup = {
    '.js' : 'application/javascript',
    '.html' : 'text/html',
    '.jpg' : 'image/jpeg'
};

app.get('/api/getName', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.json({name: 'WACS'});
});

app.get('/api/getImage', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '/public/wacs.jpg'));
});

app.post("/public/home", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "hello.html"));
})

app.post("/public/home", upload.single, (req, res) => {
    res.send(`Form submitted: ${req.query.myTextInput}`);
})


app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>AIP Server</title>
        </head>
        <body>
            <h1>Hello from Cheyauna!</h1>
            <p>This page is being served by Node.js and Express.</p>
        </body>
        </html>
    `);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
});