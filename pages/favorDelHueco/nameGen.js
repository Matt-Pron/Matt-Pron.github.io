const names = [
    "Aelous", "Borg", "Cyra", "Dax",
    "Eon", "Fray", "Glint", "Hadi",
    "Vaelun", "Kestrelia", "Zorith", "Maldane",
    "Fenwick", "Olyra", "Gryffon", "Tamsyn",
    "Baelor", "Sybilla", "Kaelen", "Rhysand",
    "Elowen", "Thrace", "Nyxos", "Valerius",
    "Caelum", "Isolde", "Theron", "Nyxara",
    "Joryn", "Elara", "Morgath", "Serafina"
    ];
export const NameGen = {
    getRandom() {
        return names[Math.floor(Math.random() * names.length)];
    }
};

