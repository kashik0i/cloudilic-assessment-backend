import type { AppContainer } from "./container";
import type { Logger } from "pino";

declare global {
  namespace Express {
    interface Request {
      container?: AppContainer;
      log?: Logger;
      id?: string;
    }
  }
}

export {};
