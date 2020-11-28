function changeDecToHex(number, decimals){
    const num = parseFloat(number) * Math.pow(10, decimals)
    // console.log(num, decimals)
    return "0x" + num.toString(16)
}

function changeJsbiToDec(jsbi, decimals){
    return parseFloat(String(jsbi)) / 10 ** decimals
}

// function convertExpToDec(exponentialNumber){
//     const str = exponentialNumber.toString();
//     if (str.indexOf('e') !== -1) {
//       const exponent = parseInt(str.split('-')[1], 10)
//       const result = exponentialNumber.toFixed(exponent)
//       return result;
//     } else {
//       return exponentialNumber;
//     }
// }
module.exports={
    changeDecToHex, changeJsbiToDec
}