import * as React from "react";
import { gql } from "graphql-request";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { useForm } from "react-hook-form";
import { QueryCache, useMutation } from "react-query";
import { dehydrate } from "react-query/hydration";

import { client, serverClient } from "@lib/client";
import { ItemFormInput } from "@components/ItemForm";
import { queryCache } from "@lib/cache";

export let signinMutation = gql`
  mutation signin($username: String!, $password: String!) {
    signin(username: $username, password: $password) {
      id
    }
  }
`;

export let signupMutation = gql`
  mutation signup($username: String!, $password: String!) {
    signup(username: $username, password: $password) {
      id
    }
  }
`;

export let signout = gql`
  mutation signout {
    signout
  }
`;

interface FormFields {
  username: string;
  password: string;
}

let Signin = () => {
  let router = useRouter();

  let { register, errors, handleSubmit } = useForm<FormFields>();
  let [signin, { error: signinError, isLoading: signinLoading }] = useMutation(
    client.signin,
    {
      onSuccess: () => {
        queryCache.invalidateQueries("user");
        router.replace("/items");
      },
    }
  );
  let [signup, { error: signupError, isLoading: signupLoading }] = useMutation(
    client.signup,
    {
      onSuccess: () => {
        queryCache.invalidateQueries("user");
        router.replace("/items");
      },
    }
  );

  let onSignin = handleSubmit((fields) => {
    signin(fields);
  });
  let onSignup = handleSubmit((fields) => {
    signup(fields);
  });

  return (
    <div className="h-full w-full flex justify-center items-center">
      <div
        className="flex flex-col rounded-md overflow-hidden shadow-md"
        style={{ width: 400 }}
      >
        <div className="flex justify-center items-center p-4 bg-brand-secondary">
          <img src="/logo.svg" />
        </div>
        <form className="flex flex-col p-10">
          <ItemFormInput
            label="username"
            ref={register({ required: true })}
            name="username"
            placeholder="awesome.person"
            errorText={
              errors.username ? "Username cannot be blank!" : undefined
            }
          />
          <ItemFormInput
            label="password"
            ref={register({ required: true })}
            name="password"
            placeholder="************"
            errorText={
              errors.password ? "Password cannot be blank!" : undefined
            }
          />
          <div className="flex justify-between mb-4">
            <button onClick={onSignup} className="px-6 py-4 rounded-lg mr-2">
              {signupLoading ? "Signing up..." : "Signup"}
            </button>
            <button
              onClick={onSignin}
              className="px-6 py-4 rounded-lg bg-brand-primary text-white"
            >
              {signinLoading ? "Signing in..." : "Signin"}
            </button>
          </div>
          {signupError ? (
            <p className="text-red-500 text-center">
              Well, that didn't work. Try a more unique username!
            </p>
          ) : (
            signinError && (
              <p className="text-red-500 text-center">
                Hmm, no dice. Maybe try signing up?
              </p>
            )
          )}
        </form>
      </div>
    </div>
  );
};

export default Signin;

export let getServerSideProps: GetServerSideProps = async ({ req }) => {
  let queryCache = new QueryCache();
  let client = serverClient(req);

  try {
    let user = await client.me();
    queryCache.setQueryData("user", user);

    return {
      props: {
        dehydratedState: dehydrate(queryCache),
      },
      redirect: {
        destination: "/items",
        permanent: false,
      },
    };
  } catch {
    return {
      props: {
        dehydratedState: dehydrate(queryCache),
      },
    };
  }
};
