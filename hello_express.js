//const express = require("express");
//const path = require("path");
//
//const app = express();
//const port = 3000;
//
//app.use("/public", express.static(path.join(__dirname, "public")))
//
//app.get("/public/home", (req, res) =>{
//    res.sendFile(path.join(__dirname, "public", "alani.jpg"))
//})
//

//app.listen(port, () => console.log("listenig"))


//app.get("/", req, res) =>{
//    res.sendFile(path.join(__dirname, "public", "hello.html"))
//});
//
//app.get("/allAbout/me", (req, res)  =>{
//    res.status(200.send("Hello, Express!"));
//});
//
//app.get("/allAbout*subpage", (req, res) => {
//    res.status(200.send("HELLO I AM EXPRESS " + req.params.subpage);)
//})


//import express, { type Express, type Request, type Response } from 'express';

const express = require("express");
const path = require("path");
const serveIndex = require('serve-index');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('api/getName', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.json({name: 'My Website'});
})

app.get('api/getImage', (req, res) => {
    res.set('Access-Comtrol-Allow-Origin', '*');
    res.sendFile('/public/alani.jpg');
})



app.listen(3000);
