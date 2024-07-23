/** @format */

import { ROLE, SIDE_MENU } from "~/constant";
import { OverridableStringUnion } from "@mui/types";
import { ChipPropsColorOverrides } from "@mui/joy/Chip/ChipProps";
import { ServerUser } from "shared";

export type SideMenu = (typeof SIDE_MENU)[keyof typeof SIDE_MENU];
export type Role = (typeof ROLE)[keyof typeof ROLE];
export type User = {
  id: string;
  userid: string;
  name: string;
  image?: string;
  role?: Role;
};

export type PRecord = {
  id: string; // Unique record id
  checkInTime?: number; // TIMESTAMP (e.g., "14:08")
  chartNum?: string; // VARCHAR (15)
  patientName?: string; // VARCHAR (100)
  opReadiness?: OpReadiness; // BOOLEAN (e.g., "T", "F" interpreted as true/false)
  treatment1?: string; // VARCHAR (50)
  treatment2?: string; // VARCHAR (50), optional
  treatment3?: string; // VARCHAR (50), optional
  treatment4?: string; // VARCHAR (50), optional
  treatment5?: string; // VARCHAR (50), optional
  quantityTreat1?: number; // INTEGER
  quantityTreat2?: number; // INTEGER, optional
  quantityTreat3?: number; // INTEGER, optional
  quantityTreat4?: number; // INTEGER, optional
  quantityTreat5?: number; // INTEGER, optional
  treatmentRoom?: number; // INTEGER
  doctor?: string; // VARCHAR (50)
  anesthesiaNote?: string; // VARCHAR (300), optional
  skincareSpecialist1?: string; // VARCHAR (50)
  skincareSpecialist2?: string; // VARCHAR (50), optional
  nursingStaff1?: string; // VARCHAR (50)
  nursingStaff2?: string; // VARCHAR (50), optional
  coordinator?: string; // VARCHAR (50)
  consultant?: string; // VARCHAR (50)
  commentCaution?: string; // VARCHAR (300), optional
  LockingUser?: User | null;
  readyTime?: number;
  [key: string]: any;
};
export type TableType = "Ready" | "ExceptReady" | "Archive";
export type QueryDataName = "Ready_PRecord" | "ExceptReady_PRecord" | "Archive_PRecord";
export type ChipColor = OverridableStringUnion<"default" | "error" | "primary" | "secondary" | "info" | "success" | "warning", ChipPropsColorOverrides>;
export type OpReadiness = "Y" | "N" | "C" | "P";
export type SearchHelp = {
  id: string;
  group: string;
  title: string;
};
export type Interval = "day" | "week" | "month" | "year";
export type LoginForm = {
  userId: string;
  password: string;
};

export type RegisgerForm = {
  userId: string;
  password: string;
  role: string;
  firstName: string;
  lastName: string;
};

export type IdError = 1;
export type PasswordError = 2;
export type EtcError = 3;

export type LoginResponse = {
  errorType?: IdError | PasswordError | EtcError;
  message?: string;
  status: number;
  user: ServerUser;
};
