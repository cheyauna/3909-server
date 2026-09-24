const http = require("http"); //requiring the HTTP(HyperText Transfer Protocol) modules that ships with Node

const hostname = '127.0.0.1';
const port = 3000;

let mimeLookup = {
    '.js' : 'application/javascript',
    '.html' : 'text/html',
    '.jpg' : 'image/jpeg'
};

function send404(response){
    response.writeHead(404, {'Content-Type' : 'text/plain'});
    response.write("Error 404: Resource not found");
    response.end();
}

//where server creation starts
const server = http.createServer((req, res) =>{ //callback function to define what the server should do when request comes in
//req - request object (callback function), res - response
    res.write("Hello, node.");
    res.end();

    let method = req.method + " ";
        let url = req.url + "\n\n";
        let headers = JSON.stringify(req.headers, null, 4); //headers - contains HHTP request headers as prettified JSON formated


        //let filePath
        let file_url = (req.url === "/") ? "hello.html" : decodeURI(req.url) //will be asked why this is a problem < on A1
        let filePath = path.join(__dirname, "public", req.url) // __dirname contains the path of the directory in which you execute this file

        if(!fs.existsSync(filePath)){
            send404(res)
        }

        let fileExit = path.extname(filePath)
        let mimeType = mimeLookup[fileExt]

        if(!mimeType){
            send404(res)
            return
        }


        res.writeHead(200, {'Content-Type': mimeType}); //200 - status code, means ok
        fs.createReadStream(filepath).pipe(res);

        app.get('api/getName', (req, res) => {
            res.set('Access-Control-Allow-Origin', '*');
            res.json({name: 'My Website'});
        })

        app.get('api/getImage', (req, res) => {
            res.set('Access-Comtrol-Allow-Origin', '*');
            res.sendFile('public/alani.jpg');
        })


//        res.write(method);
//        res.write(url);
//        res.write(headers);
//        res.end();
});

server.listen(port, hostname, () => { //callback function to define what to do once the server has started
    console.log(`Server running at http://${hostname}:${port}`);
});
