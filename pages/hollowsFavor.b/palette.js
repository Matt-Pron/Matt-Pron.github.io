import { Globals } from "./globals.js";

const c64 = [
    "#000000",
    "#ffffff",
    "#626262",
    "#898989",
    "#adadad",
    "#9f4e44",
    "#cb7e75",
    "#6d5412",
    "#a1683c",
    "#c9d487",
    "#9ae29b",
    "#5cab5e",
    "#6abfc6",
    "#887ecb",
    "#50459b",
    "#a057a3"
];

const dawnbringer = [
    "#140c1c",
    "#deeed6",
    "#4e4a4e",
    "#757161",
    "#8595a1",
    "#d04648",
    "#d2aa99",
    "#854c30",
    "#d27d2c",
    "#dad45e",
    "#6daa2c",
    "#346524",
    "#6dc2ca",
    "#597dce",
    "#30346d",
    "#442434"
];

const forest = [
    "#0f2c2e",
    "#ecddba",
    "#796e63",
    "#a17d5e",
    "#b4a18f",
    "#913636",
    "#ad5f52",
    "#692f11",
    "#89542f",
    "#e1c584",
    "#345644",
    "#6b7f5c",
    "#64988e",
    "#3d7085",
    "#c89660",
    "#b0b17c"
];

export const palettes = [
    { name: "Commodore 64", data: c64 },
    { name: "Dawnbringer", data: dawnbringer },
    { name: "Forest", data: forest }
];

export const colors = new Proxy({}, {
    get(target, prop) {
        const index = parseInt(prop);
        if (!isNaN(index)) {
            return palettes[Globals.paletteID].data[index];
        }
        return target[prop];
    }
});

