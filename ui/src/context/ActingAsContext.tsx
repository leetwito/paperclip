import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface ActingAsContextValue {
  actingAsId: string | null;
  setActingAsId: (id: string | null) => void;
}

const ActingAsContext = createContext<ActingAsContextValue | null>(null);

const KEY_PREFIX = "paperclip:acting-as:";

function storageKey(companyId: string) {
  return `${KEY_PREFIX}${companyId}`;
}

export function ActingAsProvider({
  companyId,
  children,
}: {
  companyId: string;
  children: ReactNode;
}) {
  const [actingAsId, setState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(storageKey(companyId));
  });

  // Reset state when company changes
  useEffect(() => {
    setState(localStorage.getItem(storageKey(companyId)));
  }, [companyId]);

  const setActingAsId = (id: string | null) => {
    setState(id);
    if (id) {
      localStorage.setItem(storageKey(companyId), id);
    } else {
      localStorage.removeItem(storageKey(companyId));
    }
  };

  return (
    <ActingAsContext.Provider value={{ actingAsId, setActingAsId }}>
      {children}
    </ActingAsContext.Provider>
  );
}

export function useActingAs(): ActingAsContextValue {
  const ctx = useContext(ActingAsContext);
  if (!ctx) throw new Error("useActingAs must be used inside ActingAsProvider");
  return ctx;
}
