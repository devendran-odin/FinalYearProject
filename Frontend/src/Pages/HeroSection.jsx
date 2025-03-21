import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <>
      <>
        {/* Hero */}
        <div className="relative overflow-hidden">
          {/* Gradients */}
          <div
            aria-hidden="true"
            className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
          >
            <div className="" />
            <div className="" />
          </div>
          {/* End Gradients */}
          <div className="relative z-10">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
              <div className="max-w-2xl text-center mx-auto">
                <p className="inline-block text-sm font-medium bg-clip-text bg-linear-to-l from-blue-600 to-violet-500 text-transparent dark:from-blue-400 dark:to-violet-400">
                  Learn. Connect. Grow.
                </p>
                {/* Title */}
                <div className="mt-5 max-w-4xl">
                  <h1 className="block font-semibold text-gray-800 text-4xl md:text-5xl lg:text-6xl dark:text-neutral-200">
                    Find the Right <span className="text-blue-700">Mentor</span>{" "}
                    to Guide Your Success!
                  </h1>
                </div>
                {/* End Title */}
                <div className="mt-5 max-w-3xl">
                  <p className="text-lg text-gray-600 dark:text-neutral-400">
                    Experience an interactive mentorship platform designed for
                    seamless learning, real time connections, and personalized
                    career growth across various fields
                  </p>
                </div>
                {/* Buttons */}
                <div className="mt-8 gap-3 flex justify-center">
                  <Link
                    className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:outline-hidden focus:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    to="/register"
                  >
                    Get started
                    <svg
                      className="shrink-0 size-4"
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
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </Link>
                  <Link
                    className="py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-transparent text-gray-800 bg-gray-100 hover:bg-gray-200 focus:outline-hidden focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
                    to="mentors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                    Explore Mentors
                  </Link>
                </div>
                {/* End Buttons */}
              </div>
            </div>
          </div>
        </div>
        {/* End Hero */}
      </>
    </>
  );
};

export default HeroSection;
