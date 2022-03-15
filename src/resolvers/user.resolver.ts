import argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { LoginCredentials } from "../types/login-credentials";
import { UserResponse } from "../types/user-response";
import { LocalContext } from "src/types/local-context";


@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(@Arg('credentials') credentials: LoginCredentials, @Ctx() { em, req }: LocalContext): Promise<UserResponse> {
        let { username, password } = credentials;
        if(!username.length) return { errors: [{ field: 'username', message: 'Username field cannot be empty' }]}
        if(!password.length) return { errors: [{ field: 'password', message: 'password field cannot be empty' }]}
        password = await argon2.hash(password);

        const loginCredentials = em.create(User, { username, password });
        try {
            await em.persistAndFlush(loginCredentials);
            req.session.userID = loginCredentials.id;
        } catch (error) {
            if (error.code === '23505') return { errors: [ { field: 'username', message: 'Username is already taken' } ]}
        }
        return { user: loginCredentials };
    }

    @Query(() => UserResponse)
    async login(@Arg('credentials') credentials: LoginCredentials, @Ctx() { em, req }: LocalContext): Promise<UserResponse> {
        const user = await em.findOne(User, { username: credentials.username });
        if(!user) return {
            errors: [ { message: 'User does not exist', field: 'username'} ]
        }
        const isPasswordValid = await argon2.verify(user.password, credentials.password);
        if(!isPasswordValid) return {
            errors: [{ message: 'Password is invalid', field: 'password' }]
        }
        req.session.userID = user.id;
        return { user }
    }
}