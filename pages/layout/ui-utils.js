export const FLOW = {
    HORIZONTAL: 0,
    VERTICAL: 1,
    // HORIZONTAL_BACKWARDS: 2,
    // VERTICAL_BACKWARDS: 3,
};

export const ALIGN = {
    HORIZONTAL: { LEFT: 0, CENTER: 1, RIGHT: 2 },
    VERTICAL: { TOP: 0, CENTER: 1, BOTTOM: 2 }
};

export const FIT = (params = {}) => ({
    type: 1,
    min: params.min ?? 0,
    max: params.max ?? Infinity
});

FIT.type = 1;
FIT.min = 0;
FIT.max = Infinity;

export const GROW = (params = {}) => ({
    type: 2,
    min: params.min ?? 0,
    max: params.max ?? Infinity
});

GROW.type = 2;
GROW.min = 0;
GROW.max = Infinity;

export const createPosition = (obj, x = 0, y = 0) => {
    obj.x = x;
    obj.y = y;
    obj.globalX = 0;
    obj.globalY = 0;
};

export const createSize = (obj, w = FIT, h = w) => {
    const parseDim = (val) => {
        if (typeof val === 'number') return { type: 0, min: val, max: val, base: val };
        if (val?.type === 1) return { type: 1, min: val.min ?? 0, max: val.max ?? Infinity, base: 0 };
        if (val?.type === 2) return { type: 2, min: val.min ?? 0, max: val.max ?? Infinity, base: 0 };
        return { type: 0, min: 0, max: Infinity, base: 0 };
    }
    const widthCfg = parseDim(w);
    const heightCfg = parseDim(h);

    obj.typeW = widthCfg.type;
    obj.minW = widthCfg.min;
    obj.maxW = widthCfg.max;
    obj.computedW = widthCfg.base;

    obj.typeH = heightCfg.type;
    obj.minH = heightCfg.min;
    obj.maxH = heightCfg.max;
    obj.computedH = heightCfg.base;

    obj.contentW = 0;
    obj.contentH = 0;
};

export const createBackground = (obj, bg = 0) => { obj.bgColor = bg };

export const createForeground = (obj, color = 1) => { obj.fgColor = color };

export const createFocusColors = (obj, bg = 0, fg = 1) => {
    obj.focusBgColor = bg;
    obj.focusFgColor = fg;
};

export const createAction = (obj, action = '') => {
    obj.action = action;
    obj.isInteractive = true;
};

export const createPadding = (obj, t = 0, l = t, b = t, r = l ) => {
    obj.padding = { t, l, b, r };
};

export const createMargin = (obj, t = 0, l = t, b = t, r = l ) => {
    obj.margin = { t, l, b, r };
};

export const createGap = (obj, gap = 0) => { obj.gap = gap };

export const createFlow = (obj, flow = FLOW.VERTICAL) => {
    obj.flow = flow;
};

export const createAlignment = (obj, h = ALIGN.HORIZONTAL.CENTER,
    v = ALIGN.VERTICAL.TOP) => {
        obj.alignment = { h, v };
};

export const createText = (obj, content = '') => {
    obj.content = content;
    obj.lines = [];
    obj.contentH = 0;
};

