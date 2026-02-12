const bgm = new Audio('./hollowsFavorTheme8.ogg');

bgm.loop = true;
bgm.volume = 0.15;

export function startTheme() {
	bgm.play()
}
