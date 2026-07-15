import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await api.getUser();
    setUser(data);
    return data;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const updateUser = useCallback(async (patch) => {
    const updated = await api.updateUser(patch);
    setUser(updated);
    return updated;
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refresh, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
