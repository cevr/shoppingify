import { objectType, stringArg, intArg, booleanArg } from "@nexus/schema";
import bcrypt from "bcrypt";
import { ApolloError, AuthenticationError } from "apollo-server-micro";
import jwt from "jsonwebtoken";

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

export let List = objectType({
  name: "List",
  definition(t) {
    t.int("id", { nullable: false });
    t.string("name", { nullable: false });
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
            secure: process.env.NODE_ENV === "production",
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
            secure: process.env.NODE_ENV === "production",
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
          secure: process.env.NODE_ENV === "production",
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
        let item = await context.prisma.item.create({
          data: {
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
                id: context.user?.id,
              },
            },
          },
        });

        let activeList = context.user?.activeListId
          ? await context.prisma.list.findOne({
              where: {
                id: context.user.activeListId,
              },
            })
          : null;

        if (!activeList) {
          activeList = await context.prisma.list.create({
            data: {
              name: "Shopping list",
              user: {
                connect: {
                  id: context.user?.id,
                },
              },
            },
          });
        }

        await context.prisma.listItem.create({
          data: {
            item: {
              connect: {
                id: item.id,
              },
            },
            list: {
              connect: {
                id: activeList.id,
              },
            },
          },
        });

        await context.prisma.list.update({
          where: {
            id: activeList.id,
          },
          data: {
            items: {
              connect: {
                itemId_listId: {
                  itemId: item.id,
                  listId: activeList.id,
                },
              },
            },
          },
        });

        await context.prisma.item.update({
          where: {
            id: item.id,
          },
          data: {
            lists: {
              connect: {
                itemId_listId: {
                  itemId: item.id,
                  listId: activeList.id,
                },
              },
            },
          },
        });

        await context.prisma.user.update({
          where: {
            id: context.user?.id,
          },
          data: {
            activeListId: activeList.id,
          },
        });

        return item;
      },
    });
    t.field("updateItem", {
      type: Item,
      args: {
        itemId: intArg({ required: true }),
        name: stringArg(),
        categoryId: intArg(),
        note: stringArg(),
        image: stringArg(),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (
        _parent,
        { itemId, name, categoryId, note, image },
        context
      ) =>
        context.prisma.item.update({
          where: {
            id: itemId,
          },
          data: {
            name: name ?? undefined,
            note: note ?? undefined,
            image: image ?? undefined,
            category: {
              connect: {
                id: categoryId ?? undefined,
              },
            },
          },
        }),
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
    t.field("updateCategory", {
      type: Category,
      args: {
        id: intArg({ required: true }),
        name: stringArg({ required: true }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: (_parent, { id, name }, context) =>
        context.prisma.category.update({
          where: {
            id,
          },
          data: {
            name,
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

    t.field("createList", {
      type: List,
      args: {
        name: stringArg({ required: true }),
        items: intArg({ list: [true] }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { name, items }, context) => {
        let list = await context.prisma.list.create({
          data: {
            name,
            user: {
              connect: {
                id: context.user?.id,
              },
            },
          },
        });
        return await context.prisma.list.update({
          where: {
            id: list.id,
          },
          data: {
            items: {
              connect: items?.map((itemId) => ({
                itemId_listId: {
                  itemId,
                  listId: list.id,
                },
              })),
            },
          },
        });
      },
    });
    t.field("updateList", {
      type: List,
      args: {
        id: intArg(),
        name: stringArg(),
        add: intArg({ list: [true] }),
        delete: intArg({ list: [true] }),
      },
      authorize: (_parent, _args, context) => Boolean(context.user),
      resolve: async (_parent, { id, name, add, delete: del }, context) => {
        let listId = id;

        if (!listId) {
          listId = await context.prisma.user
            .findOne({
              where: {
                id: context.user?.id,
              },
              select: {
                activeListId: true,
              },
            })
            .then((user) => user?.activeListId);
        }

        if (!listId) {
          listId = await context.prisma.list
            .create({
              data: {
                name: "Shopping list",
                user: {
                  connect: {
                    id: context.user?.id,
                  },
                },
              },
            })
            .then((list) => list.id);
        }

        await Promise.all(
          add?.map(
            async (itemId) =>
              await context.prisma.listItem.create({
                data: {
                  item: {
                    connect: {
                      id: itemId,
                    },
                  },
                  list: {
                    connect: {
                      id: listId as number,
                    },
                  },
                },
              })
          ) ?? []
        );

        return context.prisma.list.update({
          where: {
            id: listId as number,
          },
          data: {
            name: name ?? undefined,
            items: {
              connect: add?.map((itemId) => ({
                itemId_listId: {
                  itemId,
                  listId: listId as number,
                },
              })),
              delete: del?.map((itemId) => ({
                itemId_listId: {
                  itemId,
                  listId: listId as number,
                },
              })),
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
            completed: true,
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
            cancelled: true,
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
