// TO-DO: Add constants NUM_BULBS, SPEED

// ADJUST SET-UP VARIABLE(S)
NUM_BULBS = 5;

// LOAD JSON DATA

// Load in pixel rgb data as json
const fs = require('fs');
const data1 = fs.readFileSync('data/loading_green_house.json');
const pixels = JSON.parse(data1);

// Load in score frequency data as json
const data2 = fs.readFileSync('data/home-freqs.json');
const score = JSON.parse(data2);

// INITIALIZE APIS

// Max API
const maxApi = require('max-api');

// node-hue-api
const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;
const USERNAME = 'pjXty0dKewWoH-5pHxoCyQrSOV2RbTZ6fgBHtDke';

// SET UP HUE LIGHT COMM

// Create general-use light state
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

/// OTHER FUNCTION(S)

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ** MAIN **

// MAX I/O

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

// multiplier set in Max to control duration
let durmult = 1;

maxApi.addHandler('durmult', (durmultVal) => {
	durmult = durmultVal;
});

maxApi.post(durmult);

// get score data
let scoreIndex = 0;
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

// MAIN FUNCTION

async function makeArt() {

    // Connect to Hue Bridge
    const hueApi = await discoverAndConnect();

    // LOOP
    // Can also add more on to loop to send values beyond the number of bulbs

    // for each pixel's rgb array in pixels[]
    for (let i=0; i<=pixels.length; i++) {

        // send data to Max
        pixelData.base = pixels[i];
        pixelData.lookahead = pixels[i + spread];
        pixelData.homefr =  getFr();

        maxApi.post(`Pixel ${i}: Base: ${pixelData.base} Look (${spread}): ${pixelData.lookahead} ScoreStep: ${pixelData.homefr.step}`);
        maxApi.outlet(pixelData);

        // send data to Hue bulbs
        // for each bulb...
        for (let j=0; j<NUM_BULBS; j++) {

            // find the target bulb id 1 thru NUM_BULBS
            const lightID = j + 1; 

            // spread offset--look ahead n pixels
            // this is set to map an array of adjacent to each bulb in sequence
            // but it could be a wider spread of pixels mapped to each bulb
            // e.g. 0, 100, 200, 300, 400
            const pixelIndex = pixels[i + ((NUM_BULBS - 1) - j)];

            // send logging to Max console
            maxApi.post(`Pixel ${i}: Light ${lightID}: ${pixelIndex}`);

            // send rgb data to bulbs
            theState.rgb(pixelIndex[0], pixelIndex[1], pixelIndex[2]);
            await hueApi.lights.setLightState(lightID, theState)
                .then(result => console.log(`Light state change ${j} successful? ${result}`))
                .catch(err => console.log(err));
        }

        // delay before looping again/moving to next pixel
        await sleep(speed); 
    }

}

makeArt();