// (function () {
//     console.log("worker");
//     if (!window.loderHandler) return
//     window.loderHandler();
// })
var start = Date.now();

console.log("Worker start", start);

setInterval(() => {
    var end = Date.now();
    var diff = end - start;
    if (diff > 120) {
        console.log('diff', diff);
    }
    start = Date.now();

}, 100);