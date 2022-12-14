import { leader } from "./main";

export const keydown = (e:KeyboardEvent) =>{
    if (e.code.toLowerCase().includes("shift")){
        leader.shiftkey = true;
    }
    else if (e.code === "Digit1"){
        document.querySelector<HTMLElement>("#toggle-mode")?.click();
    }
    else if (e.code === "Digit2"){
        document.querySelector<HTMLElement>("#flag-mode")?.click();
    }
    else if (e.code === "Escape"){
        logseq.hideMainUI();
    }
}

export const keyup = (e:KeyboardEvent) => {
    if (e.code.toLowerCase().includes("shift")){
        leader.shiftkey = false;
    }
}