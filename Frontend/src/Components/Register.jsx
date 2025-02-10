import { use, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import UserRegistered from "./Subcomponent/UserRegistered";

const Home = () => {
  const navigate = useNavigate();
  const [User, setUser] = useState({
    email: "",
    username: "",
    password: "",
  });

  const [registered, setRegistered] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        // "https://chatapp-bzwq.onrender.com/api/register",
        "https://chat-rhd-89a61bcf5e5a.herokuapp.com/api/register",
        // "http://localhost:5000/api/register",
        User
      );

      if (response.status === 201) {
        setRegistered(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      console.error("Error during signup");
    }
  };

  return (
    <div className=" min-h-screen background  flex justify-center items-center">
      <div className=" mx-10 felx flex-col text-white font-bold text-3xl bg-slate-600  max-w-[600px] w-full min-h-[380px] m-auto rounded-xl ">
        <div className=" flex flex-col p-2 justify-center items-center min-h-[350px] ">
          {registered ? (
            <UserRegistered />
          ) : (
            <form
              className=" flex max-w-[300px] flex-col gap-2 "
              onSubmit={handleSubmit}
            >
              <div className="flex justify-center ">
                <h1 className="text-2xl  font-poppins-400 mb-2 ">SIGNUP</h1>
              </div>

              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                  <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                </svg>
                <input
                  type="email"
                  className="grow bg-transparent"
                  name="email"
                  placeholder="Email"
                  onChange={handleChange}
                  value={User.email}
                  required
                />
              </label>
              <label className="input input-bordered flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                </svg>
                <input
                  type="text"
                  className="grow"
                  placeholder="Username"
                  name="username"
                  onChange={handleChange}
                  value={User.username}
                  required
                />
              </label>
              <label className="input input-bordered flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="h-4 w-4 opacity-70"
                >
                  <path
                    fillRule="evenodd"
                    d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="password"
                  className="grow px-2"
                  name="password"
                  placeholder="Password"
                  onChange={handleChange}
                  value={User.password}
                  required
                />
              </label>
              <button
                type="submit"
                className="text-sm   bg-slate-400 rounded h-9 shadrop"
              >
                Submit
              </button>
              <p className="text-sm font-thin ">
                Already have an account?{" "}
                <Link
                  className="font-bold text-[#22c55e] hover:text-[#268e4d] "
                  to="/login"
                >
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
