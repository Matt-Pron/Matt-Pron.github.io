export const random = (min = 0, max = 100) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
}

