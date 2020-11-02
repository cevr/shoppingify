import { ApolloServer } from "apollo-server-micro";
import jwt from "jsonwebtoken";
import Cookies from "cookies";

import { schema } from "../../schema/index";
import { Context, prisma } from "../../schema/context";

let verifyToken = (token?: string) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SECRET!);
  } catch {
    return null;
  }
};

let apolloServer = new ApolloServer({
  schema,
  context: ({ req, res }: Context) => {
    let cookies = new Cookies(req, res);
    let token = cookies.get("auth-token");
    let user = verifyToken(token!);
    return {
      prisma,
      cookies,
      user,
    };
  },
});

export let config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
