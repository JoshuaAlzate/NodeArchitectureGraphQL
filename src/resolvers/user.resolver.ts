import argon2 from "argon2";
import { User } from "../entities/User";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { LoginCredentials } from "../types/login-credentials";
import { UserResponse } from "../types/user-response";
import { LocalContext } from "../types/local-context";
import { COOKIE_NAME, FORGET_PASSWORD_TOKEN } from "../constant";
import { UserInformation } from "../types/user-information";
import { v4 } from "uuid";
import sendEmail from "../utils/sendEmail";


@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(@Arg('credentials') credentials: UserInformation, @Ctx() { em, req }: LocalContext): Promise<UserResponse> {
        let { username, email, password } = credentials;
        if (!username.length) return { errors: [{ field: 'username', message: 'Username field cannot be empty' }] }
        if (!email.length) return { errors: [{ field: 'username', message: 'Email field cannot be empty' }] }
        if (!password.length) return { errors: [{ field: 'password', message: 'password field cannot be empty' }] }
        password = await argon2.hash(password);

        const loginCredentials = em.create(User, { username, email, password });
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

    @Query(() => Boolean)
    async forgotPassword(@Arg('email') email: string, @Ctx() { em, req, res, redis }: LocalContext): Promise<Boolean> {
        const user = await em.findOne(User, { email });
        if (user) {
            const token = v4();
            await redis.set(FORGET_PASSWORD_TOKEN + token, user.id, 'EX', 1000 * 60 * 60 * 24 * 3);
            sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`)
        }
        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(@Arg('token') token: string, @Arg('newPassword') newPassword: string, @Ctx() { em, req, res, redis }: LocalContext): Promise<UserResponse> {
        const key = FORGET_PASSWORD_TOKEN + token;
        const userID = await redis.get(key);
        if (!userID) return {
            errors: [
                {
                    field: 'token',
                    message: 'Token is expired'
                }
            ]
        }

        const user = await em.findOne(User, { id: parseInt(userID) });
        if (!user) return {
            errors: [
                {
                    field: 'token',
                    message: 'User does not exist'
                }
            ]
        }
        user.password = await argon2.hash(newPassword);
        em.persistAndFlush(user);
        await redis.del(key);
        req.session.userID = user.id;
        
        return { user }
    }
}