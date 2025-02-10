import React, { Suspense, lazy, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Loading from "./Components/Loading";

const Chat = lazy(() => import("./Components/Chat"));
const Register = lazy(() => import("./Components/Register"));
const Login = lazy(() => import("./Components/Login"));

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      { 
        path: "/",
        element: <Register />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "*",
        element: <h1>NO ROUTE</h1>,
      },
    ],
  },
]);

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      <AnimatePresence>
        {loading && <Loading onComplete={() => setLoading(false)} />}
      </AnimatePresence>
      {!loading && (
        <Suspense fallback={<Loading />}>
          <RouterProvider router={router} />
        </Suspense>
      )}
    </>
  );
}

export default App;
