const fs = require('fs');
const data = fs.readFileSync('../data/loading_green_house.json');
const pixels = JSON.parse(data);

// function getColorValues(data, i, offset) {
    //const rgbArray = data[i + offset]

    // return [
    //     rgbArray[0],
    //     data[i + offset][1],
    //     data[i + offset][2]
    // ]

    // return data[i + offset]
//}

for (let i=0;i<10; i++) {
    console.log(
        // `Pixel ${i}: ${getColorValues(pixels, i, 4)}`
        `Pixel ${i}: ${pixels[i+4][0]}`
        )
}