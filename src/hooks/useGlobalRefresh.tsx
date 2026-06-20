import React, { createContext, useContext, useState, useCallback } from 'react';

interface RefreshCtx {
  refreshKey: number;
  refreshing: boolean;
  triggerRefresh: () => void;
}

const Ctx = createContext<RefreshCtx>({
  refreshKey: 0,
  refreshing: false,
  triggerRefresh: () => {},
});

export function useGlobalRefresh() {
  return useContext(Ctx);
}

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <Ctx.Provider value={{ refreshKey, refreshing, triggerRefresh }}>
      {children}
    </Ctx.Provider>
  );
}
