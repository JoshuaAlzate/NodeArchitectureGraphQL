import { Field, InputType } from "type-graphql";

@InputType()
export class UserInformation {
    @Field()
    username: string;
    @Field()
    email: string;
    @Field()
    password: string;
}