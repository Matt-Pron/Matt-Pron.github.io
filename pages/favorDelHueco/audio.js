const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioContext.createGain();
gainNode.connect(audioContext.destination);

gainNode.gain.value = 0.0;

let themeBuffer;
let themeSource;

async function loadTheme() {
    if (themeBuffer) return themeBuffer;
    const response = await fetch("./hollowsFavorTheme8.ogg");
    const arrayBuffer = await response.arrayBuffer();
    themeBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return themeBuffer;
}

export const AudioController = {
    async startTheme () {
        if (audioContext.state === "suspended") {
            await audioContext.resume();
        }

        const buffer = await loadTheme();

        if (buffer && !themeSource) {
            themeSource = audioContext.createBufferSource();
            themeSource.buffer = buffer;
            themeSource.loop = true;
            themeSource.connect(gainNode);
            themeSource.start(0);
        }
    },

    setVolume(percent) {
        const volume = Math.max(0, Math.min(100, percent * 0.75)) / 100;
        gainNode.gain.setTargetAtTime(volume, audioContext.currentTime, 0.01);
    },

    mute(isMuted) {
        gainNode.gain.setTargetAtTime(isMuted ? 0 : 0.15, audioContext.currentTime, 0.01);
    }
};

