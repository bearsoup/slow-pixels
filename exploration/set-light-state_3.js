const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const USERNAME = 'pjXty0dKewWoH-5pHxoCyQrSOV2RbTZ6fgBHtDke'
  // The name of the light we wish to retrieve by name
  , LIGHT_ID = 2
;

// SETUP
// Create LightState
const bulbOneState = new LightState()
  .on()
  .transitionInstant()
  .brightness(100)
//   .rgb(255, 255, 255)
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

function updateLightState(lightState, r, g, b) {
    const newLightState = lightState.rgb(r,g,b);
    return newLightState;
}

// Helper function for non-blocking sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// it may be better to not put this inside a function if possible.
async function makeArt() {
  
    // Wait for Bridge connection
    const api = await discoverAndConnect();

    // Loop
    for (let i = 0; i < 200; i+=5) {

        console.log(i);
        
        const currentLightState = updateLightState(bulbOneState, 0 + i , 20 + i, 200 - i);

        await api.lights.setLightState(LIGHT_ID, currentLightState)
            .then(result => console.log(`Light state change successful? ${result}`))
            .catch(err => console.log(err));

        await sleep(100); // wait one tenth of a second
    
    }
}

makeArt();


