const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();

gainNode.gain.value = 0.15;
gainNode.connect(audioContext.destination);

let themeBuffer;
let themeSource;

async function loadTheme() {
    if (themeBuffer) return themeBuffer;
    const response = await fetch('./hollowsFavorTheme8.ogg');
    const arrayBuffer = await response.arrayBuffer();
    themeBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return themeBuffer;
}

export async function startTheme() {
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    const buffer = await loadTheme();

    if (buffer && !themeSource && audioContext.state === 'running') {
        themeSource = audioContext.createBufferSource();
        themeSource.buffer = buffer;

        themeSource.loop = true;

        themeSource.connect(gainNode);
        themeSource.start(0)
        return true;
    }
    return audioContext.state === 'running';
}

