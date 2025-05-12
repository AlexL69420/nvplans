import { useState } from "react";
import Chat from "./components/Chat";
import { MyFooter } from "./components/Footer";
import { UserHistory } from "./components/Sidebar";

interface Chat {
  id: number;
  title: string;
  firstMessage: string;
  createdAt: string;
  updatedAt?: string;
}

export default function App() {
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [newChats, setNewChats] = useState<Chat[]>([]);

  const handleNewChatCreated = (chat: Chat) => {
    setNewChats((prev) => [...prev, chat]);
    setCurrentChatId(chat.id);
  };

  return (
    <main className="flex min-h-screen flex-col items-center gap-2 bg-white bg-cover bg-center bg-no-repeat dark:bg-slate-700">
      <div className="flex min-h-screen min-w-screen flex-row gap-4 px-2 py-6 dark:text-white">
        <UserHistory
          onChatSelect={setCurrentChatId}
          currentChatId={currentChatId}
          newChats={newChats}
        />
        <div className="flex w-full justify-center">
          <Chat
            chatId={currentChatId}
            onNewChatCreated={handleNewChatCreated}
            onChatChange={setCurrentChatId}
          />
        </div>
      </div>
      <MyFooter />
    </main>
  );
}
