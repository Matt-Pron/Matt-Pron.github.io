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

export function isInPanel(p,x,y,font) {
    return (
        x >= p.x * font.x &&
        x <= p.xx * font.x &&
        y >= p.y * font.y &&
        y <= p.yy * font.y
    );
}

