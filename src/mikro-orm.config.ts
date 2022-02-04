import { MikroORM } from "@mikro-orm/core";
import { __dbName__, __prod__, __dbpassword__ } from "./constant";
import entities from "./entities";

export default {
    entities: entities,
    dbName: __dbName__,
    type: 'postgresql',
    password: __dbpassword__,
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];