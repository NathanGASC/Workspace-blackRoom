import { Cinema, Comment, Fav, Film, Reservation, Seance, User } from "@prisma/client";

export class Api{
    film = new EFilm();
    comment = new EComment();
    user = new EUser();
    seance = new ESeance();
    cinema = new ECinema();
    reservation = new EReservation();
    fav = new EFav();
}

class Entity {
    //TODO: handle error case (which should never happen btw, but never don't exist in dev)
    name = "";
    async get(id?: number, page?: number) {
        let url = "/api/" + this.name + "";
        if (id !== undefined) url = "/api/" + this.name + "?id=" + id;
        if (page !== undefined) url = "/api/" + this.name + "?page=" + page
        const res = await fetch(url);
        const json = (await res.json());
        return json;
    }

    async post(data: any){
        let url = "/api/" + this.name + "";
        const res = await fetch(url, {
            "method":"POST",
            "headers": {'Content-Type': 'application/json'}, 
            "body": JSON.stringify(data)
        });
        const json = (await res.json());
        return json;
    }

    async delete(id: number){
        let url = "/api/" + this.name + "?id=" + id;
        const res = await fetch(url, {
            "method":"DELETE",
            "headers": {'Content-Type': 'application/json'}
        });
        const json = (await res.json());
        return json;
    }
}

class EFilm extends Entity {
    name = "film"
    async get(id?: number, page?: number): Promise<{ status: string, data: Film[] }> {
        return super.get(id,page);
    }
}

class EComment extends Entity {
    name = "comment"
    async get(id?: number, page?: number): Promise<{ status: string, data: Comment[] }> {
        return super.get(id,page);
    }
}

class EUser extends Entity {
    name = "user"
    async get(id?: number, page?: number): Promise<{ status: string, data: User[] }> {
        return super.get(id,page);
    }

    async login(login:string, password:string):Promise<{ status: string, data: User[] }>{
        const res = await fetch("/api/login", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({login,password})
        })
        return await res.json()
    }
}

class ESeance extends Entity{
    name = "seance"
    async get(id?: number, page?: number): Promise<{status: string, data: Seance[] }>{
        return super.get(id,page)
    }
}

class ECinema extends Entity{
    name = "cinema"
    async get(id?: number, page?: number): Promise<{status: string, data: Cinema[] }>{
        return super.get(id,page)
    }
}

class EReservation extends Entity{
    name = "reservation"
    async get(id?: number, page?: number): Promise<{status: string, data: Reservation[] }>{
        return super.get(id,page)
    }
}

class EFav extends Entity{
    name = "fav"
    async get(id?: number, page?: number): Promise<{status: string, data: Fav[] }>{
        return super.get(id,page)
    }
}