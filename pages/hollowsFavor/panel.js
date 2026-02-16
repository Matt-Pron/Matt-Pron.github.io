export default class Panel {
	constructor(x = 0, y = 0, w = 4, h = 4) {
		this.set(x, y, w, h);
	}

	set(x, y, w, h) {
		this.x = Number(x);
		this.y = Number(y);
		this.w = Number(w);
		this.h = Number(h);
		this.xx = this.x + this.w;
		this.yy = this.y + this.h;
	}
}

