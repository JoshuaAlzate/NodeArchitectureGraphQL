import 'dotenv/config';
import { MikroORM } from "@mikro-orm/core";
import { __dbName__, __prod__, __dbpassword__ } from "./constant";
import entities from "./entities";

const main = async () => {
    const orm = await MikroORM.init({
        entities: entities,
        dbName: __dbName__,
        type: 'postgresql',
        password: __dbpassword__,
        debug: !__prod__
    });
}

main().catch(error => {
    console.error(error);
});