"use strict";

let baseCards = document.getElementsByClassName("card--base");

let showCards = function(cardCategory) {
    let cards = document.getElementsByClassName(cardCategory);

    for (let i = 0; i < cards.length; i++) {
        cards[i].classList.add("pick");
    };
    for (let j = 0; j < baseCards.length; j++) {
        baseCards[j].classList.remove("pick");
    };
}

let barajar = function() {
    let cards = document.getElementsByClassName("card");

    for (let i = 0; i < cards.length; i++) {
        cards[i].classList.remove("pick");
    };
    for (let j = 0; j < baseCards.length; j++) {
        baseCards[j].classList.add("pick");
    };
}
