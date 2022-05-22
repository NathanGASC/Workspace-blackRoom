/**
 * Return a Promise which will finish when the DOM is loaded
 */
export function onDOMReady():Promise<void>;
/**
 * Trigger callback when the DOM is ready
 * @param callback 
 */
export function onDOMReady(callback:()=>void):void;
export function onDOMReady(callback?:()=>void):void|Promise<void>{
    if(callback){
        const id = setInterval(()=>{
            if(document.readyState == "complete"){
                callback();
                clearInterval(id);
            }
        },100)
    }else{
        return new Promise((resolve,reject)=>{
            const id = setInterval(()=>{
                if(document.readyState == "complete"){
                    resolve();
                    clearInterval(id);
                }
            },100)
        })
    }
}

/**
 * Transform a string to HTML
 * @param htmlString html to transform
 * @returns an array of HTMLElement which are the equivalant of your string
 */
export function strToHtml(htmlString:string) {
    var div = document.createElement('div');
    div.innerHTML = htmlString.trim();
    return Array.from(div.children);
}