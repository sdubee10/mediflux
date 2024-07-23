/** @format */

import { atom } from "recoil";
import { User } from "./type";

export const userState = atom<User | undefined>({
  key: "userState", // unique ID (with respect to other atoms/selectors)
  default: undefined, // default value (aka initial value)
});

export const sessionExpireModalOpenState = atom<boolean>({
  key: "sessionExpireModalOpenState",
  default: false,
});
