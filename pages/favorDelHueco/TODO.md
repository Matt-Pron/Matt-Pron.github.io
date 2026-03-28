# TODO

- [ ] Ajustar stats base, sacar stats op de testing.
- [ ] Probar sistemas de combate como warhammer rol, dnd, d2, etc.
- [ ] Mejorar input. Normalizar acciones. Emitir eventos, los toma solo el viewport con focus.
        solucionar la doble direccion contraria (A D, W S)
- [x] menu principal
        mejorarlo: settings, quests, reset mas prolijo
- [ ] creacion de personaje
        bonus de razas, clases
- [ ] elegir recompensa al lvlUp
- [ ] ia solo para entities en chunks cercanos

- [ ] Bosses
        cada 5 niveles spawnea un unico boss
        muchisimo detection radius (te persigue casi que siempre)
        tiene lamp, char rgb
        da logro segun tipo
        stats muy fuertes, basados en el player level, varia segun tipo
- [ ] ticks usando c_energy
        mejor priority queue?
- [ ] ver logs antiguos con M
- [ ] guardar mapa en localStorage, factible de reset
        usar seeds
- [ ] achievements y recompensas en localStorage, factibles de reset
        marcar todo el terreno (tile 1) como explorado -> algun bonus de iluminacion?
- [ ] ataques de rango
- [ ] hechizos
        mage light from n level, duration, radius
- [ ] class bonuses
        explorador mas radio de luz

## DONE

- [x] agregar A* al pathfinding
- [x] permitir multiples logs
- [x] c_desires
- [x] pasar todos los buffer a 1D
- [x] capear spawn por nivel, weighting por level, pocos de nivel bajo, ninguno mas de N niveles por sobre el jugador
- [x] input para esperar / pasar turno
- [x] layout del mundo con stats y log
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

    wine ride chato d'ancon lorenadorca
