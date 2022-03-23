import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {

  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({ type: 'text', unique: true })
  username!: string;

  @Property({ type: 'text' })
  password!: string;

  @Field(() => Date)
  @Property({ type: Date, onCreate: () => new Date() })
  createdAt!: Date

  @Field(() => Date)
  @Property({ type: Date, nullable: true, onUpdate: () => new Date() })
  updatedAt: Date

}