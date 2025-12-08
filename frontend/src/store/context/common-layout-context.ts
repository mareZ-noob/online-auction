import { createContext } from "react";

export type CommonLayoutContextType = {
  isActiveFilter: boolean;
  setIsActiveFilter: (active: boolean) => void;
};

export const CommonLayoutContext = createContext<CommonLayoutContextType>({
  isActiveFilter: false,
  setIsActiveFilter: () => {
    /* no-op */
  },
});
