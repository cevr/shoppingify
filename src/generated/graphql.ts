import { GraphQLClient } from "graphql-request";
import { print } from "graphql";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: File;
};

export type Category = {
  __typename?: "Category";
  id: Scalars["Int"];
  name: Scalars["String"];
};

export type Item = {
  __typename?: "Item";
  category: Maybe<Category>;
  id: Scalars["Int"];
  image: Maybe<Scalars["String"]>;
  name: Scalars["String"];
  note: Maybe<Scalars["String"]>;
};

export type List = {
  __typename?: "List";
  id: Scalars["Int"];
  items: Array<ListItem>;
  name: Scalars["String"];
};

export type ListItem = {
  __typename?: "ListItem";
  category: Maybe<Category>;
  count: Scalars["Int"];
  itemId: Scalars["Int"];
  listId: Scalars["Int"];
  name: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  createCategory: Maybe<Category>;
  createItem: Maybe<Item>;
  createList: Maybe<List>;
  deleteCategory: Maybe<Category>;
  deleteItem: Maybe<Item>;
  deleteList: Maybe<List>;
  signin: Maybe<User>;
  signout: Maybe<Scalars["Boolean"]>;
  signup: Maybe<User>;
  updateCategory: Maybe<Category>;
  updateItem: Maybe<Item>;
  updateList: Maybe<List>;
};

export type MutationCreateCategoryArgs = {
  name: Scalars["String"];
};

export type MutationCreateItemArgs = {
  categoryId: Scalars["Int"];
  image: Maybe<Scalars["Upload"]>;
  name: Scalars["String"];
  note: Maybe<Scalars["String"]>;
};

export type MutationCreateListArgs = {
  items: Maybe<Array<Scalars["Int"]>>;
  name: Scalars["String"];
};

export type MutationDeleteCategoryArgs = {
  id: Scalars["Int"];
};

export type MutationDeleteItemArgs = {
  itemId: Scalars["Int"];
};

export type MutationDeleteListArgs = {
  id: Scalars["Int"];
};

export type MutationSigninArgs = {
  password: Scalars["String"];
  username: Scalars["String"];
};

export type MutationSignupArgs = {
  password: Scalars["String"];
  username: Scalars["String"];
};

export type MutationUpdateCategoryArgs = {
  id: Scalars["Int"];
  name: Scalars["String"];
};

export type MutationUpdateItemArgs = {
  categoryId: Maybe<Scalars["Int"]>;
  image: Maybe<Scalars["Upload"]>;
  itemId: Scalars["Int"];
  name: Maybe<Scalars["String"]>;
  note: Maybe<Scalars["String"]>;
};

export type MutationUpdateListArgs = {
  add: Maybe<Array<Scalars["Int"]>>;
  delete: Maybe<Array<Scalars["Int"]>>;
  id: Scalars["Int"];
  name: Maybe<Scalars["String"]>;
};

export type Query = {
  __typename?: "Query";
  categories: Array<Category>;
  items: Array<Item>;
  lists: Array<List>;
  me: Maybe<User>;
};

export type UploadedFile = {
  __typename?: "UploadedFile";
  filename: Scalars["String"];
  uri: Scalars["String"];
};

export type User = {
  __typename?: "User";
  activeListId: Maybe<Scalars["Int"]>;
  categories: Array<Category>;
  id: Scalars["Int"];
  items: Maybe<Array<Item>>;
  lists: Maybe<Array<List>>;
  username: Scalars["String"];
};

export type ItemsQueryVariables = Exact<{ [key: string]: never }>;

export type ItemsQuery = {
  __typename?: "Query";
  items: Array<{ __typename?: "Item"; id: number; name: string }>;
};

export type ListsQueryVariables = Exact<{ [key: string]: never }>;

export type ListsQuery = {
  __typename?: "Query";
  lists: Array<{
    __typename?: "List";
    id: number;
    name: string;
    items: Array<{ __typename?: "ListItem"; name: string; id: number }>;
  }>;
};

export type MeQueryVariables = Exact<{ [key: string]: never }>;

export type MeQuery = {
  __typename?: "Query";
  me: Maybe<{
    __typename?: "User";
    id: number;
    username: string;
    activeListId: Maybe<number>;
  }>;
};

export const ItemsDocument = gql`
  query items {
    items {
      id
      name
    }
  }
`;
export const ListsDocument = gql`
  query lists {
    lists {
      id
      name
      items {
        id: itemId
        name
      }
    }
  }
`;
export const MeDocument = gql`
  query me {
    me {
      id
      username
      activeListId
    }
  }
`;

export type SdkFunctionWrapper = <T>(action: () => Promise<T>) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (sdkFunction) => sdkFunction();
export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    items(variables?: ItemsQueryVariables): Promise<ItemsQuery> {
      return withWrapper(() =>
        client.request<ItemsQuery>(print(ItemsDocument), variables)
      );
    },
    lists(variables?: ListsQueryVariables): Promise<ListsQuery> {
      return withWrapper(() =>
        client.request<ListsQuery>(print(ListsDocument), variables)
      );
    },
    me(variables?: MeQueryVariables): Promise<MeQuery> {
      return withWrapper(() =>
        client.request<MeQuery>(print(MeDocument), variables)
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
