"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Неверный email или пароль");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (error) {
      setError("Произошла ошибка при входе");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-purple mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-montserrat font-bold text-white">
            Админ панель
          </h1>
          <p className="text-gray-400 mt-2">District 9 Wiki</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                  text-white placeholder:text-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                  transition-all duration-200"
                placeholder="admin@district9.ru"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                  text-white placeholder:text-gray-500 
                  focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50
                  transition-all duration-200"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 gradient-purple text-white font-semibold rounded-lg 
              hover:opacity-90 transition-opacity duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Вход...
              </>
            ) : (
              "Войти"
            )}
          </button>

          <div className="text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-purple-400 transition-colors">
              ← Вернуться на сайт
            </a>
          </div>
        </form>

        {/* Test credentials hint */}
        <div className="mt-6 glass rounded-lg p-4">
          <p className="text-xs text-gray-400 text-center">
            Тестовые данные для входа:<br />
            Email: <span className="text-purple-400">admin@district9.ru</span><br />
            Пароль: <span className="text-purple-400">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
