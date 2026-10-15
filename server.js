/*
* handles updates and game state
*/

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path'); //used to serve static files

//serve static files, links html, css
app.use(express.static(path.join(__dirname, 'public')));

//JSON parsing middleware
app.use(express.json());

const games = {};

//creates a new game for a new player
function createGame(name, collection){
    const game = {
        energy: 100,
        money: 0,
        cell_contents: Array.from({length: 4}, () =>
            Array(4).fill(null)
        ),
        player:{
            name: name,
            collection: collection
        },
        collections:{
            matcha: []
        }
    };
    //places the generator in the bottom-right cell
    game.cell_contents[3][3] = {
        type: "generator",
        level: 0
    };
    return game;
}



//initial game setup
//const appState = {
//    energy: 100,
//    money: 0,
//    cell_contents: Array.from({length: 4}, () =>
//        Array(4).fill(null)
//    ),
//    player: null,
//    collections: {
//        matcha: []
//    }
//};
//placing the generator
//appState.cell_contents[3][3] = {
//    type: "generator",
//    level: 0
//}

//route parameters
//http get requests
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
    const name = req.query.name;
    const game = games[name];

    if(!game){
        return res.status(404).json({error: "player not found"});
    }
    res.json(game); //sends app state object to browser as JSON
});

//browser asks the server to do something that changes data
//server receives the request to generate new item
app.post('/api/generate', (req, res) => {
    const name = req.body.name;
    const game = games[name];

    if(!game){
        return res.status(404).json({error: "player not found"});
    }






    let generated = false;
    if(game.energy <= 0){
        return res.status(400).json({error : "not enough energy!"})
    }

    outerLoop: for(let row = 0; row < game.cell_contents.length; row++){
        for(let column = 0; column < game.cell_contents[row].length; column++){
            if(game.cell_contents[row][column] == null){
               game.cell_contents[row][column] = {
                   type: "matcha",
                   level: 1
               };
               recordDiscovery(game.cell_contents[row][column]);
               game.energy -= 1;
               generated = true;
               break outerLoop;
            }
        }
    }
        if(!generated){
            return res.status(400).json({error : "your board is full!"})
        }

    return res.status(200).json(game);

});

//merge items
app.post('/api/merge', (req, res) => {
console.log("MERGE ROUTE STARTED", req.body);
    const { name, cell1, cell2 } = req.body || {};
    const game = games[name];
    console.log("Player name:", name);
    console.log("Game found:", !!game);

    console.log("Merge request:", { name, cell1, cell2 });
    console.log("Game exists:", !!game);

    if (!game) {
        return res.status(404).json({
            error: "player not found"
        });
    }

    if (!cell1 || !cell2) {
        return res.status(400).json({
            error: "two cells must be provided"
        });
    }

    // Validate row coordinates
    if (
        !Number.isInteger(cell1.row) ||
        !Number.isInteger(cell2.row) ||
        cell1.row < 0 ||
        cell1.row >= game.cell_contents.length ||
        cell2.row < 0 ||
        cell2.row >= game.cell_contents.length
    ) {
        return res.status(400).json({
            error: "invalid cell coordinates"
        });
    }

    // Validate column coordinates
    if (
        !Number.isInteger(cell1.column) ||
        !Number.isInteger(cell2.column) ||
        cell1.column < 0 ||
        cell1.column >= game.cell_contents[cell1.row].length ||
        cell2.column < 0 ||
        cell2.column >= game.cell_contents[cell2.row].length
    ) {
        return res.status(400).json({
            error: "invalid cell coordinates"
        });
    }

    // Get the selected items from this player's board
    const item1 =
        game.cell_contents[cell1.row][cell1.column];

    const item2 =
        game.cell_contents[cell2.row][cell2.column];

console.log("Player:", name);
console.log("Cell 1:", cell1, "Item 1:", item1);
console.log("Cell 2:", cell2, "Item 2:", item2);

    if (item1 == null || item2 == null) {
        return res.status(400).json({
            error: "both cells must contain items"
        });
    }

    if (
        item1.type === "generator" ||
        item2.type === "generator"
    ) {
        return res.status(400).json({
            error: "invalid cell type"
        });
    }
    console.log("Item 1:", item1);
    console.log("Item 2:", item2);

    // A cell cannot be merged with itself
    if (
        cell1.row === cell2.row &&
        cell1.column === cell2.column
    ) {
        return res.status(400).json({
            error: "cannot merge a cell with itself"
        });
    }

    // Items must have the same type and level
    if (
        item1.type !== item2.type ||
        item1.level !== item2.level
    ) {
        return res.status(400).json({
            error: "cannot merge items"
        });
    }

    // Level 3 is the maximum level
    if (item1.level >= 3) {
        return res.status(400).json({
            error: "items are already at the maximum level"
        });
    }

    // Upgrade the first item
    game.cell_contents[cell1.row][cell1.column] = {
        type: item1.type,
        level: item1.level + 1
    };

    // Record the discovery for this player
    recordDiscovery(
        game,
        game.cell_contents[cell1.row][cell1.column]
    );

    // Empty the second cell
    game.cell_contents[cell2.row][cell2.column] = null;

    // Reward the player
    game.money += 10;

    return res.status(200).json(game);
});

//player set up info
//parses incoming JSON request bodies, req.body lets the route access the submitted info
app.post('/api/player', (req, res) => {
    const playerName = typeof req.body.name == "string" ? req.body.name.trim() : ""; //gets players name from request
    const collection = req.body.collection; //gets collection request from player

        // Validate the username
        if (!playerName) {
            return res.status(400).json({
                error: "please enter a username"
            });
        }

        // Validate the starting collection
        if (!Object.hasOwn({ matcha: true }, collection)) {
            return res.status(400).json({
                error: "please choose a valid starting collection"
            });
        }

        // Create a game only if this player does not already exist
        if (!Object.hasOwn(games, playerName)) {
            games[playerName] = createGame(playerName, collection);
        }

        // Return the correct player's information
        return res.status(200).json(games[playerName].player);
});

//category collection info
app.get('/api/collections/:category', (req, res) => {
    const name = req.query.name;
    const game = games[name];
    if(!game){
        return res.status(404).json({error: "player not found"});
    }
    const category = req.params.category; //reads route parameter from url
    const collection = game.collections[category]; //retrieves category collection
    const level = req.query.level; //reads querystring parameters

    if(!collection){
        return res.status(404).json({error: "collection not found"});
    }

    if(level!= undefined){
        const levelNum = Number(level);
        return res.json(collection.filter(item => item === Number(level)));
        if(!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 3)
            return res.status(400).json({error: "invalid level. please chose a level from 1-3."})
    }
    res.json(collection);
});

//export collection
app.get('/api/export', (req, res) => {
    const name = req.query.name;
    const game = games[name];
    if(!game){return res.status(404).json({error: "player not found"});}

    const collectionProgress = {};

    for(const category in game.collections){
        const levels = game.collections[category];

        collectionProgress[category] ={
            highestLevelDiscovered: Math.max(0, levels),
            numberOfLevelsDiscovered: levels.length,
            discoveredLevels: levels
        };
    }

    const exportData = {
        player: game.player,
        collectionProgress: collectionProgress
    };
    //triggers the download
    res.setHeader(
        'Content-Disposition',
        'attachment; filename = "collection-progress.json"'
    );
    //tells the browser to treat the response as a downloadable file
    res.setHeader(
        'Content-Type', 'application/json'
    );
    res.send(JSON.stringify(exportData, null, 2));
});

//function
//

function recordDiscovery(game, item){
console.log("Before recordDiscovery");

    if(!item || item.type === "generator"){
        return;
    }
    if(!game.collections[item.type]){game.collections[item.type] = [];}
    //if(!game.collections[item.type].includes(item.level)){item.collections[item.type].push(item.level);}

    const discoveredLevels = game.collections[item.type];
    if(!discoveredLevels.includes(item.level)) discoveredLevels.push(item.level);
    console.log("After recordDiscovery");

}

// used to est custom 500 error handler
//app.get("/test500", (req, res, next) => {
//    next(new Error("This is a test error"));
//});

//custom 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});



//custom 500
app.use((err, req, res, next) => {
console.error("server error:", err)
    res.status(500).sendFile(path.join(__dirname, 'public', '500.html'));
});
//err - error that occured
//req - info about incoming request
//res - used to send a response
//next - prints diagnostic info in server terminal




app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
