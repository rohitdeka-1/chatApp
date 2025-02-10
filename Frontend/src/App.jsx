import React, { Suspense, lazy, useState, useEffect } from "react";
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "./Components/Loading";

const Chat = lazy(() => import("./Components/Chat"));
const Register = lazy(() => import("./Components/Register"));
const Login = lazy(() => import("./Components/Login"));

function App() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
        }
    }, []);

    const ProtectedRoute = ({ children }) => {
        if (!isLoggedIn) {
            return <Navigate to="/login" replace />;
        }
        return children;
    };

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
                    element: <Login setIsLoggedIn={setIsLoggedIn} />,
                },
                {
                    path: "/chat",
                    element: (
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "*",
                    element: <h1>NO ROUTE</h1>,
                },
            ],
        },
    ]);

    return (
        <>
            <AnimatePresence exitBeforeEnter>
                {loading && (
                    <Loading
                        key="loading" 
                        onComplete={() => setLoading(false)}
                    />
                )}
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
