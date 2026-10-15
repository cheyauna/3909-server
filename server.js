/*
*
*/

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

//links html, css
app.use(express.static(path.join(__dirname, 'public')));

//JSON parsing middleware
app.use(express.json());

//initial game setup
const appState = {
    energy: 100,
    money: 0,
    cell_contents: Array.from({length: 4}, () =>
        Array(4).fill(null)
    )
};
//placing the generator
appState.cell_contents[3][3] = {
    type: "generator",
    level: 0
}


//unused, express handles mime types for static files automatically
let mimeLookup = {
    '.js' : 'application/javascript',
    '.html' : 'text/html',
    '.jpg' : 'image/jpeg'
};

//http get request
app.get('/api/getName', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.json({name: 'WACS'});
});

//http get request
app.get('/api/getImage', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.sendFile(path.join(__dirname, '/public/wacs.jpg'));
});

//browser asks to get info from this address
app.get('/api/state', (req, res) => {
    res.json(appState); //sends app state object to browser as JSON
});

//browser asks the server to do something that changes data
//generate new item
app.post('/api/generate', (req, res) => {
    let generated = false;
    if(appState.energy <= 0){
        return res.status(400).json({error : "not enough energy!"})
    }

    outerLoop: for(let row = 0; row < appState.cell_contents.length; row++){
        for(let column = 0; column < appState.cell_contents[row].length; column++){
            if(appState.cell_contents[row][column] == null){
               appState.cell_contents[row][column] = {
                   type: "matcha",
                   level: 1
               };
               appState.energy -= 1;
               generated = true;
               break outerLoop;
            }
        }
    }
        if(!generated){
            return res.status(400).json({error : "your board is full!"})
        }

    return res.status(200).json(appState);

});

//merge items
app.post('/api/merge', (req, res) => {
    const{cell1, cell2} = req.body || {};
    if(!cell1 || !cell2) return res.status(400).json({error: "two cells must be provided"});
    //validates row
    if (
        !Number.isInteger(cell1.row) ||
        !Number.isInteger(cell2.row) ||
        cell1.row < 0 ||
        cell1.row >= appState.cell_contents.length ||
        cell2.row < 0 ||
        cell2.row >= appState.cell_contents.length
    ) {
        return res.status(400).json({
            error: "invalid cell coordinates"
        });
       }
    //validates column
    if (
        !Number.isInteger(cell1.column) ||
        !Number.isInteger(cell2.column) ||
        cell1.column < 0 ||
        cell1.column >= appState.cell_contents[cell1.row].length ||
        cell2.column < 0 ||
        cell2.column >= appState.cell_contents[cell2.row].length
    ) {
        return res.status(400).json({
            error: "invalid cell coordinates"
        });
    }
    const item1 = appState.cell_contents[cell1.row][cell1.column];
    const item2 = appState.cell_contents[cell2.row][cell2.column];
    if(item1 == null || item2 == null) return res.status(400).json({error: "both cells must contain items"});

    if(item1.type == "generator" || item2.type == "generator")
        return res.status(400).json({error: "invalid cell type"});
                if(cell1.row != cell2.row ||
                    cell1.column != cell2.column){
                    if(item1.type == item2.type &&
                        item1.level == item2.level){
                        if(item1.level < 3){
                            appState.cell_contents[cell1.row][cell1.column] = {
                                type: item1.type,
                                level: item1.level + 1
                            }
                            appState.cell_contents[cell2.row][cell2.column] = null;
                            appState.money = appState.money + 10;
                            return res.status(200).json(appState);
                        }

                    }
                }

    return res.status(400).json({error: "cannot merge items"});
});

// used to est custom 500 error handler
app.get("/test500", (req, res, next) => {
    next(new Error("This is a test error"));
});

//custom 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});



//custom 500
//err - error that occured
//req - info about incoming request
//res - used to send a response
//next - prints diagnostic info in server terminal
app.use((err, req, res, next) => {
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});





app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

//app.use("/public", serveIndex(path.join(__dirnname, "public")));

//const upload multer({dest:"./uploads"})



//app.post("/public/home", upload.single("myFile"), (req, res) => {
//    console.log(req.file)
//    res.send(`Form submitted: ${req.body.myTextInput}`);
//})

//app.get('/', (req, res => {
//    res.sendFile(path.join(__dirname, 'index.html'));
//}))




//backblaze code
//require("dotenv").config()
//const{
//    S3Client,
//    PutObjectCommand,
//} = require("@aws-sdk/client-s3")
//
//const s3 = new S3Client({
//    endpoint: process.env.B2_ENDPOINT,
//    region: process.env.B2_REGION,
//    credentials: {
//        accessKeyId: process.env.B2_KEY_ID,
//        secretAccessKey: process.envB2_APPLICATION_KEY
//    }
//})
//
//const bucket = process.env.B2_BUCKET
//
////function
//async function uploadFile(key, body, contentType){
//    const command = new PutObjectCommand({
//        Bucket: bucket;
//        Key : key,
//        Body: body,
//        ContentType: contentType
//    })
//    await.s3.send(command)
//}


