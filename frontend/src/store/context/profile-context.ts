import { createContext } from "react";

export interface ProfileContextType {
  tabName: string;
  setTabName: (name: string) => void;
}

export const ProfileContext = createContext<ProfileContextType>({
  tabName: "",
  setTabName: () => {
    /* no-op */
  },
});
