import { ENTRY, JOURNALS } from "./lib/routes";

export {default} from "next-auth/middleware";

export const config = {
  matcher: [
    '/journals',
    '/entry',
  ]
}
