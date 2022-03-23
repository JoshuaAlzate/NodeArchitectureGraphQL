import argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { LoginCredentials } from "../types/login-credentials";
import { UserResponse } from "../types/user-response";
import { LocalContext } from "src/types/local-context";
import { COOKIE_NAME } from "../constant";


@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(@Arg('credentials') credentials: LoginCredentials, @Ctx() { em, req }: LocalContext): Promise<UserResponse> {
        let { username, password } = credentials;
        if (!username.length) return { errors: [{ field: 'username', message: 'Username field cannot be empty' }] }
        if (!password.length) return { errors: [{ field: 'password', message: 'password field cannot be empty' }] }
        password = await argon2.hash(password);

        const loginCredentials = em.create(User, { username, password });
        try {
            await em.persistAndFlush(loginCredentials);
            req.session.userID = loginCredentials.id;
        } catch (error) {
            if (error.code === '23505') return { errors: [{ field: 'username', message: 'Username is already taken' }] }
        }
        return { user: loginCredentials };
    }

    @Mutation(() => UserResponse)
    async login(@Arg('credentials') credentials: LoginCredentials, @Ctx() { em, req, res }: LocalContext): Promise<UserResponse> {
        const user = await em.findOne(User, { username: credentials.username });
        if (!user) return {
            errors: [{ message: 'User does not exist', field: 'username' }]
        }
        const isPasswordValid = await argon2.verify(user.password, credentials.password);
        if (!isPasswordValid) return {
            errors: [{ message: 'Password is invalid', field: 'password' }]
        }
        req.session.userID = user.id;
        return { user }
    }

    @Query(() => UserResponse)
    async me(@Ctx() { em, req }: LocalContext): Promise<UserResponse | null> {
        if (!req.session.userID) return { errors: [{ message: 'You are not logged in', field: 'none' }] }
        const user: any = await em.findOne(User, { id: req.session.userID });
        return { user };
    }

    @Mutation(() => (Boolean))
    async logout(@Ctx() { em, req, res }: LocalContext): Promise<Boolean> {
        return new Promise(resolve =>
            req.session.destroy(err => {
                if (err) {
                    console.error(err);
                    resolve(false);
                    return;
                }
                res.clearCookie(COOKIE_NAME);
                resolve(true);
            })
        );
    }
}