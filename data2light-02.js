// Load in pixel data as json
const fs = require('fs');
const data = fs.readFileSync('data/loading_green_house.json');
const pixels = JSON.parse(data);

// const maxApi = require('max-api');

// Set up node-hue-api

const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const USERNAME = 'pjXty0dKewWoH-5pHxoCyQrSOV2RbTZ6fgBHtDke'
  // The name of the light we wish to retrieve by name
  , LIGHT_ID = 1
;

// Create LightStates

// Bulb One
const bulbOneState = new LightState()
  .on()
  .transitionInstant()
;

//Bulb Two
const bulbTwoState = new LightState()
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

// function updateLightState(lightState, ...vals) {
//     const newLightState = lightState.rgb(
//         vals[0],
//         vals[1],
//         vals[2]
//     );
//     return newLightState;
// }

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeArt() {
  
    // Wait for Bridge connection
    const api = await discoverAndConnect();

    // Loop

    // for (const [i, e] of pixels.entries()) {
        
    //     console.log(i, e);
    //     maxApi.post(i, e);
    //     maxApi.outlet(e);
        
    //     // state one needs to start n-lights ahead
    //     // i have 4 lights, so n + 3 gets me there
    //     const setStateOne = updateLightState(
    //         bulbOneState, 
    //         e+4[0], 
    //         e+4[1],
    //         e+4[2],
    //     );

    for (let i=0; i<=pixels.length; i++) {

        console.log(i, pixels[i+3]); // debug

        // Update Bulb One state
        // let setStateOne = updateLightState(bulbOneState, pixels[i+3]);
        // Update Bulb Two state... loop would be more elegant
        // let setStateTwo = updateLightSTate(bulbTwoState, pixels[i+2]);
    
        // await api.lights.setLightState(LIGHT_ID, setStateOne)
            // .then(result => console.log(`Light state change successful? ${result}`))
            // .catch(err => console.log(err));

        //set the other states to the lights
        //this could be a loop instead...? for await of...

        for (let j=0; j<4; j++) {
            const lightID = j + 1;
            const pixelIndex = pixels[i + (3 - j)];
            const theState = new LightState()
                .on()
                .transitionInstant()
                .rgb(pixelIndex[0], pixelIndex[1], pixelIndex[2]);
            // const setState = updateLightState(theState, pixels[i + (3 - j)]);
            await api.lights.setLightState(lightID, theState)
                .then(result => console.log(`Light state change ${j} successful? ${result}`))
                .catch(err => console.log(err));
        }

        await sleep(1000); // wait one second
    }

}

makeArt();