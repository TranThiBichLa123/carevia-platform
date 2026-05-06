"use client";

import { useState } from "react";
import { motion, easeOut, easeInOut } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const animationSpeed = 0.8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password reset requested for:", email);
    setIsSubmitted(true);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-blue-50 p-4 overflow-hidden">
      {/* Animated Background Blobs */}
      {/* <motion.div
        className="fixed top-[10%] left-[15%] w-72 h-72 rounded-full opacity-60"
        style={{
          background: "linear-gradient(135deg, #ecf284 0%, #eff299 50%, #f2f2a5 100%)",
          animation: "blobFloat1 20s ease-in-out infinite alternate",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
      ></motion.div> */}

      {/* <motion.div
        className="fixed bottom-[15%] right-[10%] w-96 h-96 rounded-full opacity-50"
        style={{
          background: "linear-gradient(135deg, rgba(32, 175, 178, 0.2) 0%, rgba(16, 174, 178, 0.3) 100%)",
          animation: "blobFloat2 25s ease-in-out infinite alternate",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
      ></motion.div> */}

      {/* <motion.div
        className="fixed top-[50%] right-[20%] w-48 h-48 rounded-full opacity-40"
        style={{
          background: "linear-gradient(135deg, #ecf284 0%, #eff299 50%, #f2f2a5 100%)",
          animation: "blobPulse 15s ease-in-out infinite",
        }}
        variants={blobVariants}
        initial="hidden"
        animate="visible"
      ></motion.div> */}

      {/* Main Container */}
      <motion.div
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl"
        style={{
          boxShadow: "0 20px 60px rgba(32, 175, 178, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1)"
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="p-10">
          {/* Icon and Header */}
          <motion.div className="flex flex-col items-center mb-8" variants={itemVariants}>
            <motion.div
              className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6"
             
              animate={{
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Mail className="w-10 h-10 text-[var(--primary)]" strokeWidth={2.5} />
            </motion.div>

            {!isSubmitted ? (
              <>
                <motion.h2
                  className="text-4xl text-gray-700 font-medium mb-3 text-center"
                >
                  Quên mật khẩu?
                </motion.h2>
                <motion.p className="text-base text-gray-600 text-center">
                  Không sao! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-16 h-16 text-[#20afb2] mb-4" strokeWidth={2} />
                </motion.div>
                <motion.h2
                  className="text-3xl text-gray-700 font-medium mb-3 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Kiểm tra email của bạn!
                </motion.h2>
                <motion.p
                  className="text-base text-gray-600 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  We've sent password reset instructions to <strong>{email}</strong>
                </motion.p>
              </>
            )}
          </motion.div>

          {/* Form or Success Message */}
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ email
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
                <motion.button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20afb2] transition-all duration-200"
                  style={{
                    background: "var(--primary)",
                    boxShadow: "0 8px 20px rgba(32, 175, 178, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
                  }}
                  variants={buttonHoverVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Gửi lại email
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
          ) : (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                onClick={() => setIsSubmitted(false)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#20afb2] transition-all duration-200"
                style={{
                  background: "var(--primary)",
                  boxShadow: "0 8px 20px rgba(32, 175, 178, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)"
                }}
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Gửi lại email
              </motion.button>

              <motion.p className="text-sm text-gray-600 text-center">
                Không nhận được email? Kiểm tra thư mục spam hoặc thử một địa chỉ email khác.
              </motion.p>
            </motion.div>
          )}

          {/* Back to Login */}
          <motion.div
            className="mt-8 text-center"
            variants={itemVariants}
            transition={{ delay: 0.2 }}
          >
            <motion.a
              href="/auth/signin"
              className="inline-flex items-center text-gray-700 transition-colors duration-200 group"
              whileHover={{ x: -3 }}
            >
              <ArrowLeft className="w-4 h-4 mr-2 text-[var(--primary)] group-hover:text-[var(--primary-hover)] transition-colors" />
              <span className="group-hover:text-[var(--primary-hover)]">Quay lại đăng nhập</span>
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Custom Animation Keyframes */}
      <style jsx global>{`
        @keyframes blobFloat1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(30px, -40px) scale(1.1);
          }
        }

        @keyframes blobFloat2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-40px, 30px) scale(1.15);
          }
        }

        @keyframes blobPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
}
