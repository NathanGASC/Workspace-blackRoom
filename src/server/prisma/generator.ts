import faker from "@faker-js/faker";
import Chance from "chance";
import fetch from "node-fetch"
const chance = new Chance();

export class GeneratorV1 {
    generateUser() {
        return {
            "bearerExpiration": faker.date.future(),
            "bearerToken": chance.guid(),
            "birthday": faker.date.past(),
            "csrfToken": chance.guid(),
            "email": faker.internet.email(),
            "emailVerify": chance.bool(),
            "login": faker.internet.userName(),
            "password": faker.internet.password(),
            "picture": faker.internet.avatar(),
        }
    }

    generateAuthor() {
        return {
            "name": faker.name.findName(),
        }
    }

    async generateFilm(authorId: number) {
        return {
            "titre": faker.name.title(),
            "description": faker.lorem.paragraph(10),
            "Author": {
                "connect": {
                    "id": authorId
                }
            },
            "picture": await this.getFilmPicture(),
        }
    }


    private async getFilmPicture() {
        const res = await fetch("https://api.lorem.space/image/movie?w=150&h=200");
        const buffer = await res.buffer();
        const img = buffer.toString("base64");
        return img;
    }
}