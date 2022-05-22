import { createLogger } from "@nathangasc/fox_logger";
import { I18N } from "@nathangasc/i18n"
import logConfig from "./logger.json";
import { onDOMReady } from "./helpers/DOM";
import { Film } from "@prisma/client";
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
            filmPage.style.display = "flex"
            flag = false;
        } else {
            filmPage.style.display = "none"
        }
    })

    const pages = document.querySelectorAll(".page");
    pages?.forEach((page) => {
        page.addEventListener("click", () => {
            const num = page.textContent!;
            FilmPage.loadFilms(parseInt(num));
        })
    })

    FilmPage.loadFilms(0);
})();

class FilmPage {
    public static async loadFilms(page: number) {
        await FilmPage.unloadFilms();
        page--;
        const boxes = document.querySelectorAll(".box") as NodeListOf<HTMLImageElement>;

        const json = await api.film.get(undefined, 0);
        const films = json.data;
        films.forEach((film: Film, index: number) => {
            const picture = film.picture;
            const formatedPicture = "data:image/png;base64," + picture;
            console.log(boxes[index])
            boxes[index].src = formatedPicture
        });
    }

    public static async unloadFilms() {
        const boxes = document.querySelectorAll(".box") as NodeListOf<HTMLImageElement>;
        boxes.forEach((box) => {
            const formatedPicture = "data:image/png;base64";
            box.src = formatedPicture
        });
    }
}

class NavBar {

}