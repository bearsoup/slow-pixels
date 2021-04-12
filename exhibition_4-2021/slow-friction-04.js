// ADJUST SET-UP VARIABLE(S)
NUM_BULBS = 5;

// LOAD JSON DATA

// Load in pixel rgb data as json
const fs = require('fs');
const data1 = fs.readFileSync('data/sp-loading-08.json');
const pixels = JSON.parse(data1);

// Load in score frequency data as json
const data2 = fs.readFileSync('data/home-freqs.json');
const score = JSON.parse(data2);

// Load in Max data savestate
const data3 = fs.readFileSync('data/savestate.json');
const savestate = JSON.parse(data3);

// INITIALIZE APIS

// Max API
const maxApi = require('max-api');

// node-hue-api
const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;
const USERNAME = 'pjXty0dKewWoH-5pHxoCyQrSOV2RbTZ6fgBHtDke';

// SET UP HUE LIGHT COMM

//Create general-use light state
const theState = new LightState()
    .on()
    .transitionInstant()
;

// Find the Bridge and get its IP Address
async function discoverBridge() {

  // Wait for Bridge discovery
  const discoveryResults = await v3.discovery.nupnpSearch();

  // Error handling for if no Bridge found
  if (discoveryResults.length === 0) {
    console.error('Failed to resolve any Hue Bridges');
    return null;
  } else {
      // Ignoring that you could have more than one Hue Bridge on a network as this is unlikely in 99.9% of users situations
      return discoveryResults[0].ipaddress;
  }

}

async function discoverAndConnect() {

  // Wait for Bridge IP
  const ipAddress = await discoverBridge();
  console.log(`Bridge IP Address: ${ipAddress}`);
  
  // Prepare light api object
  return v3.api.createLocal(ipAddress).connect(USERNAME);

}

// MAX I/O

// js object to send as max dict
let pixelData = {
    idx: 0,
    base: [],
    lookahead: [],
    homefr: {}
}

// default position in image pixel array
// let startpix = 0;
let startpix = savestate["pattrstorage"]["slots"]["1"]["data"]["currentpix"];   

maxApi.addHandler('startpix', (startpixVal) => {
    // if value from Max > number of pixels in img, attenuate at last pixel
    if (startpix < pixels.length) {
        return startpixVal;
    } else {
        return pixels.length - 1;
    }
});

// default position in score
// let startstep = 1;
let startstep = savestate["pattrstorage"]["slots"]["1"]["data"]["currentstep"]

maxApi.addHandler('startstep', (startstepVal) => {
    if (startstepVal <= score.length) {
        startstep = startstepVal - 1;
    } else {
        startstep = score.length - 1;
    }
});

// default number of pixels for sound to look ahead
let spread = NUM_BULBS -1;

maxApi.addHandler('spread', (spreadVal) => {
  spread = spreadVal;
});

// default speed of pixel change in ms
let speed = 1000;

maxApi.addHandler('speed', (speedVal) => {
  speed = speedVal;
});

// default multiplier set in Max to control duration
let durmult = 1;

maxApi.addHandler('durmult', (durmultVal) => {
	durmult = durmultVal;
});

// send bang or msg to max to get all inputs after script is running
maxApi.outletBang()
// MAY NEED TO chain this with async/await so makeArt() doesn't begin until data received
// async function that returns startpix and startstep

// get score data
let scoreIndex = 0; // initialize to max msg or default

let frDur = durmult * score[scoreIndex].duration;

function getFr() {
    if (frDur > 0) {
        frDur -= 1; //object repetition
    } else {    
        if (scoreIndex == score.length - 1) {
            scoreIndex = 0;
        } else {
            scoreIndex++;
        }
        frDur = (durmult * score[scoreIndex].duration) - 1;
    }

    return score[scoreIndex];
}

/// OTHER FUNCTION(S)

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// MAIN FUNCTION

// maxApi handler values won't be ready until this async function
async function makeArt() {

    // Connect to Hue Bridge
    const hueApi = await discoverAndConnect();

    maxApi.post('Starting main loop')

    // Set score position
    scoreIndex = startstep;

    // LOOP
    // for each pixel's rgb array in pixels[], starting with startpix msg value from Max
    for (let i=startpix; i<pixels.length; i++) {

        // send data to Max
        pixelData.idx = i;
        pixelData.base = pixels[i];
        pixelData.lookahead = pixels[i + spread];
        pixelData.homefr =  getFr();

        maxApi.outlet(pixelData);
        maxApi.post(`Pixel ${i}: Base: ${pixelData.base} Look (${i+spread}): ${pixelData.lookahead} ScoreStep: ${pixelData.homefr.step} DurMult: ${durmult} Spread: ${spread} Speed: ${speed}`);

        // send data to Hue bulbs

        // set spread interval based on number of bulbs
        let lightSpread = spread / (NUM_BULBS - 1); // (lookahead - base) / (NUM_BULBS - 1)

        // for each bulb...
        for (let j=0; j<NUM_BULBS; j++) {

            // find the target bulb id 1 thru NUM_BULBS
            const lightID = j + 1; 

            // spread offset--look ahead n pixels
            // if for some reason you wanted to set lights in reverse order:
            // const pixelIndex = pixels[i + ((NUM_BULBS - 1) - j)]; 

            let idxVal = 0;

            if (spread < NUM_BULBS - 1) {
                idxVal = i + j;
            } else {
                idxVal = Math.round(i + (lightSpread * j));
            }

            const pixelIndex = pixels[idxVal];

            // send logging to Max console
            //maxApi.post(`Pixel ${i}: Light ${lightID}: ${idxVal} (${pixelIndex})`);

            // send rgb data to bulbs
            theState.rgb(pixelIndex[0], pixelIndex[1], pixelIndex[2]);
            await hueApi.lights.setLightState(lightID, theState)
                .then(result => console.log(`Light state change ${j} successful? ${result}`))
                .catch(err => console.log(err));
        }

        // delay before looping again/moving to next pixel
        await sleep(speed); 
    }

    maxApi.post(`Program complete: Reached end of ${pixels.length} pixels.`)

}

makeArt();