/*
* handles browser interactions - clicking and selecting grid items
*/

//variables
let gameState = null;



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


//initiates an empty 2D array
const cell_contents = [
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
    [null, null, null, null]
];
cell_contents[3][3] = {type: "generator", level: 0};


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
async function generateItem(){
    console.log("Generator clicked!");

    const response = await fetch('/api/generate', {
        method: 'POST'
    });

    const data = await response.json();

    if(response.ok){
        gameState = data;
        renderState();
    }
    else{
        if(data.error == "not enough energy!"){
            showMessage(data.error, "#no-energy-msg");
        }
        else if(data.error == "your board is full!"){
            showMessage(data.error, "#board-full-msg");
        }
        else{
            showMessage(data.error || "Something went wrong!", "#no-energy-msg");
        }
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

    const response = await fetch('/api/merge', {
        method: 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
            cell1 : selectedCell,
            cell2: {
                row: row,
                column: column
            }
        })
    });
    const data = await response.json();

    if(response.ok){
        gameState = data;
        selectedCell = null;

        gridItems.forEach(gridItem => {
            gridItem.classList.remove("selected");
        });
        renderState();
    }
    else{
        showMessage(data.error || "cannot merge items", "#board-full-msg")
    }
}
//loads state of the game
async function loadState(){ //lets function wait fro servers response
    const response = await fetch('/api/state'); //sends a request to express server
    gameState = await response.json(); //gameState - stores data in browser, reads json returned from express
    renderState(); //will update the board and resource displays
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
loadState();
