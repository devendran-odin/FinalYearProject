import logo from "../assets/Logo1.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token); // Set true if token exists
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    setIsAuthenticated(false); // Update state
    navigate("/login"); // Redirect to login page
  };

  return (
    <>
      {/* ========== HEADER ========== */}
      <header className="sticky top-4 inset-x-0 flex flex-wrap md:justify-start md:flex-nowrap z-50 w-full before:absolute before:inset-0 before:max-w-5xl before:mx-2 lg:before:mx-auto before:rounded-full before:bg-neutral-50 before:backdrop-blur-md ">
        <nav className="relative max-w-5xl w-full py-2.5 ps-5 pe-2 md:flex md:items-center md:justify-between md:py-0 mx-2 lg:mx-auto  border border-blue-200 rounded-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {/* Logo */}
              <a
                className="flex-none rounded-md text-xl inline-block font-semibold focus:outline-hidden focus:opacity-80"
                href="/"
                aria-label="Preline"
              >
                <img src={logo} alt="" className="w-40 h-12" />
              </a>

              {/* End Logo */}
              <div className="ms-1 sm:ms-2"></div>
            </div>
            <div className="md:hidden">
              <button
                type="button"
                className="hs-collapse-toggle size-8 flex justify-center items-center text-sm font-semibold rounded-full bg-neutral-800 text-white disabled:opacity-50 disabled:pointer-events-none"
                id="hs-navbar-floating-dark-collapse"
                aria-expanded="false"
                aria-controls="hs-navbar-floating-dark"
                aria-label="Toggle navigation"
                data-hs-collapse="#hs-navbar-floating-dark"
              >
                <svg
                  className="hs-collapse-open:hidden shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1={3} x2={21} y1={6} y2={6} />
                  <line x1={3} x2={21} y1={12} y2={12} />
                  <line x1={3} x2={21} y1={18} y2={18} />
                </svg>
                <svg
                  className="hs-collapse-open:block hidden shrink-0 size-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>
          {/* Collapse */}
          <div
            id="hs-navbar-floating-dark"
            className="hs-collapse hidden overflow-hidden transition-all duration-300 basis-full grow md:block"
            aria-labelledby="hs-navbar-floating-dark-collapse"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-end gap-y-3 py-2 md:py-0 md:ps-7">
              <a
                className="pe-3 ps-px sm:px-3 md:py-4 text-sm text-gray-900 hover:text-gray-500 "
                href=""
              >
                About us
              </a>
              <Link
                className="pe-3 ps-px sm:px-3 md:py-4 text-sm text-gray-900 hover:text-gray-500 "
                to="/chat"
              >
                AI Chat
              </Link>
              <Link
                className="pe-3 ps-px sm:px-3 md:py-4 text-sm text-gray-900 hover:text-gray-500 "
                to="/mentors"
              >
                Mentors
              </Link>
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-900 hover:text-gray-500 ml-1 mr-4 "
                  >
                    Logout
                  </button>
                  <Link
                    to="/profile"
                    className="py-2 px-4 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition"
                  >
                    Profile
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm ml-1 mr-4 text-gray-900 hover:text-gray-500"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="py-2 px-4 bg-blue-600 text-white text-sm rounded-full"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* End Collapse */}
        </nav>
      </header>
      {/* ========== END HEADER ========== */}
    </>
  );
};

export default Navbar;
