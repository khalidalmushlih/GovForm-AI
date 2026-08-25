declare module 'astro' {
  export interface APIContext {
    request: Request;
    params: Record<string, string | undefined>;
    locals: {
      runtime?: {
        env: Env;
      };
      [key: string]: any;
    };
    cookies: any;
    redirect: (path: string, status?: number) => Response;
    url: URL;
    site: URL | undefined;
    generator: string;
    props: Record<string, any>;
  }

  export type APIRoute = (context: APIContext) => Response | Promise<Response>;
}

declare module '@astrojs/cloudflare' {
  export interface Runtime<T> {
    env: T;
  }
  export default function cloudflare(options?: any): any;
}

declare module '@astrojs/react' {
  export default function react(options?: any): any;
}

declare module '@astrojs/tailwind' {
  export default function tailwind(options?: any): any;
}

interface D1Result<T = unknown> {
  results?: T[];
  success?: boolean;
  meta?: any;
  error?: string;
}

interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1Result>;
}

interface Env {
  DB?: D1Database;
  DOCUMENTS_BUCKET?: any;
  RATE_LIMIT_KV?: any;
  GEMINI_API_KEY?: string;
  ENVIRONMENT?: string;
  APP_NAME?: string;
}

declare namespace App {
  interface Locals {
    runtime?: {
      env: Env;
    };
    [key: string]: any;
  }
}
