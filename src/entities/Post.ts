import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Post {

  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: 'text' })
  title!: string;

  @Field(() => Date)
  @Property({ type: Date, onCreate: () => new Date() })
  createdAt!: Date

  @Field(() => Date, { nullable: true })
  @Property({ type: Date, nullable: true, onUpdate: () => new Date() })
  updatedAt: Date

}