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

    async generateComment(userId: number, filmId: number) {
        return {
            "text": faker.lorem.paragraph(),
            "Film": {
                "connect": {
                    "id": filmId
                }
            },
            "User": {
                "connect": {
                    "id": userId
                }
            }
        }
    }

    async generateSeance(filmId: number, cinemaId: number){
        return {
            "date": faker.date.future(),
            "Cinema": {
                "connect": {
                    "id": cinemaId
                }
            },
            "Film": {
                "connect": {
                    "id": filmId
                }
            }
        }
    }

    async generateCinema(){
        return {
            "name": faker.name.title(),
            "coordX": this.getRandomInRange(-180, 180, 3),
            "coordY": this.getRandomInRange(-180, 180, 3),
        }
    }

    async generateReservation(seanceId:number, userId: number){
        return {
            "Seance": {
                "connect": {
                    "id": seanceId
                }
            },
            "User": {
                "connect": {
                    "id": userId
                }
            }
        }
    }

    private async getFilmPicture() {
        const res = await fetch("https://api.lorem.space/image/movie?w=150&h=200");
        const buffer = await res.buffer();
        const img = buffer.toString("base64");
        return img;
    }

    private getRandomInRange(from: any, to: any, fixed: any) {
        return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
        // .toFixed() returns string, so ' * 1' is a trick to convert to number
    }
}