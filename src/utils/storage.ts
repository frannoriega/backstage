import { useAsyncStorage } from "@react-native-async-storage/async-storage";

const { getSession, setSession } = (() => {
  const { getItem: getSession, setItem: setSession } =
    useAsyncStorage("session");
  return { getSession, setSession };
})();

const { getUser, setUser } = (() => {
  const { getItem: getUser, setItem: setUser } = useAsyncStorage("user");
  return { getUser, setUser };
})();

const { getPK, setPK } = (() => {
  const { getItem: getPK, setItem: setPK } = useAsyncStorage("pk");
  return { getPK, setPK };
})();

export { getSession, setSession, getUser, setUser, getPK, setPK };
