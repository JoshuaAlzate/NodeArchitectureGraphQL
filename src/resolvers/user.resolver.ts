import argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";


@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(@Arg('credentials') credentials: LoginCredentials, @Ctx() { em }: MikroORM<IDatabaseDriver<Connection>>): Promise<User> {
        credentials.password = await argon2.hash(credentials.password);
        const { username, password } = credentials;
        const loginCredentials = em.create(User, { username, password });
        await em.persistAndFlush(loginCredentials);
        return loginCredentials;
    }
}