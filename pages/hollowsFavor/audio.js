const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();

gainNode.gain.value = 0.15;
gainNode.connect(audioContext.destination);

let themeBuffer;

async function loadTheme() {
    try {
        const response = await fetch('./hollowsFavorTheme8.ogg');
        const arrayBuffer = await response.arrayBuffer();
        themeBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {}
}

export async function startTheme() {
    loadTheme();

    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    if (!themeBuffer) {
        await loadTheme();
    }

    if (themeBuffer) {
        const source = audioContext.createBufferSource();
        source.buffer = themeBuffer;

        source.loop = true;

        source.connect(gainNode);
        source.start(0)
        return true;
    }
    return false;
}

