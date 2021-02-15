const fs = require('fs');
const data = fs.readFileSync('data/loading_green_house.json');
const pixels = JSON.parse(data);

const maxApi = require('max-api');

// // Helper function for non-blocking sleep
// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

for (let i of pixels) {
    maxApi.post(`r: ${i[0]}, g: ${i[1]}, b: ${i[2]}`)
};