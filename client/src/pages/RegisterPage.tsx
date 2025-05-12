import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { LOCAL_API_URL } from "../environment";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "flowbite-react";

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${LOCAL_API_URL}api/users/register`,
        { username, password },
        { withCredentials: true },
      );

      login(response.data.user);
      navigate("/auth");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data.error || err.request
            ? "Ошибка сети"
            : "Произошла ошибка при отправке запроса",
        );
      } else {
        setError("Неизвестная ошибка");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-emerald-50 p-4 dark:bg-slate-800">
      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-700/90">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <Link to="/">
            <Button
              color="light"
              className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm hover:cursor-pointer hover:bg-emerald-200 dark:bg-slate-600 dark:text-emerald-300 dark:hover:bg-slate-500"
            >
              X
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center dark:from-slate-700 dark:to-slate-800">
          <h1 className="text-3xl font-bold text-white">Создать аккаунт</h1>
          <p className="mt-2 text-emerald-100 dark:text-slate-300">
            Присоединяйтесь к нашему сообществу
          </p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-100 p-3 text-center text-red-700 dark:bg-red-900/50 dark:text-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                placeholder="Введите имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-emerald-600/50"
                required
                minLength={3}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:focus:ring-emerald-600/50"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-lg bg-emerald-600 py-3 font-medium text-white transition duration-200 hover:cursor-pointer hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none disabled:opacity-70 dark:bg-slate-800 dark:hover:bg-slate-600 dark:focus:ring-slate-600"
            >
              {isLoading ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Обработка...
                </>
              ) : (
                "Зарегистрироваться"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-slate-400">
              Уже есть аккаунт?{" "}
              <Link
                to="/auth"
                className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Войти
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
