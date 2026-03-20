import { generateTown } from "./town.js";

self.onmessage = function(e) {
    const { width, height } = e.data;
    let townData;

    do {
        townData = generateTown(width, height);
    } while (townData === 0);

    self.postMessage(townData);
};

