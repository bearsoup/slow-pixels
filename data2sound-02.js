// TO-DO: Add constants NUM_BULBS, SPEED

// Load in pixel data as json
const fs = require('fs');
const data1 = fs.readFileSync('data/loading_green_house.json');
const pixels = JSON.parse(data1);

// Load in score data as json
const data2 = fs.readFileSync('data/home-freqs.json');
const score = JSON.parse(data2);

// Max API
const maxApi = require('max-api');

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// js object to send as max dict
let pixelData = {
    base: [],
  lookahead: [],
  homefr: {}
}

// number of pixels to look ahead
let spread = 3;

maxApi.addHandler('spread', (spreadVal) => {
  spread = spreadVal;
});

// speed of pixel change in ms
let speed = 1000;

maxApi.addHandler('speed', (speedVal) => {
  speed = speedVal;
});

// initialize + get score step
let homeCount = -1;

function getFr() {
    if (homeCount == score.length - 1) {
        homeCount = 0;
    } else {
        homeCount++;
    }
    return score[homeCount]
}

// MAIN LOOP FUNCTION

async function makeArt() {

    // Loop
    // Can also add more on to loop to send values beyond the number of bulbs

  // for each pixel's rgb array in pixels[]
  for (let i=0; i<=pixels.length; i++) {

    pixelData.base = pixels[i];
    pixelData.lookahead = pixels[i + spread];
    pixelData.homefr =  getFr();

    maxApi.post(`Pixel ${i}: Base: ${pixelData.base} Look (${spread}): ${pixelData.lookahead} ScoreStep: ${pixelData.homefr.step}`);

    maxApi.outlet(pixelData);

    await sleep(speed); // wait one second
  }

}

makeArt();