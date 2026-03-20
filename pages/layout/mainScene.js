import { UIElement } from "./ui-elements.js";
import { ALIGN, FIT, FLOW, GROW } from "./ui-utils.js";

export class MainScene extends UIElement {
    constructor() {
        super();
        this.setBackground('#ffe').setPadding(3, 0).setGap(1)
            .setFlow(FLOW.VERTICAL)
            .setAlignment(ALIGN.HORIZONTAL.CENTER)
            .add(new UIElement('Title').setBackground('#123').setColor('#ffe')
                .setContent("Hollow's Favor"))
            .add(new UIElement('TextBox').setSize(8, GROW)
                .setBackground('#b22')
                .setColor('#111')
                .setContent('Los pajaritos cantan, la vieja está en la cueva.'))
            .add(new UIElement('Slot3').setBackground('#666')
                .setContent('Salir'))
    }
}
