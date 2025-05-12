import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-r from-emerald-100 to-emerald-500 text-black dark:from-emerald-500 dark:to-emerald-800 dark:text-white">
      <div className="flex flex-col items-center gap-2 rounded-2xl border bg-sky-100 p-8 dark:bg-sky-950">
        <div className="font-mono text-2xl">Ошибка: страница не найдена :C</div>
        <Link to="/" className="text-xl font-semibold underline">
          перейти на главную страницу
        </Link>
      </div>
    </main>
  );
}
