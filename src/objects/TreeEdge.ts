import { nodeWidth } from "../main";
import { Layer } from "./Layer";
import { TreeNode } from "./TreeNode";
import { TreeObject } from "./TreeObject";

export class TreeEdge extends TreeObject{
    public readonly startNode:TreeNode;
    public readonly endNode:TreeNode;
    public readonly kind:layerKind;
    protected readonly element:SVGPathElement;
    public get path(){
        const pointStrs = this.element.getAttribute("d")?.replace("M", " ").replace("C"," ").split(" ").map(a => a.trim());
        if (!pointStrs) return;
        const pointNumsArr = [pointStrs[0].split(","), pointStrs[3].split(",")];
        const pointsArr = [
            {
                x: Number(pointNumsArr[0][0]),
                y: Number(pointNumsArr[0][1])
            },
            {
                x: Number(pointNumsArr[1][0]),
                y: Number(pointNumsArr[1][1])
            }
        ]
        return pointsArr;
    }
    public set path(value:{x: number, y: number}[]|undefined){
        if (!value) return;
        value[0].x += nodeWidth;

        let adjoint1 = `${(2 * value[0].x + value[1].x)/3},${value[0].y}`;
        let adjoint2 = `${(value[0].x + 2 * value[1].x)/3},${value[1].y}`;

        let pointsStr = `M${value[0].x},${value[0].y} C${adjoint1} ${adjoint2} ${value[1].x},${value[1].y}`;
        this.element.setAttribute("d", pointsStr);
    }

    public constructor(layer:Layer, start:TreeNode, end:TreeNode, kind:layerKind){
        super();
        [this.startNode, this.endNode, this.kind] = [start, end, kind];
        this.element = layer.add("afterbegin", this.toHTML()) as SVGPathElement;
    }

    public remove(){
        this.element.remove();
    }

    protected toHTML(): string{
        const start = {
            x: this.startNode.x + nodeWidth,
            y: this.startNode.y
        }
        const adjoint1 = {
            x: (2 * start.x + this.endNode.x)/3,
            y: this.startNode.y
        };
        const adjoint2 ={
            x: (start.x + 2 * this.endNode.x)/3,
            y: this.endNode.y
        };

        return `<path class="edge" d="M${start.x},${start.y}
                C${adjoint1.x},${adjoint1.y} ${adjoint2.x},${adjoint2.y} ${this.endNode.x},${this.endNode.y}"/>`;
    }
}