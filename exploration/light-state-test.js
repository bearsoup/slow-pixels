const v3 = require('node-hue-api').v3;
const LightState = v3.lightStates.LightState;

const USERNAME = 'pjXty0dKewWoH-5pHxoCyQrSOV2RbTZ6fgBHtDke'
  // The name of the light we wish to retrieve by name
  , LIGHT_ID = 2
;

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
  
  const ipAddress = await discoverBridge();
  console.log(`Bridge IP Address: ${ipAddress}`);

  return v3.api.createLocal(ipAddress).connect(USERNAME);

}

discoverAndConnect()
  .then(api => {
    const state = new LightState()
      .on()
      .ct(200)
      .brightness(100)
    ;
    return api.lights.setLightState(LIGHT_ID, state);
  })
  .then(result => {
    console.log(`Light state change successful? ${result}`);
  })
;

// v3.discovery.nupnpSearch()
// .then(searchResults => {
//   const host = searchResults[0].ipaddress;
//   return v3.api.createLocal(host).connect(USERNAME);
// })
// // .then(response => console.log(response))
// .catch(err => console.log(err))
// ;
// }

// const myBridge = v3.discovery.nupnpSearch()
//   .then(searchResults => {
//     const host = searchResults[0].ipaddress;
//     return v3.api.createLocal(host).connect(USERNAME);
//   })
//   // .then(response => console.log(response))
//   .catch(err => console.log(err))
// ;

// v3.discovery.nupnpSearch()
//   .then(searchResults => {
//     const host = searchResults[0].ipaddress;
//     return v3.api.createLocal(host).connect(USERNAME);
//   }) // CAN I MAKE THIS ITS OWN FUNCTION TO SET GLOBAL HOST CONST FOR REUSE?
//   .then(api => {
//     // Using a LightState object to build the desired state
//     const state = new LightState()
//       .on()
//       .ct(200)
//       .brightness(100)
//     ;
//     return api.lights.setLightState(LIGHT_ID, state);
//   })
//   .then(result => {
//     console.log(`Light state change was successful? ${result}`);
//   })
// ;

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