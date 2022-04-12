import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from './mikro-orm.config';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import { COOKIE_NAME, __port__, __prod__, __redisSecret__ } from './constant';
import resolvers from './resolvers';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { createClient } from 'redis';
import { LocalContext } from './types/local-context';
import cors from 'cors';

const RedisStore = connectRedis(session);
const redisClient = createClient({ legacyMode: true });
redisClient.connect().catch(console.error);

const whitelist = ['http://127.0.0.1:3000', 'http://localhost:3000'];
const corsOptions = {
    origin: (origin: any, callback: any) => {
        callback(null, () => whitelist.includes(origin) ? origin : new Error('Not allowed by CORS'));
    },
    credentials: true
}


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();

    const app = express();

    app.use(cors(corsOptions));

    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({
                client: redisClient as any,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
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
    apolloServer.applyMiddleware({ app, path: '/', cors: false });

    if (!__prod__) {
        app.listen(__port__);
        console.log(`Express server has started on port ${__port__}. Open http://localhost:${__port__} to see results`)
    }

}

main().catch(error => {
    console.error(error);
});