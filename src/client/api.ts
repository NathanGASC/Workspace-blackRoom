import { Film } from "@prisma/client";

export class Api {
    film = new EFilm();
}

class Entity {
    //TODO: handle error case (which should never happen btw, but never don't exist in dev)
    name = "";
    async get(id?: number, page?: number) {
        let url = "/api/" + this.name + "";
        if (id) url = "/api/" + this.name + "?id=" + id;
        if (page) "/api/" + this.name + "?page=" + page
        const res = await fetch(url);
        const json = (await res.json());
        return json;
    }
}

class EFilm extends Entity {
    name = "film"
    async get(id?: number, page?: number): Promise<{ status: string, data: Film[] }> {
        return super.get()
    }
}