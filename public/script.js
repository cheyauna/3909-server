/*
* handles browser interactions - clicking and selecting grid items
*/

//variables
let gameState = null;
let isGenerating = false;
let isMerging = false;
let isLoading = true;

//used for the form
const playerForm = document.querySelector("#player-form");
const playerError = document.querySelector("#player-error");
const gameScreen = document.querySelector("#game-screen");
const exportButton = document.querySelector("#export-collection");
const loadingScreen = document.querySelector("#loading-msg");



//creates a 4x4 grid, with 1 cell being a generator
const grid = document.querySelector(".grid-container");
for(let i = 0; i < 4; i++){
    for(let j = 0; j < 4; j++){
    const newItem = document.createElement('div');

    if(i==3 && j==3){
        newItem.textContent = '🍶';
        newItem.className = 'grid-item-generator';
    }
    else{
        newItem.textContent = '';
        newItem.className = 'grid-item';

        newItem.dataset.row = i;
        newItem.dataset.column = j;
    }
    grid.append(newItem);
    }
}

//creates players resources
const resources = document.querySelector('.resources');

let username = 'chey';
const newRes = document.createElement('div');
newRes.textContent = '👩🏼‍💻️' + username
newRes.className = 'player'
resources.append(newRes)


const energyDisplay = document.createElement('div');
energyDisplay.textContent = '⚡️' ;
energyDisplay.className = 'energy'
resources.append(energyDisplay)


const moneyDisplay = document.createElement('div');
moneyDisplay.textContent = '💰️ $' ;
moneyDisplay.className = 'money'
resources.append(moneyDisplay)


//event listeners
//used to generate items
const generators = document.querySelectorAll(".grid-item-generator");
generators.forEach(generator =>{
    generator.addEventListener("click", () =>{
        generateItem();
    })
})

//used to highlight selected grid boxes
let selectedCell = null;
const gridItems = document.querySelectorAll(".grid-item");
console.log(gridItems.length); //should print 15
gridItems.forEach(item => {
    item.addEventListener("click", () =>{
        const row = Number(item.dataset.row);
        const column = Number(item.dataset.column);
        if (isLoading || !gameState || isGenerating || isMerging) {
            return;
        }
        //selectedCell = cell_contents[dataset.row][dataset.column];
        if(gameState.cell_contents[row][column] != null){
            if(selectedCell == null){
                selectedCell = {row: row, column: column}
                gridItems.forEach(gridItem =>{
                    gridItem.classList.remove("selected");
                });
                item.classList.add("selected");
                console.log("cell selected");
            }
            else if(selectedCell.row == row &&
                selectedCell.column == column){
                    gridItems.forEach(gridItem =>{
                        gridItem.classList.remove("selected");
                    });
                    selectedCell = null;
            }
            else{
                mergeItems(row, column);

            }
        }

    });

});

//used for form submission
//AJAX calls from client -> server using fetch()
playerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    playerError.textContent = "";

    const name = document.querySelector("#player-name").value;
    const collection = document.querySelector("#starting-collection").value;

    try{
        const response = await fetch("/api/player", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                collection: collection
            })
        });
        const data = await response.json();

        if(!response.ok){
            playerError.textContent = data.error || "unable to start the game";
            return;
        }
        //updates displayed username
        username = data.name;
        newRes.textContent = "👩🏼‍💻" + username;

        //hides the form while game state laods
        playerForm.hidden = true;
        //gameScreen.hidden = false;
        await loadState();
    }catch(error){
        playerError.textContent = "could not connect to the server. please try again";
    }

});

//used to export data
exportButton.addEventListener("click", () => {
    window.location.href = `/api/export?name=${encodeURIComponent(username)}`;
});

//functions
//shows a popup error message - either no energy or board full
function showMessage(message, popupId){
    const popup = document.querySelector(popupId);
    popup.textContent = message;
    popup.classList.add("show");
    setTimeout(() =>{
        popup.classList.remove("show");
    }, 5000);
}

//used to fill in the grid
//demonstrates asynchronous communication & updates without full page resetfetch
async function generateItem(){
    //console.log("Generator clicked!");
    if (isGenerating || isMerging || isLoading || !gameState) {
            return;
        }

        isGenerating = true;

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: username
                })
            });

            const responseText = await response.text();
            console.log("Server response:", responseText);
            let data;

            try{
                data = JSON.parse(responseText);
            } catch(error){
                console.error("server returned non-json:", responseText);
                throw new Error("the server returned an unexpected response")
            }

            if (!response.ok) {
                throw new Error(data.error || 'Could not generate item.');
            }
//
            gameState = data;
            renderState();

        } catch (error) {
            console.error('Generation failed:', error);

            if (error.message === "not enough energy!") {
                showMessage(error.message, "#no-energy-msg");
            } else if (error.message === "your board is full!") {
                showMessage(error.message, "#board-full-msg");
            } else {
                showMessage(
                    error.message || "Something went wrong!",
                    "#no-energy-msg"
                );
            }
        } finally {
            isGenerating = false;
        }
}

//used to display item generated
function displayItem(row, column){
    const cell = document.querySelector(
        `.grid-item[data-row="${row}"][data-column="${column}"]`
    );
    const item = gameState.cell_contents[row][column];
    if(item == null) cell.textContent = "";
    else if (item.type == "matcha" &&
        item.level == 1) cell.textContent = "🍵"
    else if (item.type == "matcha" &&
        item.level == 2) cell.textContent = "☕️"
    else if (item.type == "matcha" &&
        item.level == 3) cell.textContent = "🧉️"
}

//used to merge items
async function mergeItems(row, column){
    if(selectedCell == null) return;
    if(isGenerating || isMerging || isLoading || !gameState) return;
    isMerging = true;

    try{
    const response = await fetch('/api/merge', {
        method: 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            name: username,
            cell1 : selectedCell,
            cell2: {
                row: row,
                column: column
            }
        })
    });
    //const data = await response.json();

    const responseText = await response.text();
    console.log("Merge response:", responseText);

    let data;

    try {
        data = JSON.parse(responseText);
    } catch (error) {
        console.error("Merge returned non-JSON:", responseText);
        throw new Error("Server returned an unexpected response.");
    }

    if(response.ok){
        gameState = data;
        selectedCell = null;

        gridItems.forEach(gridItem => {
            gridItem.classList.remove("selected");
        });
        renderState();
    }
    else{
        showMessage(data.error || "cannot merge items", "#board-full-msg");
    }
    }catch(error){
        console.error("Merge failed:", error);
        showMessage("could not connect to the server. please try again.",
        "#no-energy-msg");
    }finally{
        isMerging = false;
    }
}
//loads state of the game
async function loadState(){ //lets function wait fro servers response
isLoading = true;
    loadingScreen.hidden = false;

    try {
        const response = await fetch(
            `/api/state?name=${encodeURIComponent(username)}`
        );

        if (!response.ok) {
            throw new Error("Could not load game state.");
        }

        gameState = await response.json();

        console.log("Game state received:", gameState);

        renderState();

        gameScreen.hidden = false;

    } catch (error) {
        console.error("Error loading game:", error);

        showMessage(
            "Could not load the game. Please try again.",
            "#player-error"
        );

        playerForm.hidden = false;
    } finally {
        loadingScreen.hidden = true;
        isLoading = false;
    }
}

function renderState(){
    energyDisplay.textContent = '⚡️' + gameState.energy;
    moneyDisplay.textContent = '💰️ $' + gameState.money;
    for(let i = 0; i < gameState.cell_contents.length; i++){
        for(let j = 0; j < gameState.cell_contents[i].length; j++){
            if(i != 3 || j != 3){
                displayItem(i, j);
            }
        }
    }
}


//loadState();
