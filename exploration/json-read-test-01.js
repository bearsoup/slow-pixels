const fs = require('fs');
const data = fs.readFileSync('data/loading-01_arr-op.json');
const pixels = JSON.parse(data);

// console.log(pixels[0][1]);

for (let i of pixels) {
    console.log(
        i[0], 
        i[1],
        i[2],
    )
}