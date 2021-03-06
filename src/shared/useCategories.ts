import { gql } from "graphql-request";
import { useQuery } from "react-query";

import { client } from "@lib/client";

export let categoriesQuery = gql`
  query categories {
    categories {
      ...categoryFields
    }
  }
  fragment categoryFields on Category {
    id
    name
  }
`;

export let useCategories = () =>
  useQuery("categories", () => client.categories());
