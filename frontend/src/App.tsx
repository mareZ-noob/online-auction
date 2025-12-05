import { RouterProvider } from "react-router-dom";
import router from "./routes/router.tsx";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "./lib/utils.ts";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
