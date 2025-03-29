"use strict";

let data = {};
let activeTags = [];
let filtro = [];
let enlacesFiltrados = [];

fetch("js/data.json")
    .then(function (file) {
        return file.json();
    })  
    .then(function (_data) {
        data = _data;
        cargarTags();
        cargarLinks();
        filtrar("fijado");
    });

let cargarTags = function(){
    let listaTags = document.getElementById("listaTags");

    data.tags.sort();
    data.tags.splice(data.tags.indexOf("fijado"), 1);
    data.tags.splice(0, 0, "fijado");

    data.tags.map(i => {
        let tag = document.createElement('div');

        tag.innerHTML = 
            `<div class="tag" id="${ i }">${ i }</div>`;
        listaTags.appendChild(tag);
        listaTags.lastChild.addEventListener('click', setArg, false);
        listaTags.lastChild.myArg = i;
        function setArg(e) {
            filtrar(e.currentTarget.myArg);
        };
    })
}

let cargarLinks = function(){
    let lista = document.getElementById("lista");

    data.links.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1);

    data.links.map(i => {
        i.id = data.links.indexOf(i);
        let link = document.createElement('a');

        link.classList.add("enlace");
        link.id = i.id;
        link.href = i.link;
        link.target = "_blank";
        link.innerHTML = i.name;
        lista.appendChild(link);
    })
    enlacesFiltrados = document.querySelectorAll(".enlace");
}

let comprobar = function(link){
    let cumple = false;
    activeTags.forEach(i => {
        if (link.tags.includes(i)){
            cumple = true;
        };
    });
    return cumple;
}

let filtrar = function(tag) {

    if (activeTags.includes(tag)){
        activeTags.splice(activeTags.indexOf(tag), 1);
        document.getElementById(tag).classList.remove("activo");
    } else {
        activeTags.splice(0, 0, tag);
        document.getElementById(tag).classList.add("activo");
    };

    data.links.map(i => {
        if (comprobar(i)) {
            if (!filtro.includes(i)){
                filtro.splice(0, 0, i);
            }
        } else {
            if (filtro.includes(i)){
                filtro.splice(filtro.indexOf(i), 1);
            };
        }

    let lista = document.getElementById("lista");

    });

    enlacesFiltrados.forEach(i => {
        i.classList.add("hidden")
    })
    enlacesFiltrados.forEach(i => {
        filtro.forEach(b => {
            if (b.id == i.id){
                i.classList.remove("hidden");
            }
        })
    })
        
}

