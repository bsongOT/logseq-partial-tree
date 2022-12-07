import { gap, nodeWidth } from "./main";

export function calcPos(x:number, y:number, index:number){
    return {
        x: x + gap + nodeWidth,
        y: y + 20 * index
    }
}