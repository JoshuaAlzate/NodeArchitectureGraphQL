import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => Post, { nullable: true })
    post(@Arg('id', () => Int) id: number, @Ctx() { em }: any): Promise<Post | null> {
        return em.findOne(Post, { id });
    }
    @Query(() => [Post])
    posts(@Ctx() { em }: any): Promise<Post[]> {
        return em.find(Post, {});
    }

    @Mutation(() => Post)
    async createPost(@Arg('id') id: number, @Arg('title') title: string, @Ctx() { em }: any): Promise<Post> {
        const post = em.create(Post, { id, title });
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post)
    async updatePost(@Arg('id') id: number, @Arg('title', { nullable: true }) title: string, @Ctx() { em }: any): Promise<Post | null> {
        const post = await em.findOne(Post, { id });
        if(!post) return null;
        post.title = title;
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg('id') id: number, @Ctx() { em }: any): Promise<boolean> {
        await em.nativeDelete(Post, { id });
        return true;
    }
}