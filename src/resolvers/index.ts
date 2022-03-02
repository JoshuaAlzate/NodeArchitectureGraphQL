import { NonEmptyArray } from "type-graphql";
import { PostResolver } from "./post.resolver";
import { UserResolver } from "./user.resolver";


export default [PostResolver, UserResolver] as NonEmptyArray<Function>;