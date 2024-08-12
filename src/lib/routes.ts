export const ROOT = "/";
export const LOGIN = "/api/auth/signin";
export const LOGOUT = "/api/auth/signout";

export const ENTRY = "/entry";
export const JOURNALS = "/journals";

// const utils
export const PUBLIC_ROUTES = [ROOT, LOGIN, LOGOUT];
export const DEFAULT_REDIRECT = LOGIN;

// API for server-side requests
export const ROOT_APPLICATION = process.env.NEXTAUTH_URL;
export const API_ROUTE = ROOT_APPLICATION + "/api";
