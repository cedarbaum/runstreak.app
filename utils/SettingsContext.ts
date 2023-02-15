import React, { createContext } from "react";

export type Settings = {
  distance_unit?: string;
  timezone?: string;
  min_distance?: number;
};

export type SettingsContextType = {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
};

export const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  setSettings: () => {},
});
