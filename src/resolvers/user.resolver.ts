import argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Int, Mutation, Query, Resolver } from "type-graphql";
import { Connection, IDatabaseDriver, MikroORM } from "@mikro-orm/core";
import { LoginCredentials } from "../types/login-credentials";
import { UserResponse } from "../types/user-response";


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

    @Query(() => UserResponse)
    async login(@Arg('credentials') credentials: LoginCredentials, @Ctx() { em }: MikroORM<IDatabaseDriver<Connection>>): Promise<UserResponse> {
        const user = await em.findOne(User, { username: credentials.username });
        if(!user) return {
            errors: [ { message: 'User does not exist', field: 'username'} ]
        }
        const isPasswordValid = await argon2.verify(user.password, credentials.password);
        if(!isPasswordValid) return {
            errors: [{ message: 'Password is invalid', field: 'password' }]
        }
        return { user }
    }
}