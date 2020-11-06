import { ItemFormInput } from "@components/ItemForm";
import { client } from "@lib/client";
import { gql } from "graphql-request";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { useMutation } from "react-query";

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
  let [signin, { error }] = useMutation(client.signin, {
    onSuccess: () => {
      router.replace("/items");
    },
  });
  let [signup] = useMutation(client.signup, {
    onSuccess: () => {
      router.replace("/items");
    },
  });

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
              Signup
            </button>
            <button
              onClick={onSignin}
              className="px-6 py-4 rounded-lg bg-brand-primary text-white"
            >
              Signin
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-center">
              Hmm, no dice. Maybe try signing up?
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signin;
