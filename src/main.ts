import '@logseq/libs';
import { PageEntity } from '@logseq/libs/dist/LSPlugin.user';
import { calcPos } from './calculator';
import { classifyLink, PageRef } from './converter';
import { initDOM, initTrigger } from './initter';
import { Layer } from './objects/Layer';
import { SettingPanel } from './objects/SettingPanel';
import { SVG } from './objects/SVG';
import { TreeEdge } from './objects/TreeEdge';
import { TreeNode } from './objects/TreeNode';
import { getRandomRGB } from './utills';

export const centerX = 10;
export const centerY = 30;
export const gap = 100;
export const nodeWidth = 100;
export let leader: Leader;

async function main() {
    await initTrigger();
    init();
}
export async function init(rootPage?:PageEntity){
    await initDOM();
    leader = new Leader(rootPage);
}

class Leader {
    public root?: TreeNode;
    public ignores: layerKind[] = [];
    public relations: layerKind[] = [];
    public layers: Layer[] = [];
    public readonly tree:SVG;
    public readonly settingPanel:SettingPanel;
    public mode:MouseMode;
    public shiftkey = false;
    private linkCheckbox:HTMLInputElement|null;
    public get linkDir(){
        return !this.linkCheckbox?.checked;
    }
    
    constructor(rootPage?:PageEntity) {
        this.mode = "toggle";

        this.tree = new SVG(document.querySelector<SVGSVGElement>("#tree"));
        this.settingPanel = new SettingPanel();
        this.linkCheckbox = document.querySelector<HTMLInputElement>("#link-dir");
        this.draw(rootPage);
    }

    public async draw(rootPage?: PageEntity) {
        if (!this.tree) return;
        
        let page = rootPage ?? await logseq.Editor.getCurrentPage() as PageEntity | null;
        if (!page) return;

        this.layers.push(new Layer(this.tree, this.settingPanel, ["property", ""], "#000000"));
        this.layers.push(new Layer(this.tree, this.settingPanel, ["reference"], "#87CEEB", "5 5"));
        this.layers.push(new Layer(this.tree, this.settingPanel, ["namespace"], "#000000", "3 3"));

        let crefs = await classifyLink(page, this.linkDir);
        let childCount = crefs.nsPages.length + crefs.simpleRefPages.length + Object.values(crefs.propPages).flat().length;

        this.root = new TreeNode(this.layers[0], centerX, centerY, page, childCount);

        await this.insertChildren(this.root, crefs);
        await this.updatePos(this.root);
    }

    public async insertChildren(parent: TreeNode, refs:PageRef) {
        if (!this.tree) return;

        this.insertNewLayers(refs);

        let refPairs = refs.toPagePairs(this.relations);

        for (let i = 0; i < refPairs?.length; i++) {
            let pos = { x:parent.x + gap + nodeWidth, y: parent.y };

            let node = new TreeNode(this.layers[refPairs[i].id], pos.x, pos.y, refPairs[i].page, 0);
            let edge = new TreeEdge(this.layers[refPairs[i].id], parent, node, refPairs[i].kind);
            
            parent.children.push(node);
            parent.edges.push(edge);
            classifyLink(refPairs[i].page, this.linkDir).then((crefs) => {
                node.childCount = crefs.nsPages.length + crefs.simpleRefPages.length + Object.values(crefs.propPages).flat().length;
            });
        }
    }

    public async updatePos(parent: TreeNode) {
        let wc = 0;
        for (let i = 0; i < parent?.children.length; i++) {
            let pos = calcPos(parent.x, parent.y, wc);

            parent.children[i].x = pos.x;
            parent.children[i].y = pos.y;
            parent.edges[i].path = 
            [
                { x: parent.x, y: parent.y },
                { x: pos.x, y: pos.y }
            ]
 
            const dwc = await this.updatePos(parent.children[i]);

            if (this.isInIgnores(parent.edges[i].kind)) continue;

            wc += dwc;
        }
        wc = wc < 1 ? 1 : wc;
        return wc;
    }

    public async updateVisible(parent: TreeNode, isVisible:boolean){
        if (isVisible){
            for (let i = 0; i < parent?.children.length; i++){
                parent.children[i].visible = !this.isInIgnores(parent.edges[i].kind);
                parent.edges[i].visible = parent.children[i].visible;
                this.updateVisible(parent.children[i], parent.children[i].visible);
            }
        }
        else{
            for (let i = 0; i < parent?.children.length; i++){
                parent.children[i].visible = false;
                parent.edges[i].visible = false;
                this.updateVisible(parent.children[i], false);
            }
        }
    }

    public isInIgnores(kind:layerKind) {
        return this.ignores.some(v => v.join("-") === kind.join("-"));
    }

    private insertNewLayers(refs:PageRef){
        let keys = Object.keys(refs.propPages).filter(k => this.relations.every(r => k !== r[1]));
        for (let i = 0; i < keys?.length; i++) {
            this.layers.push(new Layer(this.tree, this.settingPanel, ["property", keys[i]], getRandomRGB()));
        }
        console.log(keys);
    }
}

logseq.ready().then(main).catch(console.error);