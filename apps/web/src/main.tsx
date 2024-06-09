import React, { FC, useState } from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import { MainPage } from "./pages/main";
import reportWebVitals from "./reportWebVitals";
import { trpc } from "./trpc/server";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

const App: FC = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:5000/trpc",
        }),
      ],
      transformer: SuperJSON,
    }),
  );

  return (
    <React.StrictMode>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <MainPage />
        </QueryClientProvider>
      </trpc.Provider>
    </React.StrictMode>
  );
};

root.render(<App />);

reportWebVitals();
