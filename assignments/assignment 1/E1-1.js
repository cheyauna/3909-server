

function addGrunt(msg, callback) {
    setTimeout(() => {
        callback(msg + "*grunt*");
    }, 1000);
}

function addSmack(msg, callback) {
    setTimeout(() => {
        callback("*smack*" + msg);
    }, 1000);
}

function addBreath(msg, callback) {
    setTimeout(() => {
        callback(msg + "*wheez*");
    }, 1000);
}

let msg = "telephone";

addGrunt(msg, (modded) => {
    addSmack(modded, (modded) => {
        addBreath(modded, (modded) => {
            console.log(modded);
        });
    });
});

