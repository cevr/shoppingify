import {
  objectType,
  stringArg,
  intArg,
  booleanArg,
  asNexusMethod,
  enumType,
} from "@nexus/schema";
import bcrypt from "bcrypt";
import { ApolloError, AuthenticationError } from "apollo-server-micro";
import jwt from "jsonwebtoken";
import { GraphQLDateTime } from "graphql-iso-date";

export let Datetime = asNexusMethod(GraphQLDateTime, "date", "Date");

export let Category = objectType({
  name: "Category",
  definition(t) {
    t.int("id", { nullable: false });
    t.string("name", { nullable: false });
  },
});

export let Item = objectType({
  name: "Item",
  definition(t) {
    t.int("id", { nullable: false });
    t.string("name", { nullable: false });
    t.field("category", {
      type: Category,
      resolve: (item, _args, context) =>
        context.prisma.item
          .findOne({
            where: {
              id: item.id,
            },
          })
          .category(),
    });
    t.string("note");
    t.string("image");
  },
});

export let ListItem = objectType({
  name: "ListItem",
  definition(t) {
    t.int("itemId", { nullable: false });
    t.int("listId", { nullable: false });
    t.int("count", { nullable: false });
    t.boolean("complete", { nullable: false });
    t.string("name", {
      nullable: false,
      resolve: (listItem, _args, context) =>
        context.prisma.listItem
          .findOne({
            where: {
              itemId_listId: {
                itemId: listItem.itemId,
                listId: listItem.listId,
              },
            },
          })
          .item()
          .then((item) => item?.name) as any,
    });
    t.field("category", {
      type: Category,
      resolve: (listItem, _args, context) =>
        context.prisma.listItem
          .findOne({
            where: {
              itemId_listId: {
                itemId: listItem.itemId,
                listId: listItem.listId,
              },
            },
          })
          .item()
          .category(),
    });
  },
});

enum ListStatusEnum {
  ACTIVE,
  COMPLETED,
  CANCELLED,
}

export let ListStatus = enumType({
  name: "ListStatus",
  members: ListStatusEnum,
  rootTyping: "number",
});

export let List = objectType({
  name: "List",
  definition(t) {
    t.int("id", { nullable: false });
    t.string("name", { nullable: false });
    t.field("status", {
      type: ListStatus,
      nullable: false,
    });
    t.date("createdAt", { nullable: false });
    t.date("updatedAt", { nullable: false });
    t.field("items", {
      type: ListItem,
      list: [true],
      nullable: false,
      resolve: (list, _args, context) =>
        context.prisma.list
          .findOne({
            where: {
              id: list.id,
            },
          })
          .items(),
    });
  },
});

export let User = objectType({
  name: "User",
  definition(t) {
    t.int("id", { nullable: false });
    t.string("username", { nullable: false });
    t.int("activeListId");
    t.field("categories", {
      type: Category,
      nullable: false,
      list: [true],
      resolve: (user, _args, context) =>
        context.prisma.user
          .findOne({
            where: {
              id: user.id,
            },
          })
          .categories(),
    });
    t.field("items", {
      type: Item,
      list: [true],
      resolve: (user, _args, context) =>
        context.prisma.user
          .findOne({
            where: {
              id: user.id,
            },
          })
          .items(),
    });
    t.field("lists", {
      type: List,
      list: [true],
      resolve: (user, _args, context) =>
        context.prisma.user
          .findOne({
            where: {
              id: user.id,
            },
          })
          .lists(),
    });
  },
});

export let Query = objectType({
  name: "Query",
  definition(t) {
    t.field("me", {
      type: User,
      resolve: (_parent, _args, context) =>
        context.user?.id
          ? context.prisma.user.findOne({
              where: {
                id: context.user.id,
              },
            })
          : null,
    });

    t.field("items", {
      type: Item,
      list: [true],
      nullable: false,
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, _args, context) =>
        context.prisma.item.findMany({
          where: {
            userId: context.user?.id,
          },
        }),
    });

    t.field("item", {
      type: Item,
      authorize: (_parent, _args, context) => Boolean(context.user),
      args: {
        id: intArg({ required: true }),
      },
      resolve: (_parent, { id }, context) =>
        context.prisma.item.findOne({
          where: {
            id,
          },
        }),
    });

    t.field("lists", {
      type: List,
      list: [true],
      nullable: false,
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, _args, context) => {
        let lists = await context.prisma.list.findMany({
          where: {
            userId: context.user?.id,
          },
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        });

        return lists;
      },
    });

    t.field("categories", {
      type: Category,
      list: [true],
      nullable: false,
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, _args, context) =>
        context.prisma.category.findMany({
          where: {
            userId: context.user?.id,
          },
        }),
    });
  },
});

export let Mutation = objectType({
  name: "Mutation",
  definition(t) {
    t.field("signin", {
      type: User,
      args: {
        username: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      resolve: async (_, { username, password }, context) => {
        let user = await context.prisma.user.findOne({
          where: {
            username,
          },
        });

        if (user && bcrypt.compareSync(password, user.password)) {
          let token = jwt.sign({ id: user.id }, process.env.SECRET!);
          context.cookies.set("auth-token", token, {
            httpOnly: true,
            sameSite: "lax",
              });
          return user;
        } else {
          throw new AuthenticationError("Invalid credentials");
        }
      },
    });

    t.field("signup", {
      type: User,
      args: {
        username: stringArg({ required: true }),
        password: stringArg({ required: true }),
      },
      resolve: async (_, { username, password }, context) => {
        try {
          let hash = await bcrypt.hash(password, 10);
          let user = await context.prisma.user.create({
            data: {
              username,
              password: hash,
            },
          });
          let token = jwt.sign({ id: user.id }, process.env.SECRET!);
          context.cookies.set("auth-token", token, {
            httpOnly: true,
            sameSite: "lax",
              });
          return user;
        } catch {
          throw new ApolloError("Invalid request");
        }
      },
    });

    t.field("signout", {
      type: "Boolean",
      resolve: (_parent, _args, context) => {
        context.cookies.set("auth-token", "", {
          httpOnly: true,
          maxAge: -1,
          sameSite: "lax",
          });
        return true;
      },
    });

    t.field("createItem", {
      type: Item,
      args: {
        name: stringArg({ required: true }),
        categoryId: intArg({ required: true }),
        note: stringArg(),
        image: stringArg(),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { name, categoryId, note, image }, context) => {
        let userId = context.user?.id as number;
        let listId = context.user?.activeListId ?? undefined;

        let itemCreate = {
          create: {
            item: {
              create: {
                name,
                note,
                image,
                category: {
                  connect: {
                    id: categoryId,
                  },
                },
                user: {
                  connect: {
                    id: userId,
                  },
                },
              },
            },
          },
        };

        let list = !listId
          ? await context.prisma.list.create({
              data: {
                name: "Shopping list",
                user: {
                  connect: {
                    id: userId,
                  },
                },
                items: itemCreate,
              },
            })
          : await context.prisma.list.update({
              where: {
                id: listId,
              },
              data: {
                items: itemCreate,
              },
            });

        await context.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            activeListId: list.id,
          },
        });
        return list;
      },
    });

    t.field("deleteItem", {
      type: Item,
      args: {
        id: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { id }, context) => {
        let where = {
          id,
        };
        await context.prisma.onDelete({
          model: "Item",
          where,
        });
        return context.prisma.item.delete({
          where,
        });
      },
    });

    t.field("createCategory", {
      type: Category,
      args: {
        name: stringArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, { name }, context) =>
        context.prisma.category.create({
          data: {
            name,
            user: {
              connect: {
                id: context.user?.id,
              },
            },
          },
        }),
    });

    t.field("deleteCategory", {
      type: Category,
      args: {
        id: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { id }, context) => {
        let where = {
          id,
        };
        return context.prisma.category.delete({
          where,
        });
      },
    });

    t.field("renameList", {
      type: List,
      args: {
        name: stringArg({ required: true }),
        listId: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, { name, listId }, context) =>
        context.prisma.list.update({
          where: {
            id: listId,
          },
          data: {
            name,
          },
        }),
    });

    t.field("addItem", {
      type: List,
      args: {
        itemId: intArg({ required: true }),
        listId: intArg(),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { itemId, listId }, context) => {
        let userId = context.user?.id as number;
        listId = context.user?.activeListId ?? listId ?? undefined;

        let itemCreate = {
          create: {
            item: {
              connect: {
                id: itemId,
              },
            },
          },
        };

        let list = !listId
          ? await context.prisma.list.create({
              data: {
                name: "Shopping list",
                user: {
                  connect: {
                    id: userId,
                  },
                },
                items: itemCreate,
              },
            })
          : await context.prisma.list.update({
              where: {
                id: listId,
              },
              data: {
                items: itemCreate,
              },
            });

        await context.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            activeListId: list.id,
          },
        });
        return list;
      },
    });

    t.field("removeItem", {
      type: List,
      args: {
        itemId: intArg({ required: true }),
        listId: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { itemId, listId }, context) => {
        return await context.prisma.list.update({
          where: {
            id: listId,
          },
          data: {
            items: {
              delete: {
                itemId_listId: {
                  itemId,
                  listId,
                },
              },
            },
          },
        });
      },
    });

    t.field("completeList", {
      type: List,
      args: {
        id: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { id }, context) => {
        await context.prisma.user.update({
          where: {
            id: context.user?.id,
          },
          data: {
            activeListId: null,
          },
        });

        return await context.prisma.list.update({
          where: {
            id,
          },
          data: {
            status: ListStatusEnum.COMPLETED,
          },
        });
      },
    });
    t.field("cancelList", {
      type: List,
      args: {
        id: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { id }, context) => {
        await context.prisma.user.update({
          where: {
            id: context.user?.id,
          },
          data: {
            activeListId: null,
          },
        });

        return await context.prisma.list.update({
          where: {
            id,
          },
          data: {
            status: ListStatusEnum.CANCELLED,
          },
        });
      },
    });

    t.field("incrementListItemCount", {
      type: ListItem,
      args: {
        itemId: intArg({ required: true }),
        listId: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, { itemId, listId }, context) =>
        context.prisma.listItem.update({
          where: {
            itemId_listId: {
              itemId,
              listId,
            },
          },
          data: {
            count: {
              increment: 1,
            },
          },
        }),
    });
    t.field("decrementListItemCount", {
      type: ListItem,
      args: {
        itemId: intArg({ required: true }),
        listId: intArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, { itemId, listId }, context) =>
        context.prisma.listItem.update({
          where: {
            itemId_listId: {
              itemId,
              listId,
            },
          },
          data: {
            count: {
              decrement: 1,
            },
          },
        }),
    });
    t.field("setListItemComplete", {
      type: ListItem,
      args: {
        itemId: intArg({ required: true }),
        listId: intArg({ required: true }),
        complete: booleanArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, { itemId, listId, complete }, context) =>
        context.prisma.listItem.update({
          where: {
            itemId_listId: {
              itemId,
              listId,
            },
          },
          data: {
            complete,
          },
        }),
    });
  },
});
