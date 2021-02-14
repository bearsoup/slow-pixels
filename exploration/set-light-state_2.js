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
  .brightness(100)
  .rgb(255, 255, 255)
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

async function setup() {
  
  // Wait for Bridge connection...
  const api = await discoverAndConnect();

  // ... then set light state
  api.lights.setLightState(LIGHT_ID, bulbOneState);
}

setup();




// Main part of program. Find and connect to Bridge, then set a light state
// discoverAndConnect()
    // .then(result => api = result)
    // .then(api => api.lights.setLightState(LIGHT_ID, stateThree))
    // .then(result => console.log(`Light state change successful? ${result}`))
    // .then(api => api.lights.getLightState(LIGHT_ID))
    // .then(state => console.log(state))
    // .catch(err => console.log(err))
;

//HOW DO I DO THIS WITHOUT RUNNING DISCOVER AND CONNECT AGAIN?
// log light state
// discoverAndConnect()
//     .then(api => api.lights.getLightState(LIGHT_ID))
//     .then(state => console.log(state))
//     .catch(err => console.log(err))
// ;



