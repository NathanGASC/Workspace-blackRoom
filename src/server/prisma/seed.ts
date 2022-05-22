import { GeneratorV1 } from './generator';
import { PrismaClient } from '@prisma/client'
import yargs from 'yargs';

const prisma = new PrismaClient();
const generatorV1 = new GeneratorV1();

(async () => {
    const argv = await yargs.command('seed', 'Fill the database with data', {
        loop: {
            description: 'number of time seeding must be done',
            alias: 'l',
            type: 'number'
        }
    })
        .help()
        .alias('help', 'h').argv;

    const index = argv._.findIndex((a) => { return a == "-l" });
    let loop = 1;
    if (typeof argv._[index + 1] == "string") loop = parseInt(argv._[index + 1] as string);
    if (typeof argv._[index + 1] == "number") loop = argv._[index + 1] as number;

    for (let i = 0; i < loop; i++) {
        //Here ur script to seed database
        const user = generatorV1.generateUser();
        const userG = await prisma.user.create({
            data: user
        })

        const author = generatorV1.generateAuthor();
        const authorG = await prisma.author.create({
            data: author
        })

        const film = await generatorV1.generateFilm(authorG.id);
        const filmG = await prisma.film.create({
            data: film as any,
        })
    }
})()