import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";

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
}