const fs = require('fs');
// Load in score data as json
const data2 = fs.readFileSync('../data/home-freqs.json');
const score = JSON.parse(data2);

let x = -1;
let dur = 0;

let obj = {
    prop: {}
}

function getFreqs() {
    if (dur < score[x].duration) {
        dur++;
    } else if (x < score.length) {
        x = 0;
    } else {
        x++;
    }
    return score[x];
}


// function getFreqs() {
//     if (x == score.length - 1) {
//         x = 0;
//     } else {
//         x++;
//     }
//     return score[x]
// }

// for (let i=0; i<11; i++) {
//     obj.prop = getFreqs();
//     console.log(obj)
// };

console.log(score[1].duration);

/*

- get first obj in json
- get obj.duration
- return json[obj] x times where x=obj.duration
- then move to next obj in json and repeat
- need to do this without loops, since cod emust not block loop in which it is embedded

*/