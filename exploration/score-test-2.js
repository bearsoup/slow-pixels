const fs = require('fs');
// Load in score data as json
const data2 = fs.readFileSync('../data/home-freqs.json');
const score = JSON.parse(data2);

let obj = {
    prop: {}
}

// - get first obj in json
// - get obj.duration
// - return json[obj] x times where x=obj.duration
// - then move to next obj in json and repeat
// - need to do this without loops, since cod emust not block loop in which it is embedded

let scoreIndex = 0;
let freqDur = score[scoreIndex].duration;

function getFreqs() {
        if (freqDur > 0) {
            freqDur -= 1; //object repetition
        } else {
            if (scoreIndex == score.length - 1) {
                scoreIndex = 0;
            } else {
                scoreIndex++;
            }
            freqDur = score[scoreIndex].duration -1;
        }
    
    return score[scoreIndex];

}


for (let i=0; i<20; i++) {
    obj.prop = getFreqs();
    console.log(`scoreIndex: ${scoreIndex}, freqDur: ${freqDur}`);
    console.log(obj);
};