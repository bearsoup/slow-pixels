// TO-DO: Add constants NUM_BULBS, SPEED

// Load in pixel data as json
const fs = require('fs');
const data = fs.readFileSync('data/loading_green_house.json');
const pixels = JSON.parse(data);

// const maxApi = require('max-api');

// Set up node-hue-api

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const USERNAME = 'pjXty0dKewWoH-5pHxoCyQrSOV2RbTZ6fgBHtDke';

// Create general use light state
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

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// MAIN LOOP FUNCTION

async function makeArt() {
  
    // Wait for Bridge connection
    const api = await discoverAndConnect();

    // Loop

    // for (const [i, e] of pixels.entries()) {
    //     console.log(i, e);
    //     maxApi.post(i, e);
    //     maxApi.outlet(e);
    //}
        
    // !!!NEEDS MAX OUTPUT!!!
    // Figure how to send a Max dict with rgb values for each light
    // Can also add more on to loop to send values beyond the number of bulbs

    // for each pixel's rgb array in pixels[]
    for (let i=0; i<=pixels.length; i++) {

        console.log(`Pixel ${i}`);

        // for each bulb...
        for (let j=0; j<4; j++) {

            const lightID = j + 1; // find the target bulb
            const pixelIndex = pixels[i + (3 - j)]; // offset--look ahead n pixels

            console.log(`Pixel ${i}: Light ${lightID}: ${pixelIndex}`);

            theState.rgb(pixelIndex[0], pixelIndex[1], pixelIndex[2]);
            await api.lights.setLightState(lightID, theState)
                .then(result => console.log(`Light state change ${j} successful? ${result}`))
                .catch(err => console.log(err));
        }

        console.log('====================');

        await sleep(1000); // wait one tenth second
    }

}

makeArt();