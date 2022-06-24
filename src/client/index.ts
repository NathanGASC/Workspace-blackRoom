import { createLogger } from "@nathangasc/fox_logger";
import { I18N } from "@nathangasc/i18n"
import logConfig from "./logger.json";
import { onDOMReady, strToHtml } from "./helpers/DOM";
import { Comment, Film, Reservation, Seance, User } from "@prisma/client";
import { Api } from "./api";

export const logger = createLogger(logConfig);
const i18n = new I18N({
    "config": {
        "debug": true,
        "default": "fr"
    },
    "langs": {
        "fr": {
            "config": {
                "abreviation": "fr",
                "dir": "ltr",
                "label": "Français"
            },
            "dictionary": {
                "BLACK_ROOM": "BLACK ROOM"
            }
        },
        "en": {
            "config": {
                "abreviation": "en",
                "dir": "ltr",
                "label": "English"
            },
            "dictionary": {
                "BLACK_ROOM": "BLACK ROOM"
            }
        }
    }
});

const api = new Api();
let gUser: undefined|User = undefined;
let gCreationForm: HTMLFormElement|undefined = undefined;

(async () => {
    await onDOMReady()
    i18n.currentLang = i18n.langs.en;

    const filmPage = document.querySelector("[data-page=film]") as HTMLElement
    const boxes = document.querySelectorAll(".box") as NodeListOf<HTMLImageElement>;
    let flag = false;
    document.addEventListener("click", (ev) => {
        if (Array.from(boxes).includes(ev.target as HTMLImageElement) || filmPage.contains(ev.target as HTMLElement)) {
            flag = true;
        }
        if (flag) {
            FilmPage.displayFilmPage();
            if((ev.target as HTMLElement).dataset.film) FilmPage.loadFilm(JSON.parse((ev.target as HTMLElement).dataset.film!));
            flag = false;
        } else {
            FilmPage.hideFilmPage();
            document.querySelector("video")!.style.display = "none";
        }
    })

    const pages = document.querySelectorAll(".page");
    pages?.forEach((page) => {
        page.addEventListener("click", () => {
            const num = page.textContent!;
            FilmsPage.loadFilms(parseInt(num));
        })
    })

    FilmsPage.loadFilms(1);

    const btnConnect1 = document.querySelector("#btnConnect");
    btnConnect1?.addEventListener("click",()=>{
        Login.displayLogin();
    })

    const btnConnect2 = document.querySelector("[data-page='login'] #btnConnect");
    btnConnect2?.addEventListener("click", async ()=>{
        const inputLogin = document.querySelector("[data-page=login] #inputLogin") as HTMLInputElement;
        const inputPassword = document.querySelector("[data-page=login] #inputPassword") as HTMLInputElement;
        const user = await api.user.login(inputLogin.value, inputPassword.value);
        if(user.data.length == 0){
            //fail
        }else{
            Login.hideLogin();
            onLogin(user);
        }
    })

    const btnBackLogin = document.querySelector("[data-page='login'] .back");
    btnBackLogin?.addEventListener("click", ()=>{
        Login.hideLogin();
    })

    const btnRegister1 = document.querySelector("#btnInscription");
    btnRegister1?.addEventListener("click",()=>{
        Register.displayRegister();
    })

    const btnRegister2 = document.querySelector("[data-page='register'] #btnInscription");
    btnRegister2?.addEventListener("click", ()=>{
        api.user.post({
            email: (document.querySelector("[data-page=register] #email") as HTMLInputElement).value,
            login: (document.querySelector("[data-page=register] #identifiant") as HTMLInputElement).value,
            password: (document.querySelector("[data-page=register] #password") as HTMLInputElement).value,
            birthday: "06/23/1998"
        })
        Register.hideRegister();
    })

    const btnBackRegister = document.querySelector("[data-page='register'] .back");
    btnBackRegister?.addEventListener("click", ()=>{
        Register.hideRegister();
    })

    const btnDeconnexion = document.querySelector("#btnDeconnexion");
    btnDeconnexion?.addEventListener("click",()=>{
        onDisconnect();
    })

    const btnMyPage = document.querySelector("#btnMyPage");
    btnMyPage?.addEventListener("click", ()=>{
        MyPage.display();
    })

    const btnCreateAccount = document.querySelector("#btnCreateAccount");
    btnCreateAccount?.addEventListener("click", ()=>{
        Login.hideLogin();
        Register.displayRegister()
    })

    const btnGoToLogin = document.querySelector("#btnGoToLogin");
    btnGoToLogin?.addEventListener("click", ()=>{
        Login.displayLogin();
        Register.hideRegister()
    })

    const btnGoHome = document.querySelector("nav img");
    btnGoHome?.addEventListener("click", (ev)=>{
        FilmsPage.unloadFilms();
        FilmsPage.loadFilms(0)
    })

    const btnFilterByDefault = document.querySelector("#filter #byDefault");
    btnFilterByDefault?.addEventListener("click",()=>{
        FilmsPage.unloadFilms();
        FilmsPage.loadFilms(0)
    })

    const btnFilterByFav = document.querySelector("#filter #byFav");
    btnFilterByFav?.addEventListener("click",()=>{
        FilmsPage.unloadFilms();
        FilmsPage.loadFilms(0, "byFav")
    })
    
    const btnFilterByTitle = document.querySelector("#filter #byTitle");
    btnFilterByTitle?.addEventListener("click",()=>{
        FilmsPage.unloadFilms();
        FilmsPage.loadFilms(0, "byName")
    })

    const btnWatch = document.querySelector("#btnWatch");
    btnWatch?.addEventListener("click", ()=>{
        const video = document.querySelector("video");
        video!.style.display = "block";
    })

    document.addEventListener('contextmenu', async function(e) {
        if(gUser?.id != 1) return;
        console.log(e.target)
        if((e.target as HTMLElement).dataset.film){
            e.preventDefault();
            const film:Film = JSON.parse((e.target as HTMLElement).dataset.film!);
            const doIt = confirm("Voulez-vous supprimer le film " + film.titre)
            if(doIt){
                const favs = (await api.fav.get()).data.filter(fav => {return fav.filmId == film.id});
                favs.forEach((fav)=>{
                    api.fav.delete(fav.id);
                })
                api.film.delete(film.id)
            }
        }else
        if((e.target as HTMLElement).dataset.comment){
            e.preventDefault();
            const comment:Comment = JSON.parse((e.target as HTMLElement).dataset.comment!);
            const doIt = confirm("Voulez-vous supprimer le commentaire: " + comment.text)
            if(doIt){
                api.comment.delete(comment.id);
            }
        }else
        if((e.target as HTMLElement).dataset.seance){
            e.preventDefault();
            const seance:Seance = JSON.parse((e.target as HTMLElement).dataset.seance!);
            const doIt = confirm("Voulez-vous supprimer la séance du : " + seance.date)
            if(doIt){
                api.seance.delete(seance.id);
            }
        }
    });

    const btnCreate = document.querySelector("#btnCreate");
    btnCreate?.addEventListener("click", async ()=>{
        let entities:string = "";

        for (const key in api) {
            entities += "-" + key + "\n";
        }
        const entity = window.prompt("Entrez le nom de l'entité à créer : [\n" + entities + "]","film");
        const obj = (await (api[entity as keyof typeof api].get())).data[0]

        gCreationForm?.remove();
        gCreationForm = displayForm(obj, entity!)
    })
})();

class FilmsPage {
    public static async loadFilms(page: number, filter: string = "byDefault") {
        await FilmsPage.unloadFilms();
        page--;
        const boxes = document.querySelectorAll(".box") as NodeListOf<HTMLImageElement>;

        const json = await api.film.get(undefined, page);
        const films = json.data;
        const finalFilms:{film:Film,fav:number}[] = []

        const favs = (await api.fav.get()).data;
        for await (const film of films) {
            const favFilm = favs.filter((fav)=>{return fav.filmId == film.id})
            const nbFav = favFilm.length;
            finalFilms.push({film: film, fav:nbFav})
        }

        finalFilms.sort((a,b)=>{
            switch (filter) {
                case "byDefault":
                    return b.fav - a.fav
                    break;
                case "byFav":
                    return b.fav - a.fav
                    break
                case "byName":
                    return a.film.titre.localeCompare(b.film.titre)
                    break
                default:
                    return 0
                    break;
            }
        })

        finalFilms.forEach(async (film: {film:Film, fav:number}, index: number) => {
            const picture = film.film.picture;
            const formatedPicture = "data:image/png;base64," + picture;
            if(boxes[index]) boxes[index].src = formatedPicture;

            if(boxes[index]) boxes[index].dataset.film = JSON.stringify(film.film);
        });
    }

    public static async unloadFilms() {
        const boxes = document.querySelectorAll(".box") as NodeListOf<HTMLImageElement>;
        boxes.forEach((box) => {
            const formatedPicture = "/assets/logo.png";
            box.src = formatedPicture;
        });
    }

    public static async loadMyList(user:User){
        await FilmsPage.unloadFilms();
        const boxes = document.querySelectorAll(".box") as NodeListOf<HTMLImageElement>;

        let favs = (await api.fav.get()).data;
        favs = favs.filter((fav)=>{
            return fav.userId == gUser?.id
        })

        const films:Film[] = [];
        for await (const fav of favs) {
            const json = await api.film.get(fav.filmId, undefined);
            films.push(json.data[0])
        }

        films.forEach((film: Film, index: number) => {
            const picture = film.picture;
            const formatedPicture = "data:image/png;base64," + picture;
            if(boxes[index]) boxes[index].src = formatedPicture;

            if(boxes[index]) boxes[index].dataset.film = JSON.stringify(film);
        });
    }
}

class FilmPage{
    public static displayFilmPage(){
        const login = document.querySelector("[data-page='film']") as HTMLElement;
        login.style.display = "flex";
    }

    public static hideFilmPage(){
        const login = document.querySelector("[data-page='film']") as HTMLElement;
        login.style.display = "none";
    }

    public static async loadFilm(film:Film){
        const filmPage = document.querySelector("[data-page=film]");
        const img = filmPage?.querySelector("img") as HTMLImageElement;

        const picture = film.picture;
        const formatedPicture = "data:image/png;base64," + picture;
        img.src = formatedPicture;

        const title = document.querySelector("#title");
        title!.textContent = film.titre;

        const description = document.querySelector("#description");
        description!.textContent = film.description;

        const comments = await api.comment.get();
        let html = ""
        const template = `<div class="comment">
        <div>{{username}}:</div>
        {{comment}}
        </div>`
        for (let index = 0; index < comments.data.length; index++) {
            const comment = comments.data[index]
            if(comment.filmId == film.id){
                const user = await api.user.get(comment.userId);
                const imageTemplate = `<img src=${user.data[0].picture}>`
                const elemString = template.replace("{{username}}", imageTemplate + user.data[0].login).replace("{{comment}}",comment.text);
                const elem = strToHtml(elemString)[0] as HTMLElement;
                elem.dataset.comment = JSON.stringify(comment);
                html += elem.outerHTML
            }
        }

        const commentsElement = document.querySelector("#comments") as HTMLElement;
        commentsElement.innerHTML = html;

        let btnComment = document.querySelector("#sendComment");
        let commentFunc = async (filmId:number, userId:number)=>{
            const text = (document.querySelector("[data-page=film] textarea") as HTMLTextAreaElement).value;
            api.comment.post({
                text: text,
                filmId: filmId,
                userId: userId
            })

            const user = gUser;
            const imageTemplate = `<img src=${user!.picture}>`
            let comment = template.replace("{{username}}", imageTemplate + user!.login).replace("{{comment}}",text)
            let commentElem = strToHtml(comment)[0];
            commentsElement.append(commentElem);
        }
        btnComment!.replaceWith(btnComment!.cloneNode(true));
        btnComment = document.querySelector("#sendComment");
        (btnComment as HTMLButtonElement).addEventListener("click", ()=>{
            commentFunc(film.id, gUser!.id)
        });

        let btnAddFav = document.querySelector("#btnAddFav");

        let favs = (await api.fav.get()).data;
        favs = favs.filter((fav)=>{
            return fav.filmId == film.id && fav.userId == gUser?.id;
        })
        if(favs.length > 0){
            btnAddFav!.textContent = "Retirer des favoris";
        } else{
            btnAddFav!.textContent = "Ajouter aux favoris";
        }

        let addFavFunc = async (filmId:number, userId:number)=>{
            const favs = (await (api.fav.get())).data.filter((fav)=>{return fav.filmId == filmId && fav.userId == userId});
            if(favs.length>0) {
                favs.forEach((fav)=>{
                    api.fav.delete(fav.id);
                })
                btnAddFav!.textContent = "Ajouter aux favoris";
                return;
            }
            api.fav.post({
                filmId: filmId,
                userId: userId
            })
            btnAddFav!.textContent = "Retirer des favoris";
        }

        btnAddFav!.replaceWith(btnAddFav!.cloneNode(true));
        btnAddFav = document.querySelector("#btnAddFav");
        (btnAddFav as HTMLButtonElement).addEventListener("click", ()=>{
            addFavFunc(film.id, gUser!.id)
        });

        const seancesElem = document.querySelector("#seances");
        const seances = await api.seance.get();

        let temp = ""
        for(let i=0; i<seances.data.length; i++) {
            let seance = seances.data[i]
            if(seance.filmId != film.id) continue;
            const cinema = (await api.cinema.get(seance.id)).data[0]
            const date = new Date(seance.date)

            let reservations = (await api.reservation.get()).data;
            reservations = reservations.filter((reservation)=>{
                return reservation.seanceId == seance.id && reservation.userId == gUser?.id;
            })
            let isReserved = reservations.length > 0

            const elemString =  `
            <div class=seance data-reserved=${isReserved} data-id=${seance.id}>
                <div>${date.getDate()}/${date.getMonth()} ${date.getHours()}:${date.getMinutes()}</div>
                <div>${cinema.name}</div>
            </div>
            `;

            const elem = strToHtml(elemString)[0] as HTMLElement;
            elem.dataset.seance = JSON.stringify(seance);

            temp += elem.outerHTML;
        }

        seancesElem!.innerHTML = temp;
        const elems = document.querySelectorAll(".seance")
        elems.forEach(elem=>{
            elem.addEventListener("click", async ev=>{
                let id = (elem as HTMLElement).dataset.id;

                if((elem as HTMLElement).dataset.reserved == "true"){
                    (elem as HTMLElement).dataset.reserved = "false";
                    let reservs = (await api.reservation.get()).data;
                    reservs = reservs.filter((reserv)=>{
                        return reserv.seanceId == parseInt(id!) && reserv.userId == gUser?.id;
                    })
                    reservs.forEach((reserv)=>{
                        api.reservation.delete(reserv.id);
                    })
                    return;
                }

                const reserv = {
                    "seanceId": parseInt(id!),
                    "userId": gUser?.id
                }
                api.reservation.post(reserv);
                (elem as HTMLElement).dataset.reserved = "true";
            })
        })
    }
}

class Login {
    public static displayLogin(){
        const login = document.querySelector("[data-page='login']") as HTMLElement;
        login.style.display = "flex";
    }

    public static hideLogin(){
        const login = document.querySelector("[data-page='login']") as HTMLElement;
        login.style.display = "none";
    }
}

class Register {
    public static displayRegister(){
        const login = document.querySelector("[data-page='register']") as HTMLElement;
        login.style.display = "flex";
    }

    public static hideRegister(){
        const login = document.querySelector("[data-page='register']") as HTMLElement;
        login.style.display = "none";
    }
}

class MyPage {
    public static display(){
        FilmsPage.loadMyList(gUser!);
    }

    public static hide(){

    }
}

function onLogin(user:{status:string, data:User[]}){
    const btnConnexion = document.querySelector("#btnConnect") as HTMLElement;
    const btnInscription = document.querySelector("#btnInscription") as HTMLElement;
    const btnDeconnexion = document.querySelector("#btnDeconnexion") as HTMLElement;
    const btnMyPage = document.querySelector("#btnMyPage") as HTMLElement;
    
    btnConnexion.style.display = "none";
    btnInscription.style.display = "none";
    btnDeconnexion.style.display = "inline";
    btnMyPage.style.display = "inline";

    gUser = user.data[0];
}

function onDisconnect(){
    const btnConnexion = document.querySelector("#btnConnect") as HTMLElement;
    const btnInscription = document.querySelector("#btnInscription") as HTMLElement;
    const btnDeconnexion = document.querySelector("#btnDeconnexion") as HTMLElement;
    const btnMyPage = document.querySelector("#btnMyPage") as HTMLElement;
    
    btnConnexion.style.display = "inline";
    btnInscription.style.display = "inline";
    btnDeconnexion.style.display = "none";
    btnMyPage.style.display = "none";

    Login.displayLogin();

    gUser = undefined;
}

function createForm(conf:{
    inputs:{
        label:string
        placeholder:string
    }[]
    onSend:(data:{key:string,value:string}[])=>(void|Promise<void>)
}) {
    let html = "<form>";
    conf.inputs.forEach((input)=>{
        html += `<div>${input.label}:<input type=text data-label=${input.label} placeholder=${input.placeholder}></input></div>`
    })
    html += "<input type=submit>Send</input>"
    html += "</form>"

    const form = strToHtml(html)[0] as HTMLFormElement;
    form.querySelector("input[type=submit]")?.addEventListener("click", ()=>{
        const obj:{
            key:string,
            value:string
        }[] = []

        form.querySelectorAll("input[type=text]").forEach((input)=>{
            const label = (input as HTMLElement).dataset.label;
            obj.push({
                "key": label!,
                "value": (input as HTMLInputElement).value
            })
        })

        conf.onSend(obj)
    });

    return form;
}

function displayForm(object:any, entity:String){
    let conf:{
        inputs:{
            label:string
            placeholder:string
        }[]
        onSend:(data:{key:string,value:string}[])=>(void|Promise<void>)
    } = {
        inputs: [],
        onSend: (data)=>{
            let trueData:any = {};

            data.forEach(row => {
                trueData[row.key] = row.value;
            });

            api[entity as keyof typeof api].post(trueData)
        }
    };
    
    for (const key in object) {
        conf.inputs.push({"label":key, "placeholder":key})
    }

    const form = createForm(conf);
    form.classList.add("creationForm");

    document.body.append(form);
    return form;
}