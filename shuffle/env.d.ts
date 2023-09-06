namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_BASE_URL: string;
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    NEXT_PUBLIC_LOGROCKET_ID?: string;
    NEXT_PUBLIC_AMPLITUDE_API_KEY?: string;
    CLERK_SECRET_KEY: string;
    OPENAI_API_KEY: string;
  }
}
