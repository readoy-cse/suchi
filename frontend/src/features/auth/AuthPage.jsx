import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth.js";

export function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(event) {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isRegister) {
        await register({ name: values.name, email: values.email, password: values.password });
      } else {
        await login({ email: values.email, password: values.password });
      }
      navigate("/", { replace: true });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f4f4ef] text-[#17392f] md:grid-cols-[minmax(300px,0.82fr)_1.18fr]">
      <aside className="flex flex-col justify-between bg-[#17392f] px-8 py-8 text-[#f4f4ef] sm:px-12 sm:py-12 md:min-h-screen md:px-14 md:py-14">
        <Link className="flex w-fit items-center gap-3" to="/login" aria-label="Suchi home">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#d6ef79] text-xl font-extrabold text-[#17392f]">S</span>
          <span className="text-[15px] font-bold tracking-[0.16em]">SUCHI</span>
        </Link>
        <div className="my-12 max-w-sm">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#d6ef79]">Campus, in context</p>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Light up every update.</h1>
          <p className="mt-5 text-sm leading-6 text-white/65">A thoughtful home for the things happening in your academic world.</p>
        </div>
        <p className="text-xs text-white/55">Built for your class community</p>
      </aside>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">{isRegister ? "Create student account" : "Welcome back"}</p>
          <h2 className="mt-3 font-display text-3xl font-semibold">{isRegister ? "Join Suchi" : "Sign in to Suchi"}</h2>
          <p className="mt-2 text-sm leading-6 text-[#63756d]">{isRegister ? "Register with your academic email to get started." : "Use your registered email and password."}</p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="name">Full name</label>
                <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id="name" name="name" autoComplete="name" minLength={2} maxLength={80} required value={values.name} onChange={updateField} />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="email">Email</label>
              <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id="email" name="email" type="email" autoComplete="email" maxLength={254} required value={values.email} onChange={updateField} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium" htmlFor="password">Password</label>
              <input className="w-full rounded-lg border border-[#cbd4cb] bg-white px-3.5 py-3 text-sm outline-none focus:border-[#45835e] focus:ring-2 focus:ring-[#45835e]/20" id="password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} maxLength={72} required value={values.password} onChange={updateField} />
              {isRegister && <p className="mt-1.5 text-xs text-[#849189]">Use at least 8 characters.</p>}
            </div>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <button className="w-full rounded-lg bg-[#17392f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#245444] focus:outline-none focus:ring-2 focus:ring-[#a75a3b] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={submitting}>
              {submitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-sm text-[#63756d]">
            {isRegister ? "Already registered? " : "New to Suchi? "}
            <Link className="font-semibold text-[#245444] underline decoration-[#9aa99e] underline-offset-4 hover:text-[#a75a3b]" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Sign in" : "Create a student account"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}