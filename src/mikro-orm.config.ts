import { MikroORM } from "@mikro-orm/core";
import path from "path/posix";
import { __dbName__, __prod__, __dbpassword__ } from "./constant";
import entities from "./entities";

export default {
    migrations: {
        path: path.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/
    },
    entities: entities,
    dbName: __dbName__,
    type: 'postgresql',
    password: __dbpassword__,
    debug: !__prod__
} as Parameters<typeof MikroORM.init>[0];