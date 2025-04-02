import React, { useState } from "react";
import Link from "next/link";
import Layout from "../components/common/layout";
import { sendResetLinkEmail } from "../../api/sendResetLinkEmail";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const result = await sendResetLinkEmail(email.trim());
    if (result.success) {
      setMessage("A reset link has been sent to your email.");
      setEmail("");
    } else {
      setError(result.error);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 sm:p-10 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold text-gray-800">Forgot your password?</h2>
            <p className="mt-2 text-sm text-gray-500">
              Enter your email and we’ll send you a reset link.
            </p>
          </div>

          {message && (
            <div className="text-green-600 text-sm text-center bg-green-50 border border-green-200 rounded px-3 py-2">
              {message}
            </div>
          )}
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-200"
            >
              Send Reset Link
            </button>
          </form>

          <div className="text-center">
            <Link href="/auth/login" className="text-sm text-green-600 hover:underline">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
