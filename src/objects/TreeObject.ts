export abstract class TreeObject{
    protected readonly element:Element | undefined;
    public get visible(){
        if (!this.element) return false;
        return Number((this.element as HTMLElement).style.opacity) > 0 ;
    }
    public set visible(value){
        const el = this.element as HTMLElement;
        if (value) {
            el.style.opacity = "1";
            el.style.pointerEvents = "auto";
        }
        else {
            el.style.opacity = "0";
            el.style.pointerEvents = "none";
        }
    }
    protected abstract toHTML():string;
    public add(where:InsertPosition, html:string):Element|null|undefined{
        if (!this.element) return;
        this.element.insertAdjacentHTML(where, html);

        if (where === "afterbegin") return this.element.children[0];
        else if (where === "afterend") return this.element.nextElementSibling;
        else if (where === "beforebegin") return this.element.previousElementSibling;
        else return this.element.lastElementChild;
    }
}