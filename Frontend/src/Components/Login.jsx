import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const Login = () => {

  const navigate = useNavigate();

  const [User, setUser] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        // "https://chatapp-bzwq.onrender.com/api/login",
        "https://chat-rhd-89a61bcf5e5a.herokuapp.com/api/login",
        // "http://localhost:5000/api/login",
        User
      );

      if(response.status===200){
        navigate("/chat")
      }
      console.log("Login Success:", response.data);
    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="  min-h-screen background flex justify-center items-center">
      <div className=" mx-10 felx flex-col text-white font-bold text-3xl bg-slate-600 max-w-[600px] w-full min-h-[380px] m-auto rounded-xl ">
        <div className=" flex flex-col p-2 justify-center items-center min-h-[350px] ">
          <h1 className="text-2xl font-poppins-400 mb-5 ">LOGIN</h1>
          <form
            className=" flex max-w-[300px] flex-col gap-2 "
            onSubmit={handleSubmit}
          >
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
              />
            </label>
            <button
              type="submit"
              className="text-sm bg-slate-400 rounded h-9 bg shadrop"
            >
              Submit
            </button>
            <p className="text-sm font-thin">
              Don't have an account?{" "}
              <Link
                to="/"
                className="font-bold text-[#22c55e] hover:text-[#268e4d]"
              >
                Register
              </Link>{" "}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
