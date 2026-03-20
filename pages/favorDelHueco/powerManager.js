import { eventBus } from "./eventBus.js";
import { Globals } from "./globals.js";

export const PowerManager = {
    renderFps: Globals.fps,
    isIdle: false,
    isLowBattery: false,

    init() {
        this.setupBattery();
        this.setupIdleDetection();

        eventBus.on("FPS_CHANGED", () => {
            this.updateCaps();
        });
    },

    setupBattery() {
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const checkStatus = () => {
                    this.isLowBattery = battery.level < 0.2 && !battery.charging;
                    this.updateCaps();
                };
                battery.addEventListener('levelchange', checkStatus);
                battery.addEventListener('chargingchange', checkStatus);
                checkStatus();
            });
        }
    },

    setupIdleDetection() {
        let timeout;
        const reset = () => {
            if (this.isIdle) {
                this.isIdle = false;
                this.updateCaps();
            }
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.isIdle = true;
                this.updateCaps();
            }, 30000);
        };

        ['mousemove', 'keydown', 'touchstart', 'pointerdown'].forEach(e => 
        window.addEventListener(e, reset)
        );
        reset();
    },

    updateCaps() {
        if (this.isIdle) this.renderFps = 10;
        else if (this.isLowBattery) this.renderFps = 24;
        else this.renderFps = Globals.fps || 30;
    }
};

