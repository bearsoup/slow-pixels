const fs = require('fs');
// Load in score data as json
const data2 = fs.readFileSync('../data/home-freqs.json');
const score = JSON.parse(data2);

let x = -1;

let obj = {
    prop: {}
}

function getFreqs() {
    if (x == score.length - 1) {
        x = 0;
    } else {
        x++;
    }
    return score[x]
}

for (let i=0; i<11; i++) {
    obj.prop = getFreqs();
    console.log(obj)
};