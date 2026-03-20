# TODO

- [ ] layout del mundo con stats y log
- [ ] Mejorar input. Normalizar acciones. Emitir eventos, los toma solo el viewport con focus.
        solucionar la doble direccion contraria (A D, W S)
- [ ] input para esperar / pasar turno
        con 'e' en teclado, falta celular
        hacer touchpad
- [ ] capear spawn por nivel, weighting por level, pocos de nivel bajo, ninguno mas de N niveles por sobre el jugador
        creo que esta hecho?
- [x] menu principal
        mejorarlo: settings, quests, reset mas prolijo
- [ ] creacion de personaje
        bonus de razas, clases

- [ ] Bosses
        cada 5 niveles spawnea un unico boss
        muchisimo detection radius (te persigue casi que siempre)
        tiene lamp, char rgb
        da logro segun tipo
        stats muy fuertes, basados en el player level, varia segun tipo
- [ ] agregar A* al pathfinding
- [ ] ticks usando c_energy
- [ ] permitir multiples logs
- [ ] c_desires
- [ ] ver logs antiguos con M
- [ ] elegir recompensa al lvlUp
- [ ] guardar mapa en localStorage, factible de reset
        usar seeds
- [ ] achievements y recompensas en localStorage, factibles de reset
        marcar todo el terreno (tile 1) como explorado -> algun bonus de iluminacion?
- [ ] ataques de rango
- [ ] pasar todos los buffer a 1D
- [ ] hechizos
        mage light from n level, duration, radius
- [ ] class bonuses
        explorador mas radio de luz

## DONE

- [x] paleta de colores blanco>amarillo>naranja>rojo>azul
- [x] iluminacion
- [x] Modificar Renderer, armar array typeado buffer[y][x] de cells [char, fg, hasBg, bg, isBold, animationIdx]
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
