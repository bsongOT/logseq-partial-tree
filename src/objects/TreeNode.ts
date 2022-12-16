import { PageEntity } from "@logseq/libs/dist/LSPlugin.user";
import { classifyLink } from "../converter";
import { leader } from "../main";
import { Layer } from "./Layer";
import { TreeEdge } from "./TreeEdge";
import { TreeObject } from "./TreeObject";

export class TreeNode extends TreeObject{
    public get x(){
        return Number(this.element.dataset.x);
    }
    public set x(value){
        this.element.transform.baseVal.getItem(0).setTranslate(value, this.y);
        this.element.dataset.x = value.toString();
    }
    public get y(){
        return Number(this.element.dataset.y);
    }
    public set y(value){
        this.element.transform.baseVal.getItem(0).setTranslate(this.x, value);
        this.element.dataset.y = value.toString();
    }
    public readonly page:PageEntity;
    public children:TreeNode[];
    public edges:TreeEdge[];
    protected readonly element:SVGGElement;
    public get childCount():number{
        return this.child_count;
    }
    public set childCount(value){
        this.child_count = value;
        const countText = this.element.querySelector<HTMLElement>(".child-count")
        if (!countText) return;
        countText.textContent = `(${value})`;
    }
    private child_count:number = 0;

    public constructor(layer:Layer, x:number, y:number, page:PageEntity, childCount:number){
        super();
        this.page = page;
        this.element = layer.add("beforeend", this.toHTML()) as SVGGElement;
        [this.children, this.edges, this.childCount] = [[], [], childCount];
        [this.x, this.y] = [x, y];

        this.element.addEventListener("click", async (e) => {
            if (!leader.root) return;
            if (e.shiftKey) {
                logseq.App.pushState("page", { name: this.page.name });
            }
            else {
                if (leader.mode === "toggle"){
                    if (this.children.length <= 0) {
                        let crefs = await classifyLink(this.page, leader.linkDir);
                        await leader.insertChildren(this, crefs);
                        await leader.updatePos(leader.root);
                    }
                    else {
                        for (let child of this.children) {
                            child.remove();
                        }
                        for (let edge of this.edges){
                            edge.remove();
                        }
                        this.edges = [];
                        this.children = [];
                        await leader.updatePos(leader.root);
                    }
                }
                else if (leader.mode === "flag"){
                    this.element.classList.toggle("pass");
                }
            }
        });
        this.element.addEventListener("mouseenter", function(){
            if (leader.shiftkey)
                this.classList.add("hyperlink");
        });
        this.element.addEventListener("mouseleave", function(){
            this.classList.remove("hyperlink");
        });
    }

    public remove():void{
        this.children.forEach(a => a.remove());
        this.edges.forEach(a => a.remove());
        this.element.remove();
        this.children = [];
        this.edges = [];
    }

    protected toHTML(){
        return `
            <g class="node" data-x="0" data-y="0" transform="translate(0, 0)" stroke="black" stroke-dasharray="none">
                <rect x="0" y="-8" width="100" height="16" fill="white" stroke="black" stroke-width="1"></rect>
                <text x="2" y="0" dominant-baseline="middle" fill="black" stroke="none">${this.page.name}<tspan class="child-count">(0)</tspan></text>
            </g>
        `;
    }
}