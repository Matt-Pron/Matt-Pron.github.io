# TODO

- [ ] Mejorar input. Normalizar acciones. Emitir eventos, los toma solo el viewport con focus.
- [ ] Modificar Renderer, armar array typeado buffer[y][x] de cells [char, fg, hasBg, bg, isBold, animationIdx]
- [ ] input para esperar / pasar turno
        con 'e' en teclado, falta celular
        hacer touchpad
- [ ] capear spawn por nivel, weighting por level, pocos de nivel bajo, ninguno mas de N niveles por sobre el jugador
- [ ] iluminacion
- [ ] paleta de colores blanco>amarillo>naranja>rojo>azul
- [ ] ticks usando c_energy
- [ ] permitir multiples logs
- [ ] c_desires
- [ ] agregar A* al pathfinding
- [ ] ver logs antiguos con M
- [ ] menu principal
        en proceso
- [ ] creacion de personaje
        en proceso
- [ ] elegir recompensa al lvlUp
- [ ] guardar mapa en localStorage, factible de reset
- [ ] achievements y recompensas en localStorage, factibles de reset
- [ ] ataques de rango

## DONE

- [x] colores por index, 0 to 15
- [x] game como class?
- [x] unificar resultados del combate
    cada attack devuelve quien ataca a quien, si falla o no, cuanto pega, si mata y cuanta exp da.
- [x] volver a dar experiencia
    ganas experiencia segun la loot table del monster.
- [x] optimizar draw.map entities.find in nested loop
renderiza los tiles y despues dibuja las entities con fondo negro.
- [x] crear object o class tile para mejorar variedad de char, color, collisions, etc.
- [x] aumentar stats simples en lvlUp
- [x] arreglar botones ui
    el problema eran las coordenadas al renderizar a mitad de resolucion.
