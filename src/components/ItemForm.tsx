import * as React from "react";
import clsx from "clsx";
import { useForm, Controller } from "react-hook-form";
import { Listbox } from "@headlessui/react";
import { useMutation } from "react-query";
import { gql } from "graphql-request";
import { MdAdd, MdRemove } from "react-icons/md";

import { ContextualLayout } from "@layouts/ContextualLayout";
import { Category } from "@generated/graphql";
import { client } from "@lib/client";
import { useCategories } from "@shared/index";
import { queryCache } from "@lib/cache";

export let createItemMutation = gql`
  mutation createItem(
    $name: String!
    $categoryId: Int!
    $note: String
    $image: String
  ) {
    createItem(
      name: $name
      categoryId: $categoryId
      note: $note
      image: $image
    ) {
      id
    }
  }
`;

interface ItemFormValues {
  name: string;
  note: string;
  image: string;
  categoryId: number;
}

interface ItemFormProps {
  onComplete?: () => void;
}

export let ItemForm = ({ onComplete }: ItemFormProps) => {
  let { data: categoriesData } = useCategories();
  let { register, errors, control, handleSubmit } = useForm<ItemFormValues>();
  let [createItem] = useMutation(client.createItem, {
    onSuccess: () => {
      queryCache.invalidateQueries("items");
      queryCache.invalidateQueries("lists");
    },
  });

  let onSubmit = handleSubmit(async (values) => {
    await createItem(values);

    onComplete?.();
  });

  return (
    <ContextualLayout
      primary={
        <form id="item-form" className="p-4 md:p-8" onSubmit={onSubmit}>
          <h2 className="text-xl mb-5"> Add a new item</h2>
          <ItemFormInput
            ref={register({ required: true })}
            name="name"
            label="Name"
            placeholder="Enter a name"
            errorText={errors.name ? "Name cannot be blank" : undefined}
          />
          <ItemFormInput
            ref={register()}
            multiline
            name="note"
            label="Note (optional)"
            placeholder="Enter a note"
          />
          <ItemFormInput
            ref={register()}
            name="image"
            label="Image (optional)"
            placeholder="Enter a url"
          />
          <Controller
            control={control}
            name="categoryId"
            rules={{ required: true }}
            render={(props: any) => (
              <CategorySelect
                categories={categoriesData?.categories ?? []}
                placeholder="Enter a category"
                value={props.value}
                onChange={props.onChange}
              />
            )}
          />
        </form>
      }
      secondary={
        <>
          <button onClick={onComplete} className="px-6 py-4 rounded-lg mr-2">
            cancel
          </button>
          <button
            type="submit"
            form="item-form"
            className="px-6 py-4 rounded-lg bg-brand-primary text-white"
          >
            Save
          </button>
        </>
      }
    />
  );
};

interface ItemFormInputProps
  extends React.HTMLProps<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  multiline?: boolean;
  errorText?: string;
}

export let ItemFormInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  ItemFormInputProps
>(({ label, multiline, errorText, ...props }, ref) => {
  let id = props.name;
  let hasError = Boolean(errorText);

  let inputProps = {
    className: clsx(
      "w-full rounded-lg p-4 border-2 text-gray-900 focus:border-brand-primary outline-none",
      { "border-red-500": hasError }
    ),
    ...props,
    id,
    ref: ref as any,
  };

  return (
    <div
      className={clsx("mb-6 border-gray-500 focus-within:text-brand-primary", {
        "text-red-500 border-red-500": hasError,
      })}
    >
      <label className="block text-sm font-bold mb-2" htmlFor={id}>
        {label}
      </label>
      {multiline ? (
        <textarea {...inputProps} rows={5} />
      ) : (
        <input {...inputProps} />
      )}
      {errorText ? (
        <p className="text-red-500 text-xs font-bold">{errorText}</p>
      ) : null}
    </div>
  );
});

export let createCategoryMutation = gql`
  mutation createCategory($name: String!) {
    createCategory(name: $name) {
      id
    }
  }
`;

export let deleteCategoryMutation = gql`
  mutation deleteCategory($id: Int!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;

interface CategorySelectProps {
  categories: Category[];
  onChange: (value: string) => void;
  value?: string;
  placeholder?: string;
}

let CategorySelect = (props: CategorySelectProps) => {
  let [addingCategory, setAddingCategory] = React.useState(false);
  let [categoryToAdd, setCategoryToAdd] = React.useState("");
  let [createCategory] = useMutation(client.createCategory, {
    onSuccess: () => {
      queryCache.invalidateQueries("categories");
    },
  });
  let [deleteCategory] = useMutation(client.deleteCategory, {
    onSuccess: () => {
      queryCache.invalidateQueries("categories");
      queryCache.invalidateQueries("items");
    },
  });

  let onCategoryAdd = async () => {
    if (categoryToAdd) {
      await createCategory({
        name: categoryToAdd,
      });

      setCategoryToAdd("");
    }
  };

  let onCategoryDelete = async (id: number) => {
    deleteCategory({
      id,
    });
  };

  let displayedValue = props.categories.find(
    (item) => item.id === Number(props.value)
  )?.name;

  return (
    <Listbox value={props.value} onChange={props.onChange}>
      <Listbox.Label className="block text-sm font-bold mb-2">
        Category
      </Listbox.Label>
      <Listbox.Button
        className={clsx(
          "w-full text-left rounded-lg p-4 border-2 focus:border-brand-primary focus:outline-none",
          {
            "text-gray-900": displayedValue,
            "text-gray-500": !displayedValue,
          }
        )}
      >
        {displayedValue ?? props.placeholder}
      </Listbox.Button>
      <Listbox.Options
        className="border rounded-lg shadow-sm border-gray-200 p-1 outline-none mt-2 overflow-y-auto"
        style={{
          maxHeight: "10rem",
        }}
      >
        {props.categories.map((category) => (
          <Listbox.Option
            as={React.Fragment}
            key={category.id}
            value={category.id}
          >
            {({ active, selected }) => (
              <li
                className={clsx(
                  "flex justify-between items-center rounded-lg text-gray-500 px-3 py-2 focus:outline-none",
                  {
                    "bg-orange-100 text-brand-primary": selected,
                    "bg-gray-100 text-gray-900": active || selected,
                  }
                )}
              >
                <span>{category.name}</span>
                <button
                  className="p-2 focus:outline-none"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onCategoryDelete(category.id);
                  }}
                >
                  <MdRemove />
                </button>
              </li>
            )}
          </Listbox.Option>
        ))}
        {addingCategory ? (
          <div
            className="flex justify-between items-center rounded-lg text-gray-900 px-2"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <input
              autoFocus
              onClick={(event) => {
                event.stopPropagation();
              }}
              className="w-full p-2 outline-none"
              value={categoryToAdd}
              onChange={(event) => {
                event.stopPropagation();
                setCategoryToAdd(event.target.value);
              }}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                  event.preventDefault();
                  onCategoryAdd();
                }
              }}
            />
            <button
              className={clsx("text-xl p-2", {
                "text-gray-500": !categoryToAdd,
              })}
              disabled={!categoryToAdd}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onCategoryAdd();
              }}
            >
              <MdAdd />
            </button>
          </div>
        ) : (
          <button
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setAddingCategory(true);
            }}
            className="w-full flex justify-center items-center text-xl rounded-lg text-gray-500 p-2 focus:outline-none"
          >
            <MdAdd />
          </button>
        )}
      </Listbox.Options>
    </Listbox>
  );
};
