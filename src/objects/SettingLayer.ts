import { leader } from "../main";
import { SettingPanel } from "./SettingPanel";
import { TreeObject } from "./TreeObject";

export class SettingLayer extends TreeObject{
    public readonly setting:SettingPanel;
    protected readonly element:HTMLDivElement;
    public readonly visibleToggle:HTMLCheckbox | null;
    public readonly colorSelector:HTMLColor | null;
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
        const layernameText = this.element.querySelector<HTMLDivElement>(".layer-name")
        if(layernameText) layernameText.innerText = value[1] ?? value[0];
    }
    public get color(){
        return this.colorSelector?.value;
    }
    public set color(value){
        if (!this.colorSelector || !value) return;
        this.colorSelector.value = value;
    }

    public constructor(setting:SettingPanel, kind:layerKind, color:string){
        super();

        this.element = setting.addAt("layer-container", this.toHTML()) as HTMLDivElement;
        this.visibleToggle = this.element.querySelector<HTMLCheckbox>(".visible-check");
        this.colorSelector = this.element.querySelector<HTMLColor>(".layer-color");

        [this.setting, this.kind, this.color] = [setting, kind, color];

        if (kind[0] === "property" && kind[1] === "") this.element.style.display = "none";

        if (!this.visibleToggle || !this.colorSelector) return;

        this.visibleToggle.addEventListener("change", () => {
            if (!this.visibleToggle || !this.colorSelector) return;
            if (!this.element.dataset?.name || !leader.root) return;
            if (this.visibleToggle.checked){
                leader.ignores.splice(leader.ignores.map(a => a.join("-")).indexOf(this.element.dataset.name), 1);
            }
            else {
                leader.ignores.push(this.kind as layerKind);
            }
            leader.updateVisible(leader.root, true);
            leader.updatePos(leader.root);
        });

        this.colorSelector.addEventListener("change", () => {
            if (!this.colorSelector) return;
            const targetLayer = leader.layers[Array.from(leader.layers).findIndex(l => l.kind?.join("-") === this.element.dataset.name)];
            targetLayer.color = this.colorSelector.value;
        });
    }
    public remove(){
        this.element.remove();
    }
    protected toHTML(): string {
        return `
        <li class="setting-layer">
            <input class="visible-check" type="checkbox" checked>
            <input class="layer-color" type="color">
            <div class="layer-name"></div>
        </li>`
    }
}