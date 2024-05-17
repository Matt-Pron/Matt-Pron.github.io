"use strict";

let diccionario = {};

fetch("../js/diccionario.json")
    .then(function (diccio) {
        return diccio.json(); 
    })
    .then(function(data) {
        diccionario = data;
    });

let getDef = function(word) {
    document.getElementById("significante").innerHTML = word;
    document.getElementById("significado").innerHTML = diccionario[word];
    document.getElementById("dicc").className = "show";
}

let closeDef = function () {
    document.getElementById("dicc").className = document.getElementById("dicc").className.replace("show", "");
}

