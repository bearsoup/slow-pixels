// ADJUST SET-UP VARIABLE(S)
NUM_BULBS = 5;

// LOAD JSON DATA

// Load in pixel rgb data as json
const fs = require('fs');
const data1 = fs.readFileSync('data/sp-loading-08.json');
const pixels = JSON.parse(data1);

// INITIALIZE API

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

// default position in image pixel array
// let startpix = 0;

// BRING IN STORAGE SOLUTION FROM PYTHON PRINTER PROJECT

// default number of pixels for sound to look ahead
let spread = NUM_BULBS -1;

// default speed of pixel change in ms
let speed = 1000;

/// OTHER FUNCTION(S)

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// MAIN FUNCTION

async function makeArt() {

    // Connect to Hue Bridge
    const hueApi = await discoverAndConnect();

    // LOOP
    // for each pixel's rgb array in pixels[], starting with startpix msg value from Max
    for (let i=startpix; i<pixels.length; i++) {

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

            // send rgb data to bulbs
            theState.rgb(pixelIndex[0], pixelIndex[1], pixelIndex[2]);
            await hueApi.lights.setLightState(lightID, theState)
                .then(result => console.log(`Light state change ${j} successful? ${result}`))
                .catch(err => console.log(err));
        }

        // delay before looping again/moving to next pixel
        await sleep(speed); 
    }

    console.log(`Program complete: Reached end of ${pixels.length} pixels.`);

}

makeArt();