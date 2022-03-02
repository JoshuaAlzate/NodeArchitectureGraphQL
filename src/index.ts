import 'reflect-metadata';
import 'dotenv/config';
import express from 'express';
import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from './mikro-orm.config';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground, ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import { __port__, __prod__ } from './constant';
import resolvers from './resolvers';


const main = async () => {
    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();

    const app = express();
    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers,
            validate: false
        }),
        context: () => ({ em: orm.em }),
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