"use strict";

let data = {};

fetch("js/data.json")
    .then(function (file) {
        return file.json();
    })  
    .then(function (_data) {
        data = _data;
        barajar();
    });

let pickCards = function(category) {
    switch (category) {
        case 0:
            pickPlace();
            break;
        case 1:
            pickPC();
            break;
        case 2:
            pickNPC();
            break;
        case 3:
            pickSession();
            break;
    }
}

let pickCrono = function() {
        let newCard = document.createElement('div');

        newCard.classList.add("card");
        newCard.classList.add("stacked");
        newCard.classList.add("crono");
        newCard.innerHTML =
            `
            <img src="img/base/5.jpg" class="card_img">
            <div class="card_content">
                <h2 class="card_title">Volver</h2> 
            </div>
            `;
        baraja.appendChild(newCard);
        baraja.lastChild.addEventListener('click', barajar);
}

let barajar = function() {

    let baraja = document.getElementById("baraja");
    baraja.innerHTML = "";

    data.base.map(item => {
        let newCard = document.createElement('div');

        newCard.classList.add("card");
        newCard.classList.add("stacked");
        newCard.classList.add("card--base");
        newCard.id = data.base.indexOf(item);
        newCard.innerHTML =
            `
            <img src="img/base/${ item.img }.jpg" class="card_img">
            <div class="card_content">
                <h2 class="card_title">${ item.name }</h2> 
                <p class="card_desc">${ item.desc }</p> 
            </div>
            `;
        baraja.appendChild(newCard);
        baraja.lastChild.addEventListener('click', setArg, false);
        baraja.lastChild.myArg = data.base.indexOf(item);
        function setArg(e) {
            pickCards(e.currentTarget.myArg);
        };
    })
}

let pickPlace = function() {

    let baraja = document.getElementById("baraja");
    baraja.innerHTML = "";

    pickCrono();

    data.place.map(item => {
        let newCard = document.createElement('div');

        newCard.classList.add("card");
        newCard.classList.add("stacked");
        newCard.classList.add("card--places");
        newCard.id = data.place.indexOf(item);
        newCard.innerHTML =
            `
            <img src="img/places/${ item.img }.jpg" class="card_img">
            <div class="card_content">
                <h2 class="card_title">${ item.name }</h2> 
                <p class="card_desc">${ item.desc }</p> 
            </div>
            `;
        document.getElementById("baraja").appendChild(newCard);
    })
}

let pickPC = function() {

    let baraja = document.getElementById("baraja");
    baraja.innerHTML = "";

    pickCrono();

    data.pc.map(item => {
        let newCard = document.createElement('div');

        newCard.classList.add("card");
        newCard.classList.add("stacked");
        newCard.classList.add("card--pc");
        newCard.id = data.pc.indexOf(item);
        newCard.innerHTML =
            `
                <img src="img/pc/${ item.img }.jpg" class="card_img">
                <div class="card_content">
                    <h2 class="card_title">${ item.name }</h2> 
                    <p class="card_desc">${ item.desc }</p> 
                </div>
                <h2 class="owned">${ item.owner }</h2>
            `;
    document.getElementById("baraja").appendChild(newCard);
    })
}

let pickNPC = function() {

    let baraja = document.getElementById("baraja");
    baraja.innerHTML = "";

    pickCrono();

    data.npc.map(item => {
        let newCard = document.createElement('div');

        newCard.classList.add("card");
        newCard.classList.add("stacked");
        newCard.classList.add("card--npc");
        newCard.id = data.npc.indexOf(item);
        newCard.innerHTML =
            `
                <img src="img/npc/${ item.img }.jpg" class="card_img">
                <div class="card_content">
                    <h2 class="card_title">${ item.name }</h2> 
                    <p class="card_desc">${ item.desc }</p> 
                </div>
            `;
    document.getElementById("baraja").appendChild(newCard);
    })
}

let pickSession = function() {

    let baraja = document.getElementById("baraja");
    baraja.innerHTML = "";

    pickCrono();

    data.session.map(item => {
        let newCard = document.createElement('div');

        newCard.classList.add("card");
        newCard.classList.add("stacked");
        newCard.classList.add("card--sessions");
        newCard.id = data.session.indexOf(item);
        newCard.innerHTML =
            `
                <img src="img/sessions/${ item.img }.jpg" class="card_img">
                <div class="card_content">
                    <p class="card_desc">${ item.date }</p> 
                </div>
                <h2 class="session">${ item.count }</h2>
            `;
    document.getElementById("baraja").appendChild(newCard);
    })
}

