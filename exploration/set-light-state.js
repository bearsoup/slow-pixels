const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const USERNAME = 'pjXty0dKewWoH-5pHxoCyQrSOV2RbTZ6fgBHtDke'
  // The name of the light we wish to retrieve by name
  , LIGHT_ID = 2
;

// Create Light States here

// Light State: OFF
const stateOne = new LightState()
  .off()
;

//Light State: On
const stateTwo = new LightState()
  .on()
  .ct(200)
  .brightness(100)
;

//Light State: RGB
const stateThree = new LightState()
  .rgb(211, 155, 10)
;

// Find the Bridge and get its IP Address
async function discoverBridge() {
  
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
    
    // Get Bridge IP Address after finding Bridge
    const ipAddress = await discoverBridge();
    console.log(`Bridge IP Address: ${ipAddress}`);
    
    // Prepare light api object
    return v3.api.createLocal(ipAddress).connect(USERNAME);

}


// Main part of program. Find and connect to Bridge, then set a light state
discoverAndConnect()
    .then(api => api.lights.setLightState(LIGHT_ID, stateThree))
    .then(result => console.log(`Light state change successful? ${result}`))
    // .then(api => api.lights.getLightState(LIGHT_ID))
    // .then(state => console.log(state))
    .catch(err => console.log(err))
;

//HOW DO I DO THIS WITHOUT RUNNING DISCOVER AND CONNECT AGAIN?
// log light state
discoverAndConnect()
    .then(api => api.lights.getLightState(LIGHT_ID))
    .then(state => console.log(state))
    .catch(err => console.log(err))
;

//general syntax for promises
//fetch(API).then(gotData).catch(gotErr);

// fetch(API)
//   .then(data => console.log(data))
//   .catch(err => console.log(err));

// fetch(API)
//   .then(response => response.json())
//   .then(json => console.log(json))
//   .catch(err => console.log(err));

// fetch(API)
//   .then(arrow => {
//     code_to_execute;
//   })
//   .then( anotherArrow => {
//     more_code;
//   }).catch(err) {
//     console.log(error_msg);
//   }