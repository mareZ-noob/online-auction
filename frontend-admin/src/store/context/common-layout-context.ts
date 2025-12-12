import { createContext } from "react";

export type CommonLayoutContextType = {
	tabName: string;
	subTabName: string;
	setTabName: (name: string) => void;
	setSubTabName: (name: string) => void;
};

export const CommonLayoutContext = createContext<CommonLayoutContextType>({
	tabName: "",
	subTabName: "",
	setTabName: () => {
		/* no-op */
	},
	setSubTabName: () => {
		/* no-op */
	},
});
