import '@logseq/libs'
import { PageEntity } from '@logseq/libs/dist/LSPlugin.user';

const systemProps = ["title", "alias"];
const refBackQuery = (name:string) => `[
    :find (pull ?p [*])
    :where
    [?cp :block/name "${name}"]
    [?b :block/refs ?cp]
    [?b :block/page ?p]
    (not [?np :block/namespace ?cp]
        [?b :block/refs ?np])
]`
const refForwardQuery = (name:string) => `[
    :find (pull ?p [*])
    :where
    [?cp :block/name "${name}"]
    [?b :block/refs ?p]
    [?b :block/page ?cp]
    (not [?np :block/namespace ?p]
        [?b :block/refs ?np])
]`;
const nsBackQuery = (name:string) => `[
    :find (pull ?p [*])
    :where
    [?cp :block/name "${name}"]
    [?cp :block/namespace ?p]
]`
const nsForwardQuery = (name:string) => `[
    :find (pull ?p [*])
    :where
    [?cp :block/name "${name}"]
    [?p :block/namespace ?cp]
]`

export class PageRef {
    public readonly simpleRefPages:PageEntity[];
    public readonly nsPages:PageEntity[];
    public readonly propPages:Record<string, PageEntity[]>;

    constructor(simpleRefPages:PageEntity[], nsPages:PageEntity[], propPages:Record<string, PageEntity[]>){
        this.simpleRefPages = simpleRefPages;
        this.nsPages = nsPages;
        this.propPages = propPages;
    }

    toPagePairs(relations:layerKind[]):PagePair[]{
        const refPairs = this.simpleRefPages.map(p => new PagePair(["reference"], p, 1));
        const nsPairs = this.nsPages.map(p => new PagePair(["namespace"], p, 2));
        const propPairs = Object.keys(this.propPages).map((k) => {
            const layerNum = relations.findIndex(lk => lk[0] === "property" && lk[1] === k);
            return this.propPages[k].map(p => new PagePair(["property", k], p, layerNum))
        }).flat();

        return [...refPairs, ...nsPairs, ...propPairs];
    }
}

export class PagePair {
    public readonly kind:layerKind;
    public readonly page:PageEntity;
    public readonly id:number;

    constructor(kind: layerKind, page: PageEntity, id:number) {
        this.kind = kind;
        this.page = page;
        this.id = id;
    }
}

export async function classifyLink(page: PageEntity, isBacklink:boolean): Promise<PageRef> {
    // simple reference | property
    const refQuery = isBacklink ? refBackQuery : refForwardQuery;
    const nsQuery = isBacklink ? nsBackQuery : nsForwardQuery;

    let refPages: any[] = (await logseq.DB.datascriptQuery(refQuery(page?.name))).map((a: PageEntity[]) => a[0]);
    
    let onlyRefPages: PageEntity[] = [];
    let propPages: Record<string, PageEntity[]> = {};
    let namespacingPages: PageEntity[] = (await logseq.DB.datascriptQuery(nsQuery(page?.name))).map((a: PageEntity[]) => a[0]);

    let keys:string[]
    if (isBacklink){ 
        keys = [...new Set(
            refPages.map(
                p => p.properties ? Object.keys(p.properties) : ""
            ).filter(a => a !== "").flat()
        )].filter(a => !systemProps.includes(a));
    }
    else{
        keys = [...new Set((page as any).properties ? Object.keys((page as any).properties) : [])].filter(a => !systemProps.includes(a));
        refPages = refPages.filter(p => !keys.includes(p.name));
    }

    keys.forEach(k => propPages[k] = []);

    for (let i = 0; i < refPages?.length; i++) {
        let isProp: boolean = false;
        for (let j = 0; j < keys?.length; j++) {
            if (isBacklink){
                if (!(refPages[i].properties?.[keys[j]] instanceof Array)) continue;
                if (refPages[i].properties?.[keys[j]]?.some((a:string) => a.toLowerCase() === page?.name?.toLowerCase())) {
                    propPages[keys[j]].push(refPages[i] as PageEntity);
                    isProp = true;
                }
            }
            else {
                if (!((page as any).properties?.[keys[j]] instanceof Array)) continue;
                if ((page as any).properties?.[keys[j]]?.some((a:string) => a.toLowerCase() === refPages[i].name)){
                    propPages[keys[j]].push(refPages[i] as PageEntity);
                    isProp = true;
                }
            }
        }
        if (isProp) continue;
        onlyRefPages.push(refPages[i]);
    }

    return new PageRef(onlyRefPages,namespacingPages, propPages);
}