import { Post } from "../entities/Post";
import { Ctx, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    post(@Ctx() { em }: any): Promise<Post[]> {
        return em.find(Post, {});
    }
}