const list = [
    "cucufato", 
    "gazmoño", 
    "beato", 
    "santurrón",
    "mojigato",
    "buen hombre",
    "puritano",
    "meapilas",
    "chupacirios",
    "tragasantos",
    "pechoño",
    "bonachón",
    "bienhechor",
    "macanudo",
];

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("greeting").innerHTML = list[Math.floor(Math.random() * list.length)]
});

