import { threadId } from "worker_threads";
import { leader } from "../main";
import { SettingLayer } from "./SettingLayer";
import { SettingPanel } from "./SettingPanel";
import { SVG } from "./SVG";
import { TreeObject } from "./TreeObject";

export class Layer extends TreeObject{
    protected readonly element:SVGGElement;
    private readonly setting:SettingLayer;
    public get kind():layerKind|undefined{
        const name = this.element.dataset.name;
        if (name?.startsWith("property"))
            return ["property", name.slice(9)];
        else if (name === "reference" || name === "namespace")
            return [name];
    }
    private set kind(value){
        if (!value) return;
        this.element.dataset.name = value.join("-");
    }

    public get dash(){
        return this.element.style.strokeDasharray;
    }
    public set dash(value){
        this.element.style.strokeDasharray = value;
    }

    public get color(){
        return this.element.style.stroke;
    }
    public set color(value){
        this.element.style.stroke = value;
    }

    public constructor(svg:SVG, settingPanel:SettingPanel, kind:layerKind, color:string, dash:string = "none"){
        super();

        this.element = svg.add("beforeend", this.toHTML()) as SVGGElement;
        this.setting = new SettingLayer(settingPanel, kind, color);
        [this.kind, this.color, this.dash] = [kind, color, dash];

        leader.relations.push(kind);
    }
    public remove(){
        this.element.remove();
        this.setting.remove();
        leader.relations.splice(
            leader.relations.map(a => a.join("-")).indexOf((this.kind ?? [""]).join("-")),
            1
        )
    }
    protected toHTML(): string {
        return `<g class="layer"></g>`
    }
}