import { questDatabase } from './quests.js';

const npcListEl = document.getElementById('npc-list');
const questTitleEl = document.getElementById('quest-title');
const questInfoEl = document.getElementById('quest-info');
const sidebarEl = document.getElementById('sidebar');
const btnOpenMenu = document.getElementById('btn-open-menu');
const btnCloseMenu = document.getElementById('btn-close-menu');

function initUI() {
    // Ahora leemos npcKey (ej: "gaskell") y npcData (el objeto con npcName y quests)
    for (const [npcKey, npcData] of Object.entries(questDatabase)) {
        
        const li = document.createElement('li');
        li.className = 'npc-item';

        const nameDiv = document.createElement('div');
        nameDiv.className = 'npc-name';
        // Usamos el nombre formateado que definiste en el JSON
        nameDiv.textContent = npcData.npcName; 

        const qList = document.createElement('ul');
        qList.className = 'quest-list';

        // Iteramos sobre el array que está dentro de npcData.quests
        npcData.quests.forEach(quest => {
            const qItem = document.createElement('li');
            qItem.className = 'quest-item';
            qItem.textContent = quest.title;
            
            qItem.addEventListener('click', (e) => {
                e.stopPropagation(); 
                displayQuestDetails(quest);
                
                if (window.innerWidth <= 768) {
                    closeSidebar();
                }
            });
            
            qList.appendChild(qItem);
        });

        nameDiv.addEventListener('click', () => {
            const isCurrentlyActive = qList.classList.contains('active');
            document.querySelectorAll('.quest-list').forEach(el => el.classList.remove('active'));
            
            if (!isCurrentlyActive) {
                qList.classList.add('active');
            }
        });

        li.appendChild(nameDiv);
        li.appendChild(qList);
        npcListEl.appendChild(li);
    }
}

function displayQuestDetails(quest) {
    questTitleEl.textContent = quest.title;
    
    let htmlContent = `<p class="quest-description">${quest.desc}</p>`;
    
    if (quest.objectives && quest.objectives.length > 0) {
        htmlContent += `<div class="objectives-container">`;
        htmlContent += `<h3>Objetivos:</h3><ul>`;
        
        quest.objectives.forEach(obj => {
            const isCompleted = obj.current >= obj.required;
            const completionClass = isCompleted ? 'completed' : '';
            
            // Acepta "text" o "description" para evitar errores si mezclas nombres en el JSON
            const objectiveText = obj.text;

            let textElement = objectiveText;
            if (obj.url) {
                // target="_blank" abre en nueva pestaña
                // rel="noopener noreferrer" es una buena práctica de seguridad
                textElement = `<a href="${obj.url}" target="_blank" rel="noopener noreferrer" class="quest-link">${objectiveText}</a>`;
            }
            
            htmlContent += `
                <li class="objective-item ${completionClass}">
                    [${isCompleted ? 'X' : ' '}] ${textElement} (${obj.current}/${obj.required})
                </li>
            `;
        });
        
        htmlContent += `</ul></div>`;
    }
    
    questInfoEl.innerHTML = htmlContent;
}

function openSidebar() {
    sidebarEl.classList.add('open');
}

function closeSidebar() {
    sidebarEl.classList.remove('open');
}

btnOpenMenu.addEventListener('click', openSidebar);
btnCloseMenu.addEventListener('click', closeSidebar);

initUI();