const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();

gainNode.gain.value = 0.15;
gainNode.connect(audioContext.destination);

let themeBuffer;

async function loadTheme() {
    if (themeBuffer) return themeBuffer;
    try {
        const response = await fetch('./hollowsFavorTheme8.ogg');
        const arrayBuffer = await response.arrayBuffer();
        themeBuffer = await audioContext.decodeAudioData(arrayBuffer);
    } catch (e) {
        return null;
    }
}

export async function startTheme() {
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }

    const buffer = await loadTheme();

    if (buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        source.loop = true;

        source.connect(gainNode);
        source.start(0)
        return true;
    }
    return false;
}

