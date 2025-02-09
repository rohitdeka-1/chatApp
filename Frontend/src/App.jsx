import React, { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Chat from "./Components/Chat";
import Register from "./Components/Register"
import Login from "./Components/Login";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        path: "/",
        element: <Register />,
      },
      {
        path:"/login",
        element: <Login/>
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
  return <RouterProvider router={router}></RouterProvider>;
}

export default App;
