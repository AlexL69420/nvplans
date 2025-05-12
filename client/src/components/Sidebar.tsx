import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { LOCAL_API_URL } from "../environment";
import { formatChatDate } from "../services/dataFormatter";
import { Link } from "react-router-dom";
import { DarkThemeToggle } from "flowbite-react";

interface Chat {
  id: number;
  title: string;
  firstMessage: string;
  createdAt: string;
  updatedAt?: string;
}

interface UserHistoryProps {
  onChatSelect: (chatId: number | null) => void;
  currentChatId?: number | null;
  newChats?: Chat[];
}

export function UserHistory({
  onChatSelect,
  currentChatId,
  newChats = [],
}: UserHistoryProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadUserChats = async () => {
      try {
        const response = await axios.get<Chat[]>(
          `${LOCAL_API_URL}api/chatlogs/user`,
          { withCredentials: true },
        );

        const sortedChats = response.data.sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime(),
        );

        setChats(sortedChats);
      } catch (error) {
        console.error("Ошибка при загрузке чатов:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserChats();
  }, [user]);

  useEffect(() => {
    if (newChats.length > 0) {
      setChats((prev) => [
        ...newChats,
        ...prev.filter(
          (chat) => !newChats.some((newChat) => newChat.id === chat.id),
        ),
      ]);
    }
  }, [newChats]);

  const handleNewChat = () => onChatSelect(null);
  const handleChatSelect = (id: number) => onChatSelect(id);

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await axios.delete(`${LOCAL_API_URL}api/chatlogs/${chatId}`, {
        withCredentials: true,
      });

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      if (currentChatId === chatId) {
        onChatSelect(null);
      }
    } catch (error) {
      console.error("Ошибка при удалении чата:", error);
    }
  };

  const truncateText = (text: string, maxLength = 30) => {
    return text.length > maxLength
      ? `${text.substring(0, maxLength - 3)}...`
      : text;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {!isCollapsed && (
        <aside className="flex min-w-64 flex-col border-r border-gray-200 bg-emerald-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          {/* Обновленный блок с логотипом и переключателем темы */}
          <div className="mb-4 rounded-lg bg-white p-3 shadow-sm dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <a
                href="https://github.com/AlexL69420/nvplans"
                className="group flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 group-hover:bg-emerald-200 dark:bg-slate-700 dark:group-hover:bg-slate-600">
                  <img
                    src="https://i.pinimg.com/736x/8b/6b/98/8b6b987316a515a6c4d77684e32cccc7.jpg"
                    className="h-8 w-8 rounded-full object-cover"
                    alt="logo"
                  />
                </div>
                <span className="text-xl font-semibold text-emerald-600 group-hover:text-emerald-700 dark:text-emerald-400 dark:group-hover:text-emerald-300">
                  NVPlans
                </span>
              </a>
              <DarkThemeToggle className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:cursor-pointer hover:bg-emerald-200 hover:text-emerald-700 dark:bg-slate-700 dark:text-emerald-400 dark:hover:bg-slate-600 dark:hover:text-emerald-300" />
            </div>
          </div>

          <header className="mb-4 flex w-full flex-col items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              История чатов
            </h2>
            <button
              onClick={handleNewChat}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:cursor-pointer hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-700 dark:hover:bg-slate-600 dark:focus:ring-slate-600"
              aria-label="Создать новый чат"
            >
              Новый чат
            </button>
          </header>

          {!user ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <p className="text-gray-700 dark:text-gray-300">
                Войдите, чтобы видеть вашу историю
              </p>
            </div>
          ) : loading ? (
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent dark:border-slate-600"></div>
            </div>
          ) : (
            <ul className="scrollbar-light scrollbar-dark flex-1 space-y-2 overflow-y-auto rounded-lg p-1">
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => handleChatSelect(chat.id)}
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    chat.id === currentChatId
                      ? "border-emerald-500 bg-emerald-100 shadow-md dark:border-slate-600 dark:bg-slate-700"
                      : "border-gray-200 bg-white hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                  }`}
                  aria-current={chat.id === currentChatId ? "true" : undefined}
                >
                  <div className="flex flex-col">
                    <div className="flex items-start justify-between">
                      <h3 className="line-clamp-2 font-medium text-gray-800 dark:text-gray-200">
                        {truncateText(chat.firstMessage || chat.title)}
                      </h3>
                      <button
                        onClick={(e) => handleDeleteChat(chat.id, e)}
                        className="ml-2 rounded-full p-1 text-gray-400 hover:cursor-pointer hover:bg-gray-200 hover:text-red-500 dark:hover:bg-slate-600 dark:hover:text-red-400"
                        aria-label="Удалить чат"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatChatDate(chat.updatedAt || chat.createdAt)}
                      </span>
                      {chat.id === currentChatId && (
                        <span className="h-2 w-2 rounded-full bg-emerald-600 dark:bg-slate-400" />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 border-t border-gray-200 pt-3 dark:border-slate-700">
            <Link
              to="/profile"
              className="flex items-center justify-center gap-2 rounded-lg p-2 transition-colors hover:bg-emerald-100 dark:hover:bg-slate-700"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-medium text-white dark:bg-slate-700">
                {user?.username ? user.username.charAt(0).toUpperCase() : "?"}
              </div>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {user?.username || "Авторизация"}
              </span>
            </Link>
          </div>
        </aside>
      )}

      <button
        onClick={toggleCollapse}
        className={`flex h-10 items-center justify-center self-center rounded-r-lg bg-emerald-600 px-1.5 transition-colors hover:cursor-pointer hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:outline-none dark:bg-slate-900 dark:hover:bg-slate-600 dark:focus:ring-slate-600 ${
          isCollapsed ? "ml-0" : "-ml-1"
        }`}
        aria-label={
          isCollapsed ? "Развернуть историю чатов" : "Свернуть историю чатов"
        }
      >
        <span className="text-lg font-bold text-white">
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>
      </button>
    </div>
  );
}
