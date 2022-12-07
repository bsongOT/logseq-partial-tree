import { TreeObject } from "./TreeObject";

export class SettingPanel extends TreeObject{
    protected readonly element:HTMLDivElement;
    private readonly layerContainer:HTMLDivElement | null;
    
    public constructor(){
        super();
        this.element = document.querySelector<HTMLDivElement>("#setting") as HTMLDivElement;
        this.layerContainer = document.querySelector<HTMLDivElement>("#setting-visiblity");
    }

    public addAt(where:PanelPlace, html:string):HTMLElement|null{
        if (where === "layer-container"){
            this.layerContainer?.insertAdjacentHTML("beforeend", html);
            return this.layerContainer?.children[this.layerContainer.children.length - 1] as HTMLElement;
        }
        return null;
    }
    
    protected toHTML(): string {
        return `
        <div id="setting">
            <h2 id="setting-title">Settings</h2>
            <div id="setting-contents">
                Reload<br>
                <button>Load current page</button><br>
                <button>Reload new linked pages</button><br>
                Visiblity
                <ul id="setting-visiblity">
                </ul>
            </div>
        </div>`;
    }
}