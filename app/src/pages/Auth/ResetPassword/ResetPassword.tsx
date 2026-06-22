import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useResetPassword } from "../../../features/auth/hooks/use-auth";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "../../../features/auth/schemas/auth.schemas";
import { environments } from "../../../config/environments";
import { Navbar } from "../../../components/Navbar";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = useCallback(
    async (values: ResetPasswordFormValues) => {
      if (!token) {
        return;
      }

      try {
        await resetPasswordMutation.mutateAsync({
          token,
          new_password: values.password,
        });
        navigate("/login", { replace: true });
      } catch {
      }
    },
    [resetPasswordMutation, token, navigate],
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950">
        <Navbar showPrimaryAction={false} />
        <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-stone-700/50 text-center">
              <h1 className="text-2xl font-bold text-stone-100 mb-4">Invalid reset link</h1>
              <p className="text-stone-400 text-sm mb-6">
                This password reset link is missing or invalid. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="text-amber-400 hover:text-amber-300 font-medium text-sm"
              >
                Request a new link
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950">
      <Navbar showPrimaryAction={false} />
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-stone-800/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-stone-700/50">
            <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 bg-clip-text text-transparent">
              {environments.APP_NAME}
            </h1>
            <p className="text-stone-400 text-center mb-8">Choose a new password</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-300 mb-2"
                >
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-amber-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-stone-300 mb-2"
                >
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-stone-900/50 border border-stone-600 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-amber-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-stone-600 disabled:to-stone-600 disabled:cursor-not-allowed text-stone-900 font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/25"
              >
                {isSubmitting ? "Resetting…" : "Reset password"}
              </button>

              <p className="text-center text-stone-400 text-sm">
                <Link
                  to="/login"
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
