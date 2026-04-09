"use client";

import { useState } from "react";
import { motion, easeOut, easeInOut } from "framer-motion"
import { ShoppingCart, ShoppingBag, Package } from "lucide-react";
const logoImage = "/assets/images/logo_final.png";
const leftImage = "/assets/images/leftsignin.png";

// Sử dụng easing function có sẵn của framer-motion

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const animationSpeed = 0.8;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6 * animationSpeed,
        ease: easeOut,
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
      transition: { duration: 0.5 * animationSpeed, ease: easeOut },
    },
  };

  const blobVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.7 * animationSpeed,
        ease: easeOut,
      },
    },
  };

  const buttonHoverVariants = {
    rest: { scale: 1 },
    hover: {
      scale: 1.03,
      transition: { duration: 0.2 * animationSpeed, ease: easeInOut },
    },
    tap: { scale: 0.98 },
  };

  const inputHoverVariants = {
    rest: { boxShadow: "0 0 0 rgba(0, 0, 0, 0)" },
    hover: {
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.3 * animationSpeed, ease: easeInOut },
    },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-50 p-4">
      <motion.div
        className="relative w-full max-w-4xl h-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl flex"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          boxShadow: "0 20px 60px rgba(32, 175, 178, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)"
        }}
      >
        {/* Left side with shopping cart icons and 3D image */}
        <div className="relative w-2/5 bg-white p-8 flex flex-col justify-center overflow-hidden" style={{
          background: "white",
          boxShadow: "inset 0 2px 20px rgba(255, 255, 255, 0.2)"
        }}>
          {/* Animated Shopping Cart Icons */}
          <motion.div
            className="absolute top-10 left-10 z-20"
            variants={blobVariants}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#ecf284] via-[#eff299] to-[#f2f2a5] opacity-90 flex items-center justify-center shadow-xl" style={{
              boxShadow: "0 8px 20px rgba(236, 242, 132, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.5)"
            }}>
              <ShoppingCart className="w-10 h-10 text-[#20afb2]" strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-20 right-[-30px] z-20"
            variants={blobVariants}
            animate={{
              y: [0, 20, 0],
              x: [0, -10, 0],
              rotate: [0, -15, 15, 0],
            }}
            transition={{
              delay: 0.2,
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#ecf284] via-[#eff299] to-[#f2f2a5] opacity-85 flex items-center justify-center shadow-xl" style={{
              boxShadow: "0 10px 30px rgba(236, 242, 132, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.5)"
            }}>
              <ShoppingBag className="w-16 h-16 text-[#20afb2]" strokeWidth={2.5} />
            </div>
          </motion.div>

          <motion.div
            className="absolute top-40 right-[-20px] z-20"
            variants={blobVariants}
            animate={{
              y: [0, -10, 10, 0],
              rotate: [0, 20, -10, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              delay: 0.4,
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ecf284] via-[#eff299] to-[#f2f2a5] opacity-90 flex items-center justify-center shadow-xl" style={{
              boxShadow: "0 8px 25px rgba(236, 242, 132, 0.45), inset 0 2px 10px rgba(255, 255, 255, 0.5)"
            }}>
              <Package className="w-12 h-12 text-[#20afb2]" strokeWidth={2.5} />
            </div>
          </motion.div>

          {/* 3D Ecommerce Image */}
          <motion.div
            className="relative z-10 mb-6 overflow-hidden "
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              boxShadow: "none"
            }}
          >
            <motion.img
              src={leftImage}
              alt="3D Shopping illustration"
              className="w-full h-56 object-cover"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.div
            className="absolute bottom-10 left-10 w-20 h-6 rounded-full opacity-70 z-10"
            style={{
              background: "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)",
              boxShadow: "0 4px 15px rgba(255, 255, 255, 0.3)"
            }}
            variants={blobVariants}
            animate={{
              x: [0, 10, 0],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              delay: 0.6,
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          ></motion.div>
        </div>

        {/* Right side with login form */}
        <motion.div
          className="w-3/5 p-10 flex flex-col justify-center"
          initial="hidden"
          animate="visible"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="relative h-16 w-16 flex items-center justify-center"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 0.95, 1],
                }}
                transition={{
                  duration: 4,
                  ease: easeInOut,
                  times: [0, 0.25, 0.75, 1],
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <motion.img
                  src={logoImage}
                  alt="Carevia logo"
                  className="h-16 w-16 object-contain drop-shadow-lg"
                  animate={{
                    y: [0, -2, 0],
                  }}
                  transition={{
                    duration: 2.6,
                    ease: easeInOut,
                    repeat: Infinity,
                  }}
                />
                {/* <motion.div
                  className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-br from-[#ecf284] to-[#f2f2a5] rounded-full"
                  style={{
                    boxShadow: "0 2px 8px rgba(236, 242, 132, 0.5)"
                  }}
                  animate={{
                    scale: [1, 1.4, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                /> */}
              </motion.div>
            </motion.div>
            
            <motion.h3 
              className="text-2xl font-semibold bg-gradient-to-r from-[#20afb2] to-[#10aeb2] bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              carevia
            </motion.h3>
          </div>

          <motion.div className="mb-8" variants={itemVariants}>
            <motion.h2
              className="text-4xl text-gray-700 font-medium mb-3"
            >
              My account
            </motion.h2>
            <motion.p className="text-xl text-gray-600">
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20afb2] focus:border-transparent transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)"
                    }}
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

            <motion.div
              className="flex items-center justify-between"
              variants={itemVariants}
            >
              <div className="flex items-center">
                <motion.input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded cursor-pointer border-gray-200 bg-gray-50 text-[#20afb2] focus:ring-[#20afb2] focus:ring-2 focus:ring-offset-0 transition-all"
                  style={{
                    accentColor: "#20afb2"
                  }}
                  whileTap={{ scale: 0.9 }}
                />
                <motion.label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                  whileHover={{ color: "#20afb2" }}
                >
                  Remember me
                </motion.label>
              </div>

              <div className="text-sm">
                <motion.a
                  href="/auth/forgotpassword"
                  className="transition-colors duration-200"
                  style={{ color: "#ff4162" }}
                  whileHover={{ x: 2, color: "#e63855" }}
                >
                  Forgot password?
                </motion.a>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20afb2] transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #20afb2 0%, #18adb0 50%, #10aeb2 100%)",
                  boxShadow: "0 8px 20px rgba(32, 175, 178, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
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
          >
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a
                href="/auth/signup"
                className="font-medium transition-colors duration-200"
                style={{ color: "#ff4162" }}
              >
                Sign up
              </a>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}