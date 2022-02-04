import 'dotenv/config';
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from './mikro-orm.config';


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
}

main().catch(error => {
    console.error(error);
});