import { TreeObject } from "./TreeObject";

export class SVG extends TreeObject{
    protected readonly element: SVGSVGElement;
    private dragStartPos = { x: 0, y: 0};
    private dragStartView = { x: 0, y: 0, w: 0, h: 0}
    private scale = 1;
    private isDragging = false;
    constructor(element: SVGSVGElement | null){
        super();
        this.element = element as SVGSVGElement;

        this.element.addEventListener("wheel", this.wheelCallBack);
        this.element.addEventListener("mousedown", this.dragStartCallBack);
        this.element.addEventListener("mousemove", this.dragCallBack);
        document.onmouseup = this.dragEndCallBack;
    }
    protected toHTML(): string {
        return "<svg></svg>";
    }
    private wheelCallBack = (e:WheelEvent) => {
        e.preventDefault();
        const viewBox = this.element.viewBox;
        const w = viewBox.baseVal.width;
        const h = viewBox.baseVal.height;
        const mx = e.offsetX;  
        const my = e.offsetY;    
        const dw = w * Math.sign(e.deltaY) * 0.05;
        const dh = h * Math.sign(e.deltaY) * 0.05;
        const dx = dw * mx / this.element.clientWidth;
        const dy = dh * my / this.element.clientHeight;
        const newView = {
            x: viewBox.baseVal.x + dx,
            y: viewBox.baseVal.y + dy,
            w: w - dw,
            h: h - dh
        };
        this.scale = this.element.clientWidth / w;
        this.element.setAttribute('viewBox', Object.values(newView).join(" "));
    };
    private dragStartCallBack = (e:MouseEvent) => {
        this.dragStartPos = {x:e.x,y:e.y};
        this.dragStartView = {
            x: this.element.viewBox.baseVal.x,
            y: this.element.viewBox.baseVal.y,
            w: this.element.viewBox.baseVal.width,
            h: this.element.viewBox.baseVal.height
        };
        this.isDragging = true;
    }
    private dragCallBack = (e:MouseEvent) => {
        if (!this.isDragging) return;
        const dx = (this.dragStartPos.x - e.x) / this.scale;
        const dy = (this.dragStartPos.y - e.y) / this.scale;
        const newView = { 
            x: this.dragStartView.x + dx, 
            y: this.dragStartView.y + dy,
            w: this.dragStartView.w,
            h: this.dragStartView.h
        };
        this.element.setAttribute('viewBox', Object.values(newView).join(" "));
    }
    private dragEndCallBack = (e:MouseEvent) => {
        this.dragCallBack(e);
        this.isDragging = false;
    }
}