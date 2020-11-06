import { ApolloServer } from "apollo-server-micro";
import jwt from "jsonwebtoken";
import Cookies from "cookies";

import { schema } from "../../schema/index";
import { Context, UserToken, prisma } from "../../schema/context";

let verifyToken = (token?: string) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.SECRET!) as UserToken;
  } catch {
    return null;
  }
};

let apolloServer = new ApolloServer({
  schema,
  context: async ({ req, res }: Context) => {
    let cookies = new Cookies(req, res);
    let token = cookies.get("auth-token");
    let user = verifyToken(token);
    user = user
      ? await prisma.user.findOne({
          where: {
            id: user?.id,
          },
        })
      : null;
    if (!user) {
      cookies.set("auth-token", "", {
        httpOnly: true,
        maxAge: -1,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
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
