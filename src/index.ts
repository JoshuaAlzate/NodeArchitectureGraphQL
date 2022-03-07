import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from './mikro-orm.config';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import { __port__, __prod__, __redisSecret__ } from './constant';
import resolvers from './resolvers';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';
import { LocalContext } from './types/local-context';

const RedisStore = connectRedis(session);
const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();

    const app = express();

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redisClient as any,
                disableTouch: true
            }),
            cookie: {
                maxAge: 9999999999,
                httpOnly: true,
                secure: __prod__,
                sameSite: 'lax',
            },
            saveUninitialized: false,
            secret: __redisSecret__,
            resave: false,
        })
    )
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers,
            validate: false
        }),
        context: ({ req, res }): LocalContext => ({ em: orm.em, req, res }),
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground({}),
            ApolloServerPluginLandingPageDisabled()
        ]
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: '/' });

    if (!__prod__) {
        app.listen(__port__);
        console.log(`Express server has started on port ${__port__}. Open http://localhost:${__port__} to see results`)
    }

}

main().catch(error => {
    console.error(error);
});