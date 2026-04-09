"use client";

import { useState } from "react";
import { motion, easeOut, easeInOut } from "framer-motion";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const animationSpeed = 0.8;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement signup logic here
    console.log("Signup attempt with:", { name, email, password });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6 * animationSpeed,
        staggerChildren: 0.1 * animationSpeed,
        delayChildren: 0,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 * animationSpeed },
    },
  };

  const blobVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: custom < 3 ? 0.8 : 0.6,
      transition: {
        duration: 0.7 * animationSpeed,
        delay: custom * 0.1 * animationSpeed,
        ease: "easeOut" as const,
      },
    }),
  };

  // Hover animations
  const buttonHoverVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 * animationSpeed },
    },
    tap: { scale: 0.98 },
  };

  const inputHoverVariants = {
    rest: { boxShadow: "0 0 0 rgba(0, 0, 0, 0)" },
    hover: {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.3 * animationSpeed },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-4 overflow-hidden">
      {/* Background blob shapes - absolute positioned within the container */}
      <motion.div
        className="fixed top-[15%] left-[10%] w-64 h-64 rounded-full opacity-70"
        style={{
          background: "linear-gradient(135deg, #ecf284 0%, #eff299 50%, #f2f2a5 100%)",
          animation: "blobMove 25s ease-in-out infinite",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
        custom={0}
      ></motion.div>

      <motion.div
        className="fixed bottom-[20%] left-[20%] w-96 h-96 rounded-full opacity-60"
        style={{
          background: "linear-gradient(135deg, rgba(32, 175, 178, 0.2) 0%, rgba(16, 174, 178, 0.3) 100%)",
          animation: "blobFloatLarge 30s ease-in-out infinite alternate",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
        custom={1}
      ></motion.div>

      <motion.div
        className="fixed top-[30%] right-[15%] w-72 h-72 rounded-full opacity-50"
        style={{
          background: "linear-gradient(135deg, #ecf284 0%, #eff299 50%, #f2f2a5 100%)",
          animation: "blobPulse 18s ease-in-out infinite",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
        custom={2}
      ></motion.div>

      <motion.div
        className="fixed top-[70%] right-[25%] w-40 h-40 rounded-full bg-white opacity-30"
        style={{
          animation: "blobSpin 22s linear infinite",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
        custom={3}
      ></motion.div>

      <motion.div
        className="fixed top-[10%] right-[30%] w-24 h-24 rounded-full opacity-70"
        style={{
          background: "linear-gradient(135deg, rgba(32, 175, 178, 0.3) 0%, rgba(16, 174, 178, 0.4) 100%)",
          animation: "blobBounce 12s ease-in-out infinite",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
        custom={4}
      ></motion.div>

      {/* Form container */}
      <motion.div
        className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl"
        style={{
          boxShadow: "0 20px 60px rgba(32, 175, 178, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)"
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="p-10">
          <motion.div className="mb-8" variants={itemVariants}>
            <motion.h2
              className="text-4xl text-gray-700 font-medium mb-2"
            >
              Create Account
            </motion.h2>
            <motion.p className="text-lg text-gray-600">
              Join Carevia community
            </motion.p>
          </motion.div>

          <form onSubmit={handleSignup} className="space-y-5">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <motion.div
                className="relative"
                variants={inputHoverVariants}
                initial="rest"
                whileHover="hover"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20afb2] focus:border-transparent transition-all duration-300"
                  style={{
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                  }}
                  placeholder="Jane Doe"
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
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
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20afb2] focus:border-transparent transition-all duration-300"
                  style={{
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                  }}
                  placeholder="your@email.com"
                  required
                />
              </motion.div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20afb2] focus:border-transparent transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                    }}
                    placeholder="••••••••"
                    required
                  />
                </motion.div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <motion.div
                  className="relative"
                  variants={inputHoverVariants}
                  initial="rest"
                  whileHover="hover"
                >
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20afb2] focus:border-transparent transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                    }}
                    placeholder="••••••••"
                    required
                  />
                </motion.div>
              </motion.div>
            </div>

            <motion.div className="pt-2" variants={itemVariants}>
              <div className="flex items-start">
                <motion.input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 mt-1 rounded cursor-pointer border-gray-200 bg-gray-50 text-[#20afb2] focus:ring-[#20afb2] focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{
                    accentColor: "#20afb2"
                  }}
                  required
                  whileTap={{ scale: 0.9 }}
                />
                <motion.label
                  htmlFor="terms"
                  className="ml-2 block text-sm text-gray-600 cursor-pointer"
                  whileHover={{ color: "#20afb2" }}
                >
                  I agree to the{" "}
                  <a
                    href="#"
                    className="transition-colors duration-200"
                    style={{ color: "#20afb2" }}
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="#"
                    className="transition-colors duration-200"
                    style={{ color: "#20afb2" }}
                  >
                    Privacy Policy
                  </a>
                </motion.label>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20afb2] transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #20afb2 0%, #18adb0 50%, #10aeb2 100%)",
                  boxShadow: "0 8px 20px rgba(32, 175, 178, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Create Account
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

            <motion.div
              className="mt-6 text-center"
              variants={itemVariants}
              transition={{ delay: 0.2 }}
            >
              <p className="text-gray-600">
                Already have an account?{" "}
                <a
                  href="/auth/signin"
                  className="font-medium transition-colors duration-200"
                  style={{ color: "#ff4162" }}
                >
                  Sign in
                </a>
              </p>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>

      {/* Add custom animation keyframes */}
      <style jsx global>{`
        @keyframes blobMove {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(40px, -30px);
          }
          50% {
            transform: translate(-20px, 40px);
          }
          75% {
            transform: translate(30px, 20px);
          }
        }

        @keyframes blobFloatLarge {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-40px, -30px) scale(1.1);
          }
        }

        @keyframes blobPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.7;
          }
        }

        @keyframes blobSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes blobBounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-40px);
          }
        }
      `}</style>
    </div>
  );
}