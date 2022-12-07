import { init, leader } from "./main";
import { keydown, keyup } from "./shortkeyHandler";

export async function initDOM(){
    document.removeEventListener("keydown", keydown);
    document.removeEventListener("keyup", keyup);
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    let app = document.querySelector<HTMLElement>("#logseq-partial-tree-app");

    if (!app) return;

    app.innerHTML = "";
    app.insertAdjacentHTML("beforeend", `
        <div id="tool-box">
            <input id="toggle-mode" class="mouse-mode" type="radio" name="tool" checked>
            <label for="toggle-mode" class="mouse-mode-button selected">
                <i class="gg-list-tree"></i>
            </label>
            <input id="flag-mode" class="mouse-mode" type="radio" name="tool">
            <label for="flag-mode" class="mouse-mode-button">
                <i class='fa-solid fa-wand-magic-sparkles fa-lg'></i>
            </label>
        </div>
        <svg id="tree" viewBox="0 0 800 670">
            <mask id="textMask">
                <rect x="0" y="-8" width="100" height="16" fill="white"></rect>
            </mask>
        </svg>
        <div id="setting">
            <h1 id="setting-title">Settings</h1>
            <div id="setting-contents">
                <h3>Reload</h3>
                <ul id="setting-reload">
                    <li><button class="reload-button" id="logseq-reload">Load current logseq page</button><br></li>
                    <li><button class="reload-button" id="window-reload">Reload current window page</button><br></li>
                </ul>
                <h3>Visiblity</h3>
                <ul id="setting-visiblity">
                </ul>
            </div>
        </div>
    `);

    const mouseModes = document.querySelectorAll<HTMLInputElement>("#tool-box > .mouse-mode");  

    document.querySelector<HTMLButtonElement>("#logseq-reload")?.addEventListener("click", async function(){
        await init();
    })
    document.querySelector<HTMLButtonElement>("#window-reload")?.addEventListener("click", async function(){
        await init(leader.root?.page);
    })
    
    mouseModes[0].addEventListener("change", function(){
        leader.mode = "toggle";
    });
    mouseModes[1].addEventListener("change", function(){
        leader.mode = "flag";
    });
}
export async function initTrigger() {
    logseq.App.registerUIItem("toolbar", {
        key: "logseq-partial-tree",
        template: `
            <a class="button" data-on-click="openTree">
                <i class="gg-list-tree"></i>
            </a>
        `
    });
    logseq.provideStyle(`
        @import url('https://css.gg/list-tree.css');
        .gg-list-tree{
            transform: scale(0.8);
        }
    `);
    logseq.provideModel({
        openTree() {
            logseq.showMainUI();
        }
    });
}