import React, { createContext } from "react";

export type ApplicationContextType = {
  headerHeight: number;
  setHeaderHeight: (height: number) => void;
};

export const ApplicationContext = createContext<ApplicationContextType>({
  headerHeight: 0,
  setHeaderHeight: () => {},
});
