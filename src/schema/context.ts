import { PrismaClient, PrismaClientOptions, User } from "@prisma/client";
import { PrismaDelete, onDeleteArgs } from "@paljs/plugins";
import Cookies from "cookies";
import { IncomingMessage, ServerResponse } from "http";

class Prisma extends PrismaClient {
  constructor(options?: PrismaClientOptions) {
    super(options);
  }

  async onDelete(args: onDeleteArgs) {
    let prismaDelete = new PrismaDelete(this);
    await prismaDelete.onDelete(args);
  }
}

export interface Context {
  res: ServerResponse;
  req: IncomingMessage;
  cookies: Cookies;
  user: User | null;
  prisma: Prisma;
}

export interface UserToken {
  id: number;
}

export let prisma = new Prisma();
