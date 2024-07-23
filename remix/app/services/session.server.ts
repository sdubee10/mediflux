/** @format */

import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { ROLE } from "~/constant";
import { LoginForm, RegisgerForm, User } from "~/type";
import axios from "axios";

export async function login({ userId, password }: LoginForm) {
  try {
    const response = await axios.post("http://localhost:5000/api/login", { userId, password }, { withCredentials: true });
    if (response.status === 200) {
      return { status: response.status, user: response.data.user };
    }
  } catch (error: any) {
    return { status: error.response.status, message: error.response.data.message, errorType: error.response.data.errorType };
  }
}

// const sessionSecret = process.env.SESSION_SECRET;
const sessionSecret = "remxe12i2mfdmx";
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(user: User, redirectTo: string) {
  const session = await storage.getSession();
  session.set("id", user.id);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function register({ userId, password, role, firstName, lastName }: RegisgerForm) {
  try {
    let result = await axios.post("http://localhost:5000/register", { userId, password, role, firstName, lastName });
    return result;
  } catch (error: any) {
    return error.message;
  }
}

export async function getUserSession(request: Request) {
  const session = await storage.getSession(request.headers.get("Cookie"));
  return session.get("id") as string;
}

export async function checkSessionExists(request: Request) {
  let id = await getUserSession(request);
  if (!id) {
    return undefined;
  }
  return id;
}
