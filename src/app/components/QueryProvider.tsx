'use client';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren, useState } from "react";

export const QueryProvider = ({children}: PropsWithChildren) => {
  const [ query_client ] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      }
    }
  }));
  return <QueryClientProvider client={query_client}>{children}</QueryClientProvider>
}