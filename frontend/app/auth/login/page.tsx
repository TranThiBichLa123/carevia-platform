"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const animationSpeed = 0.8;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement login logic here
    console.log("Login attempt with:", { email, password });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6 * animationSpeed,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1 * animationSpeed,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 * animationSpeed, ease: "easeOut" },
    },
  };

  const blobVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.7 * animationSpeed,
        ease: "easeOut",
      },
    },
  };

  // Hover animations
  const buttonHoverVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 * animationSpeed, ease: "easeInOut" },
    },
    tap: { scale: 0.98 },
  };

  const inputHoverVariants = {
    rest: { boxShadow: "0 0 0 rgba(0, 0, 0, 0)" },
    hover: {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.3 * animationSpeed, ease: "easeInOut" },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        className="relative w-full max-w-4xl h-[600px] bg-white rounded-3xl overflow-hidden shadow-lg flex"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        layoutId="authCard"
        layout
      >
        {/* Left side with blob design */}
        <div className="relative w-2/5 bg-amber-300 p-8 flex flex-col justify-center overflow-hidden">
          <motion.div
            className="absolute top-10 left-10 w-24 h-24 rounded-full bg-pink-200 opacity-80"
            variants={blobVariants}
            style={{
              animation: "snakeMove 15s ease-in-out infinite",
            }}
          ></motion.div>

          <motion.div
            className="absolute bottom-20 right-[-50px] w-40 h-40 bg-pink-200 rounded-full"
            variants={blobVariants}
            transition={{ delay: 0.2 }}
            style={{
              animation: "snakeFloat 20s ease-in-out infinite",
            }}
          ></motion.div>

          <motion.div
            className="absolute top-40 right-[-30px] w-32 h-20 bg-amber-100 rounded-full"
            variants={blobVariants}
            transition={{ delay: 0.4 }}
          ></motion.div>

          <motion.h1
            className="text-7xl font-bold text-white mb-4 relative z-10"
            variants={itemVariants}
          >
            Blob
            <br />
            login
          </motion.h1>

          <motion.div
            className="absolute bottom-10 left-10 w-20 h-6 bg-white rounded-full opacity-70"
            variants={blobVariants}
            transition={{ delay: 0.6 }}
          ></motion.div>
        </div>

        <style jsx global>{`
          @keyframes snakeMove {
            0%,
            100% {
              transform: translate(0, 0);
            }
            20% {
              transform: translate(15px, 15px);
            }
            40% {
              transform: translate(-10px, 25px);
            }
            60% {
              transform: translate(10px, 5px);
            }
            80% {
              transform: translate(-5px, -15px);
            }
          }

          @keyframes snakeFloat {
            0%,
            100% {
              transform: translate(0, 0) rotate(0deg);
            }
            25% {
              transform: translate(-15px, -20px) rotate(10deg);
            }
            50% {
              transform: translate(10px, -30px) rotate(-5deg);
            }
            75% {
              transform: translate(5px, -10px) rotate(5deg);
            }
          }

          @keyframes snakeWiggle {
            0%,
            100% {
              transform: translate(0, 0) skew(0deg);
            }
            20% {
              transform: translate(10px, -8px) skew(3deg);
            }
            40% {
              transform: translate(-15px, 5px) skew(-3deg);
            }
            60% {
              transform: translate(15px, 10px) skew(2deg);
            }
            80% {
              transform: translate(-10px, -5px) skew(-2deg);
            }
          }
        `}</style>

        {/* Right side with login form */}
        <motion.div
          className="w-3/5 p-10 flex flex-col justify-center"
          variants={containerVariants}
          layout
        >
          <div className="flex items-start">
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 0.95, 1],
                }}
                transition={{
                  duration: 4,
                  ease: "easeInOut",
                  times: [0, 0.25, 0.75, 1],
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <motion.svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <motion.path
                    d="M12 2L18 6V18L12 22L6 18V6L12 2Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                  />
                  <motion.path
                    d="M12 8L16 10.5V15.5L12 18L8 15.5V10.5L12 8Z"
                    fill="white"
                    strokeWidth="0.5"
                    stroke="white"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.7 }}
                  />
                </motion.svg>
                <motion.div
                  className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full"
                  animate={{
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>

          <motion.div className="mb-8" variants={itemVariants} layout>
            <motion.h2
              className="text-4xl text-gray-700 font-medium mb-3"
              layoutId="formTitle"
            >
              My account
            </motion.h2>
            <motion.p className="text-xl text-gray-600" layoutId="formSubtitle">
              Sign in to continue
            </motion.p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <motion.div
                  className="relative"
                  variants={inputHoverVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300"
                    placeholder="your@email.com"
                    required
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <motion.div
                  className="relative"
                  variants={inputHoverVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-all duration-300"
                    placeholder="••••••••"
                    required
                  />
                </motion.div>
              </motion.div>
            </div>

            <motion.div
              className="flex items-center justify-between"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <motion.input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-500 focus:ring-amber-400 border-gray-300 rounded cursor-pointer"
                  whileTap={{ scale: 0.9 }}
                />
                <motion.label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                  whileHover={{ color: "#F0A500" }}
                >
                  Remember me
                </motion.label>
              </div>

              <div className="text-sm">
                <motion.div whileHover={{ x: 2 }}>
                  <Link
                    href="/auth/forgot-password"
                    className="text-amber-500 hover:text-amber-600 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                layoutId="authButton"
              >
                Sign in
                <motion.svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  initial={{ x: 0 }}
                  whileHover={{ x: 3 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </motion.svg>
              </motion.button>
            </motion.div>
          </form>

          <motion.div
            className="mt-8 text-center"
            variants={itemVariants}
            transition={{ delay: 0.2 }}
            layoutId="authFooter"
          >
            <p className="text-gray-600">
              Don't have an account?{" "}
              <motion.span whileHover={{ scale: 1.05 }}>
                <Link
                  href="/auth/register"
                  className="text-amber-500 hover:text-amber-600 font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
