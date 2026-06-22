import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useForgotPassword } from "../../../features/auth/hooks/use-auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "../../../features/auth/schemas/auth.schemas";
import { environments } from "../../../config/environments";
import { Navbar } from "../../../components/Navbar";

export const ForgotPassword = () => {
  const forgotPasswordMutation = useForgotPassword();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = useCallback(
    async (values: ForgotPasswordFormValues) => {
      try {
        await forgotPasswordMutation.mutateAsync(values);
        setSubmitted(true);
      } catch {
      }
    },
    [forgotPasswordMutation],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950">
      <Navbar showPrimaryAction={false} />
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-stone-700/50">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
              {environments.APP_NAME}
            </h1>
            <p className="text-stone-400 text-center mb-8">Reset your password</p>

            {submitted ? (
              <div className="space-y-4 text-center">
                <p className="text-stone-200 text-sm leading-relaxed">
                  If an account exists for that email, we&apos;ve sent a password reset link.
                </p>
                <p className="text-stone-400 text-sm leading-relaxed">
                  Don&apos;t see it in your inbox? Check your spam or junk folder — the email can sometimes end up there.
                </p>
                <p className="text-stone-500 text-xs leading-relaxed">
                  The link expires in one hour. If you still can&apos;t find it, try requesting another reset link.
                </p>
                <Link
                  to="/login"
                  className="inline-block text-amber-400 hover:text-amber-300 font-medium text-sm pt-2"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-stone-300 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-amber-400">{errors.email.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-stone-600 disabled:to-stone-600 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
                >
                  {isSubmitting ? "Sending…" : "Send reset link"}
                </button>

                <p className="text-center text-stone-400 text-sm">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-amber-400 hover:text-amber-300 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
