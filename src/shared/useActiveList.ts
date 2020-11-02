import { useLists } from "./useLists";
import { useUser } from "./useUser";

export let useActiveList = () => {
  let { data: userData } = useUser();
  let { data: listsData } = useLists();

  return (
    listsData?.lists.find((list) => list.id === userData?.me?.activeListId) ??
    null
  );
};
