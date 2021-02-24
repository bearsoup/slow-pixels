// TO-DO: Add constants NUM_BULBS, SPEED

// Load in pixel data as json
const fs = require('fs');
const data = fs.readFileSync('data/loading_green_house.json');
const pixels = JSON.parse(data);

// Max API
const maxApi = require('max-api');

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// js object to send as max dict
let pixelData = {
  base: [],
  lookahead: []
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

// MAIN LOOP FUNCTION

async function makeArt() {

    // Loop
    // Can also add more on to loop to send values beyond the number of bulbs

  // for each pixel's rgb array in pixels[]
  for (let i=0; i<=pixels.length; i++) {

    pixelData.base = pixels[i];
    pixelData.lookahead = pixels[i + spread];

    maxApi.post(`Pixel ${i}: Base: ${pixelData.base} Look (${spread}): ${pixelData.lookahead}`)

    maxApi.outlet(pixelData);

    await sleep(speed); // wait one second
  }

}

makeArt();