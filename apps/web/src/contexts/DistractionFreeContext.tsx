import React, { createContext, useContext, useState } from 'react';

const DistractionFreeContext = createContext<{
  distractionFree: boolean;
  setDistractionFree: (v: boolean) => void;
}>(null as any);

export function DistractionFreeProvider({ children }: { children: React.ReactNode }) {
  const [distractionFree, setDistractionFree] = useState(false);
  return (
    <DistractionFreeContext.Provider value={{ distractionFree, setDistractionFree }}>
      {children}
    </DistractionFreeContext.Provider>
  );
}

export function useDistractionFree() {
  return useContext(DistractionFreeContext);
}
