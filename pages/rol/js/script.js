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
            choosePlace();
            break;
        case 1:
            choosePC();
            break;
        case 2:
            chooseNPC();
            break;
        case 3:
            chooseSession();
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
            <img src="img/base/5.jpg" style="background-image:url('img/base/5-lr.jpg');" class="card_img">
            <div class="card_content">
                <h2 class="card_title">Volver</h2> 
            </div>
            `;
        baraja.appendChild(newCard);
        baraja.lastChild.addEventListener('click', barajar);
}

let barajar = function() {

    window.scrollTo(0,0);

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
            <img src="img/base/${ item.img }.jpg" style="background-image:url('img/base/${ item.img }-lr.jpg');" class="card_img">
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

let choosePlace = function() {

    window.scrollTo(0,0);

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
            <img src="img/places/${ item.img }.jpg" style="background-image:url('img/places/${ item.img }-lr.jpg');" class="card_img">
            <div class="card_content">
                <h2 class="card_title">${ item.name }</h2> 
                <p class="card_desc">${ item.desc }</p> 
            </div>
            `;
        document.getElementById("baraja").appendChild(newCard);
        baraja.lastChild.addEventListener('click', setArg, false);
        baraja.lastChild.myArg = data.place.indexOf(item);
        function setArg(e) {
            pickPlace(e.currentTarget.myArg);
        };
    })
}

let choosePC = function() {

    window.scrollTo(0,0);

    let baraja = document.getElementById("baraja");
    baraja.innerHTML = "";

    pickCrono();

    data.pc.map(item => {
        let newCard = document.createElement('div');

        newCard.classList.add("card");
        newCard.classList.add("stacked");
        newCard.classList.add("card--pc");
        newCard.id = data.pc.indexOf(item);

        //// ACOMODAR 'ELSE' CUANDO ESTE ACTUALIZADO EL JSON ////

        let descBreve;
        if (item.clase != undefined && item.raza != undefined) {
            descBreve = item.raza + ' ' + item.clase;
        } else {
            descBreve = item.desc;
        }
        
        newCard.innerHTML =
            `
                <img src="img/pc/${ item.img }.jpg" style="background-image:url('img/pc/${ item.img }-lr.jpg');" class="card_img">
                <div class="card_content">
                    <h2 class="card_title">${ item.name }</h2> 
                    <p class="card_desc">${ descBreve }</p> 
                </div>
                <h2 class="owned">${ item.owner }</h2>
            `;
    document.getElementById("baraja").appendChild(newCard);
        baraja.lastChild.addEventListener('click', setArg, false);
        baraja.lastChild.myArg = data.pc.indexOf(item);
        function setArg(e) {
            pickPC(e.currentTarget.myArg);
        };
    })
}

let chooseNPC = function() {

    window.scrollTo(0,0);

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
                <img src="img/npc/${ item.img }.jpg" style="background-image:url('img/npc/${ item.img }-lr.jpg');" class="card_img">
                <div class="card_content">
                    <h2 class="card_title">${ item.name }</h2> 
                    <p class="card_desc">${ item.desc }</p> 
                </div>
            `;
    document.getElementById("baraja").appendChild(newCard);
        baraja.lastChild.addEventListener('click', setArg, false);
        baraja.lastChild.myArg = data.npc.indexOf(item);
        function setArg(e) {
            pickNPC(e.currentTarget.myArg);
        };
    })
}

let chooseSession = function() {

    window.scrollTo(0,0);

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
                <img src="img/sessions/${ item.img }.jpg" style="background-image:url('img/sessions/${ item.img }-lr.jpg');" class="card_img">
                <div class="card_content">
                    <p class="card_desc">${ item.date }</p> 
                </div>
                <h2 class="session">${ item.count }</h2>
            `;
    document.getElementById("baraja").appendChild(newCard);
        baraja.lastChild.addEventListener('click', setArg, false);
        baraja.lastChild.myArg = data.session.indexOf(item);
        function setArg(e) {
            pickSession(e.currentTarget.myArg);
        };
    })
}

let limpiar = function () {
    let info = document.getElementById('top');
    if (document.getElementById('info__name')) {
    info.removeChild(document.getElementById('info__name'));
    };
    if (document.getElementById('portrait')) {
    info.removeChild(document.getElementById('portrait'));
    };
    if (document.getElementById('info__desc')) {
    info.removeChild(document.getElementById('info__desc'));
    };
    if (document.getElementById('full')) {
    info.removeChild(document.getElementById('full'));
    };
    if (document.getElementById('left')) {
    info.removeChild(document.getElementById('left'));
    };
    if (document.getElementById('right')) {
    info.removeChild(document.getElementById('right'));
    };
    if (document.getElementById('side-left')) {
    info.removeChild(document.getElementById('side-left'));
    };
    if (document.getElementById('side-right')) {
    info.removeChild(document.getElementById('side-right'));
    };
}

let pickPC = function(id) {
    limpiar();

    let seccion = document.createElement('h1');
    seccion.id = 'info__name';
    seccion.innerHTML = data.pc[id].name;
    document.getElementById('top').appendChild(seccion);


    seccion = document.createElement('div');
    seccion.id = 'portrait';
    document.getElementById('top').appendChild(seccion);

    let portrait = document.getElementById('portrait');
    portrait.innerHTML =
        `
        <img src="img/pc/${data.pc[id].img}.jpg" style="background-image: url('img/pc/${data.pc[id].img}-lr.jpg')" class="info__img"> 
        `;

    if (data.pc[id].stats != undefined) {
        let stats = document.createElement('div');
        stats.classList.add('info__stats');
        data.pc[id].stats.map(e => {
            let stat = document.createElement('div');
            stat.id = e.name;
            stat.innerHTML =
                `
                <p class="info__stat__modifier">${e.mod}</p>
                <p class="info__stat__tag">${e.name}</p>
                <p class="info__stat__value">${e.value}</p>
                `;
            stats.appendChild(stat);
        });
        portrait.appendChild(stats);
    }

    seccion = document.createElement('div');
    seccion.id = 'info__desc';
    document.getElementById('top').appendChild(seccion);

    let desc = document.getElementById('info__desc');

    if (data.pc[id].owner != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.classList.add('full');
        e.innerHTML =
            `
            Jugador: <span>${data.pc[id].owner}</span>
            `;
        desc.appendChild(e);
    }

    if (data.pc[id].clase != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.innerHTML =
            `
            Clase: <span>${data.pc[id].clase}</span>
            `;
        desc.appendChild(e);
    }

    if (data.pc[id].raza != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.innerHTML =
            `
            Raza: <span>${data.pc[id].raza}</span>
            `;
        desc.appendChild(e);
    }

    if (data.pc[id].alin != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.innerHTML =
            `
            Alineamiento: <span>${data.pc[id].alin}</span>
            `;
        desc.appendChild(e);
    }

    if (data.pc[id].fullDesc != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.classList.add('full');
        e.innerHTML = 'Descripción';
        desc.appendChild(e);
        e = document.createElement('p');
        e.innerHTML = data.pc[id].fullDesc;
        desc.appendChild(e);
    }

    if (data.pc[id].hp != undefined) {
        let e = document.createElement('div');
        e.classList.add('vida');
        e.classList.add('full');
        e.style.setProperty('--vida', data.pc[id].hp);
        e.innerHTML =
            `
            <p>HP: </p><div class="hp"></div>
            `;
        desc.appendChild(e);
    }

    seccion = document.createElement('div');
    seccion.id = 'left';
    document.getElementById('top').appendChild(seccion);

    if (data.pc[id].hist != undefined) {
    document.getElementById('left').innerHTML = 
            `
            <h2 class="info__title">Historia</h2>
            <p>${data.pc[id].hist}</p>
            `;
    }

    if (data.pc[id].vyd != undefined) {
        document.getElementById('left').insertAdjacentHTML('beforeend',
            `
            <h2 class="info__title">Virtudes y Defectos</h2>
            `);
        let vyd = document.createElement('ul');
        vyd.id = "vyd";
        data.pc[id].vyd.map(e => {
            let vod = document.createElement('li');
            vod.innerHTML = '<p>֎  ' + e + '</p>';
            vyd.appendChild(vod);
        });
        document.getElementById('left').appendChild(vyd);
    }

    seccion = document.createElement('div');
    seccion.id = 'side-right';
    document.getElementById('top').appendChild(seccion);

    if (data.pc[id].skills != undefined) {
        let skills = document.createElement('div');
        skills.classList.add("skills");
        skills.innerHTML = 
            `
            <h2 class="info__title">Habilidades</h2> 
            `;

        data.pc[id].skills.map(e => {
            let skill = document.createElement('div');
            skill.classList.add("skill");
            skill.innerHTML =
                `
                <p class="name">${e.name}</p><p>${e.value}</p> 
                `;
            skills.appendChild(skill);
        });
        document.getElementById('side-right').appendChild(skills);
    }

    document.getElementById('more').classList.remove('hide');
}

let pickNPC = function(id) {
    limpiar();

    let seccion = document.createElement('h1');
    seccion.id = 'info__name';
    seccion.innerHTML = data.npc[id].name;
    document.getElementById('top').appendChild(seccion);


    seccion = document.createElement('div');
    seccion.id = 'portrait';
    document.getElementById('top').appendChild(seccion);

    let portrait = document.getElementById('portrait');
    portrait.innerHTML =
        `
        <img src="img/npc/${data.npc[id].img}.jpg" style="background-image: url('img/npc/${data.npc[id].img}-lr.jpg')" class="info__img"> 
        `;

    seccion = document.createElement('div');
    seccion.id = 'info__desc';
    document.getElementById('top').appendChild(seccion);

    let desc = document.getElementById('info__desc');

    if (data.npc[id].clase != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.innerHTML =
            `
            Clase: <span>${data.npc[id].clase}</span>
            `;
        desc.appendChild(e);
    }

    if (data.npc[id].raza != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.innerHTML =
            `
            Raza: <span>${data.npc[id].raza}</span>
            `;
        desc.appendChild(e);
    }

    if (data.npc[id].fullDesc != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.classList.add('full');
        e.innerHTML = 'Descripción';
        desc.appendChild(e);
        e = document.createElement('p');
        e.innerHTML = data.npc[id].fullDesc;
        desc.appendChild(e);
    }

    if (data.npc[id].hp != undefined) {
        let e = document.createElement('div');
        e.classList.add('vida');
        e.classList.add('full');
        e.style.setProperty('--vida', data.npc[id].hp);
        e.innerHTML =
            `
            <p>HP: </p><div class="hp"></div>
            `;
        desc.appendChild(e);
    }

    seccion = document.createElement('div');
    seccion.id = 'right';
    document.getElementById('top').appendChild(seccion);

    if (data.npc[id].hist != undefined) {
    document.getElementById('right').innerHTML = 
            `
            <h2 class="info__title">Info</h2>
            <p>${data.npc[id].hist}</p>
            `;
    }

    if (data.npc[id].vyd != undefined) {
        seccion = document.createElement('div');
        seccion.id = 'side-left';
        document.getElementById('top').appendChild(seccion);
        document.getElementById('side-left').innerHTML =
            `
            <h2 class="info__title">Virtudes y Defectos</h2>
            `;
        let vyd = document.createElement('ul');
        vyd.id = "vyd";
        data.npc[id].vyd.map(e => {
            let vod = document.createElement('li');
            vod.innerHTML = '<p>֎  ' + e + '</p>';
            vyd.appendChild(vod);
        });
        document.getElementById('side-left').appendChild(vyd);
    }

    document.getElementById('more').classList.remove('hide');
}

let pickPlace = function(id) {
    limpiar();

    let seccion = document.createElement('h1');
    seccion.id = 'info__name';
    seccion.innerHTML = data.place[id].name;
    document.getElementById('top').appendChild(seccion);


    seccion = document.createElement('div');
    seccion.id = 'portrait';
    document.getElementById('top').appendChild(seccion);

    let portrait = document.getElementById('portrait');
    portrait.innerHTML =
        `
        <img src="img/places/${data.place[id].img}.jpg" style="background-image: url('img/places/${data.place[id].img}-lr.jpg')" class="info__img"> 
        `;

    seccion = document.createElement('div');
    seccion.id = 'info__desc';
    document.getElementById('top').appendChild(seccion);

    let desc = document.getElementById('info__desc');

    if (data.place[id].desc != undefined) {
        let e = document.createElement('p');
        e.innerHTML = data.place[id].desc;
        desc.appendChild(e);
    }

    seccion = document.createElement('div');
    seccion.id = 'full';
    document.getElementById('top').appendChild(seccion);

    if (data.place[id].fullDesc != undefined) {
    document.getElementById('full').innerHTML = 
            `
            <h2 class="info__title">Descripción</h2>
            <p>${data.place[id].fullDesc}</p>
            `;
    }

    document.getElementById('more').classList.remove('hide');
}

let pickSession = function(id) {
    limpiar();

    let seccion = document.createElement('h1');
    seccion.id = 'info__name';

    if (data.session[id].count != undefined) {
        seccion.innerHTML = data.session[id].count;
        document.getElementById('top').appendChild(seccion);
    } else if (data.session[id].name != undefined) {
        seccion.innerHTML = data.session[id].name;
        document.getElementById('top').appendChild(seccion);
    }

    seccion = document.createElement('div');
    seccion.id = 'portrait';
    document.getElementById('top').appendChild(seccion);

    let portrait = document.getElementById('portrait');
    portrait.innerHTML =
        `
        <img src="img/sessions/${data.session[id].img}.jpg" style="background-image: url('img/sessions/${data.session[id].img}-lr.jpg')" class="info__img"> 
        `;

    seccion = document.createElement('div');
    seccion.id = 'info__desc';
    document.getElementById('top').appendChild(seccion);

    let desc = document.getElementById('info__desc');

    if (data.session[id].date != undefined) {
        let e = document.createElement('h2');
        e.classList.add('info__title');
        e.classList.add('full');
        e.innerHTML = 'Fecha';
        desc.appendChild(e);
        e = document.createElement('p');
        e.innerHTML = data.session[id].date;
        desc.appendChild(e);
    }

    seccion = document.createElement('div');
    seccion.id = 'full';
    document.getElementById('top').appendChild(seccion);

    if (data.session[id].info != undefined) {
    document.getElementById('full').innerHTML = 
            `
            <h2 class="info__title">Resumen</h2>
            <p>${data.session[id].info}</p>
            `;
    }

    document.getElementById('more').classList.remove('hide');
}

let closeinfo = function () {
    document.getElementById("more").classList.add("hide");
}

