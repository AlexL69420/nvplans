import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { LOCAL_API_URL } from "../environment";
import dataFormatter from "../services/dataFormatter";

interface Chat {
  id: number;
  title: string;
  firstMessage: string;
  createdAt: string;
  updatedAt?: string;
}

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: string; // Форматированная строка даты
  rawTimestamp?: string; // Опционально: оригинальная метка времени
  isError?: boolean;
  metadata?: object;
}

interface ChatProps {
  chatId?: number | null;
  onNewChatCreated?: (chat: Chat) => void; // Теперь передаем весь объект чата
  onChatChange?: (chatId: number | null) => void;
}

export default function Chat({
  chatId,
  onNewChatCreated,
  onChatChange,
}: ChatProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number | null>(
    chatId || null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentChatId(chatId || null);
  }, [chatId]);

  useEffect(() => {
    if (currentChatId !== null) {
      // Явная проверка на null
      loadChatMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const loadChatMessages = async (id: number) => {
    try {
      const response = await axios.get<ChatMessage[]>(
        `${LOCAL_API_URL}api/chatlogs/${id}/messages`,
        { withCredentials: true },
      );

      // Форматируем даты сообщений
      const formattedMessages = response.data.map((msg) => ({
        ...msg,
        timestamp: dataFormatter(msg.timestamp),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Ошибка при загрузке сообщений:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const tempMessageId = Date.now();
    const newMessage: ChatMessage = {
      id: tempMessageId,
      text: message,
      isUser: true,
      timestamp: dataFormatter(new Date()),
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      let chatIdToUpdate = currentChatId;

      // Создание нового чата (если нужно)
      if (!currentChatId && user) {
        const chatTitle =
          message.length > 50 ? `${message.substring(0, 47)}...` : message;

        const chatResponse = await axios.post<{ id: number }>(
          `${LOCAL_API_URL}api/chatlogs/`,
          { title: chatTitle },
          { withCredentials: true },
        );

        chatIdToUpdate = chatResponse.data.id;
        setCurrentChatId(chatIdToUpdate);

        const newChat: Chat = {
          id: chatIdToUpdate,
          title: chatTitle,
          firstMessage: message,
          createdAt: new Date().toISOString(),
        };

        onNewChatCreated?.(newChat);
        onChatChange?.(chatIdToUpdate);
      }

      // Для авторизованных пользователей
      if (user && chatIdToUpdate !== null) {
        // Сохраняем сообщение пользователя
        await axios.post(
          `${LOCAL_API_URL}api/chatlogs/${chatIdToUpdate}/messages`,
          { text: message, isUser: true },
          { withCredentials: true },
        );

        // Получаем ответ от модели
        const botResponse = await axios.post<{
          answer: string;
          processingTime: number;
        }>(
          `${LOCAL_API_URL}api/answer/`,
          {
            message,
          },
          {
            withCredentials: true,
            timeout: 15000,
          },
        );

        const botMessage: ChatMessage = {
          id: Date.now(),
          text: formatBotResponse(botResponse.data.answer),
          isUser: false,
          timestamp: dataFormatter(new Date()),
          metadata: {
            processingTime: botResponse.data.processingTime,
          },
        };

        // Обновляем UI
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempMessageId),
          { ...newMessage, id: Date.now() + 1 },
          botMessage,
        ]);

        // Сохраняем ответ бота
        await axios.post(
          `${LOCAL_API_URL}api/chatlogs/${chatIdToUpdate}/messages`,
          {
            text: botResponse.data.answer,
            isUser: false,
            metadata: botResponse.data,
          },
          { withCredentials: true },
        );
      }
      // Для неавторизованных
      else {
        const botResponse = await axios.post<{
          answer: string;
          processingTime: number;
        }>(
          `${LOCAL_API_URL}api/answer/`,
          {
            message,
          },
          { timeout: 15000 },
        );

        const botMessage: ChatMessage = {
          id: Date.now(),
          text: formatBotResponse(botResponse.data.answer),
          isUser: false,
          timestamp: dataFormatter(new Date()),
          metadata: {
            processingTime: botResponse.data.processingTime,
          },
        };

        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempMessageId),
          { ...newMessage, id: Date.now() + 1 },
          botMessage,
        ]);
      }
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);

      const errorMessage: ChatMessage = {
        id: Date.now(),
        text: "Извините, произошла ошибка. Попробуйте позже.",
        isUser: false,
        timestamp: dataFormatter(new Date()),
        isError: true,
      };

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempMessageId),
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Форматирование ответа модели
  const formatBotResponse = (text: string) => {
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br />")
      .replace(/```(.+?)```/gs, "<pre><code>$1</code></pre>");
  };
  // Автопрокрутка к новому сообщению
  /* 
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
*/

  return (
    <main className="flex h-[calc(100vh-6rem)] w-3/5 flex-col rounded bg-gradient-to-r from-emerald-200 to-emerald-500 px-2 py-3 text-black dark:from-slate-600 dark:to-slate-800 dark:text-white">
      {/* Контейнер сообщений с фиксированной высотой и скроллом */}
      <div className="scrollbar-light scrollbar-dark flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${msg.isUser ? "bg-emerald-600 text-white dark:bg-slate-600 dark:text-slate-200" : "bg-white text-gray-800 dark:bg-slate-900 dark:text-slate-200"}`}
              >
                <p className="break-words">{msg.text}</p>
                <p className="text-xs opacity-70">{msg.timestamp}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-white px-4 py-2 text-gray-800">
                <p className="italic">ожидание ответа...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Поле ввода (остаётся внизу) */}
      <div className="flex w-full items-center gap-2 p-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Введите сообщение..."
          className="flex-1 rounded-lg border border-emerald-300 px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:border-emerald-600 dark:bg-gray-800"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading}
          className={`rounded-lg px-4 py-2 font-medium ${!message.trim() || isLoading ? "cursor-not-allowed bg-gray-300" : "bg-emerald-600 text-white hover:cursor-pointer hover:bg-emerald-700 dark:bg-slate-900 dark:hover:bg-slate-700"}`}
        >
          Отправить
        </button>
      </div>
    </main>
  );
}
