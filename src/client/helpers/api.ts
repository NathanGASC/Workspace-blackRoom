import { Observable } from "@nathangasc/observer/dist/observable";
const HttpMethods = [
    "GET",
    "POST",
    "DELETE",
    "UPDATE"
] as const;

type Entities = {
    user: {

    }
}

type HttpParams<T extends typeof HttpMethods[number], E extends keyof Entities> = {
} & (T extends "POST" ? {
    body: any
} : (T extends "UPDATE" ? {
    body: any
    id: number
} : (T extends "GET" ? {
    id?: number
    page?: number
} : (T extends "DELETE" ? {
    id: number
} : undefined))));

class Api extends Observable<["login", "userPost", "userDelete", "userUpdate", "userGet"]> {
    apiPath = "/api/user";

    async login(login: string, password: string) {
        const res = await fetch(this.apiPath + "/login", {
            method: "POST",
            body: JSON.stringify({
                login,
                password
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        const json = await res.json();
        this.notify("login", json);
        return json;
    }

    async user<T extends typeof HttpMethods[number]>(httpMethods: T, param: HttpParams<T, "user">) {
        switch (httpMethods) {
            case "GET":
                var paramGet = param as unknown as HttpParams<"GET", "user">;
                var page = paramGet.page ? "?page=" + paramGet.page : "";
                var id = paramGet.id ? paramGet.id : "";
                var url = this.apiPath;
                if (id) url += "/" + id;
                if (page != "") url += page;
                var res = await fetch(url);
                var json = await res.json();
                this.notify("userGet", json);
                return json;
                break;
            case "POST":
                var paramPost = param as unknown as HttpParams<"POST", "user">;
                var res = await fetch(this.apiPath, {
                    method: "POST",
                    body: JSON.stringify(paramPost.body),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                var json = await res.json();
                this.notify("userPost", json);
                return json;
                break;
            case "DELETE":
                var paramDelete = param as unknown as HttpParams<"DELETE", "user">;
                var res = await fetch(this.apiPath + paramDelete.id, {
                    method: "DELETE",
                });
                var json = await res.json();
                this.notify("userDelete", json);
                return json;
                break;
            case "UPDATE":
                var paramUpdate = param as unknown as HttpParams<"UPDATE", "user">;
                var res = await fetch(this.apiPath + paramUpdate.id, {
                    method: "UPDATE",
                    body: JSON.stringify(paramUpdate.body),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                var json = await res.json();
                this.notify("userUpdate", json);
                return json;
                break;
        }

    }
}

export const api = new Api();