import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";

export type LocalContext = {
    em: EntityManager<IDatabaseDriver<Connection>>;
    req: Request;
    res: Response;
}