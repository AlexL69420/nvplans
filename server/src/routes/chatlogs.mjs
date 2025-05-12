import { Router } from "express";
import supabase from "../utils/data.mjs"; 
import { isAuthenticated } from "../utils/middlewares.mjs";

const router = Router();

// Создание нового чата
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { title } = req.body;
        const userId = req.user.id;

        // Создаем чат
        const { data: chat, error: chatError } = await supabase
            .from('chatlogs')
            .insert([{ title }])
            .select('id, title, created_at')
            .single();

        if (chatError) throw chatError;

        // Связываем чат с пользователем
        const { error: linkError } = await supabase
            .from('user_chatlogs')
            .insert([{ user_id: userId, chatlog_id: chat.id }]);

        if (linkError) throw linkError;

        res.status(201).json({
            id: chat.id,
            title: chat.title,
            createdAt: chat.created_at
        });
    } catch (err) {
        console.error("Ошибка при создании чата:", err);
        res.status(500).json({ error: "Ошибка при создании чата" });
    }
});

// Просмотр всех чатлогов пользователя
router.get("/user/:id", isAuthenticated, async (req, res) => {
    const userId = req.params.id;

    try {
        const { data, error } = await supabase
            .from('chatlogs')
            .select('*')
            .in('id', 
                supabase
                    .from('user_chatlogs')
                    .select('chatlog_id')
                    .eq('user_id', userId)
            )
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        console.error("Ошибка при получении чатлогов:", err);
        res.status(500).json({ error: "Ошибка при получении чатлогов" });
    }
});

// Удаление всех чатлогов пользователя
router.delete("/user/:id", isAuthenticated, async (req, res) => {
    const userId = req.params.id;

    if (req.user.id.toString() !== userId) {
        return res.status(403).json({ error: "Нельзя удалять чужие чатлоги" });
    }

    try {
        // Получаем все chatlog_id пользователя
        const { data: chatlogs, error: chatlogsError } = await supabase
            .from('user_chatlogs')
            .select('chatlog_id')
            .eq('user_id', userId);

        if (chatlogsError) throw chatlogsError;

        const chatlogIds = chatlogs.map(row => row.chatlog_id);

        // Удаляем связи пользователя с чатлогами
        const { error: deleteLinksError } = await supabase
            .from('user_chatlogs')
            .delete()
            .eq('user_id', userId);

        if (deleteLinksError) throw deleteLinksError;

        // Удаляем чатлоги, если на них нет других ссылок
        const { error: deleteChatsError } = await supabase
            .from('chatlogs')
            .delete()
            .in('id', chatlogIds)
            .not('id', 'in', 
                supabase
                    .from('user_chatlogs')
                    .select('chatlog_id')
                    .in('chatlog_id', chatlogIds)
            );

        if (deleteChatsError) throw deleteChatsError;

        res.status(200).json({ message: "Все чатлоги пользователя успешно удалены" });
    } catch (err) {
        console.error("Ошибка при удалении чатлогов:", err);
        res.status(500).json({ error: "Ошибка при удалении чатлогов" });
    }
});

// Удаление чата
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const chatId = req.params.id;
        const userId = req.user.id;

        // Проверяем доступ
        const { data: access, error: accessError } = await supabase
            .from('user_chatlogs')
            .select()
            .eq('user_id', userId)
            .eq('chatlog_id', chatId);

        if (accessError) throw accessError;
        if (access.length === 0) {
            return res.status(403).json({ error: "Нет доступа к чату" });
        }

        // Удаляем сообщения чата
        const { error: deleteMessagesError } = await supabase
            .from('messages')
            .delete()
            .eq('chat_id', chatId);

        if (deleteMessagesError) throw deleteMessagesError;

        // Удаляем связь пользователя с чатом
        const { error: deleteLinkError } = await supabase
            .from('user_chatlogs')
            .delete()
            .eq('user_id', userId)
            .eq('chatlog_id', chatId);

        if (deleteLinkError) throw deleteLinkError;

        // Проверяем другие связи
        const { data: otherUsers, error: usersError } = await supabase
            .from('user_chatlogs')
            .select()
            .eq('chatlog_id', chatId);

        if (usersError) throw usersError;

        // Если других пользователей нет - удаляем чат
        if (otherUsers.length === 0) {
            const { error: deleteChatError } = await supabase
                .from('chatlogs')
                .delete()
                .eq('id', chatId);

            if (deleteChatError) throw deleteChatError;
        }

        res.status(200).json({ message: "Чат успешно удален" });
    } catch (err) {
        console.error("Ошибка при удалении чата:", err);
        res.status(500).json({ error: "Ошибка при удалении чата" });
    }
});

// Получение чатов пользователя с первым сообщением
router.get('/user', isAuthenticated, async (req, res) => {
    try {
        // Сначала получаем список chatlog_id для пользователя
        const { data: userChatlogs, error: userChatlogsError } = await supabase
            .from('user_chatlogs')
            .select('chatlog_id')
            .eq('user_id', req.user.id);

        if (userChatlogsError) throw userChatlogsError;

        const chatlogIds = userChatlogs.map(item => item.chatlog_id);

        // Затем получаем чаты с первым сообщением
        const { data: chats, error: chatsError } = await supabase
            .from('chatlogs')
            .select(`
                id, 
                title, 
                created_at,
                updated_at,
                messages (
                    text
                )
            `)
            .in('id', chatlogIds)
            .order('updated_at', { ascending: false });

        if (chatsError) throw chatsError;

        // Форматируем данные
        const formattedData = chats.map(chat => ({
            id: chat.id,
            title: chat.title,
            firstMessage: chat.messages?.[0]?.text || null,
            createdAt: chat.created_at,
            updatedAt: chat.updated_at
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Ошибка при получении чатов:", err);
        res.status(500).json({ error: "Ошибка при получении чатов" });
    }
});

// Получение сообщений чата
router.get('/:id/messages', isAuthenticated, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select(`
                id, 
                text, 
                is_user, 
                created_at
            `)
            .eq('chat_id', req.params.id)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Преобразуем данные после получения
        const formattedData = data.map(message => ({
            id: message.id,
            text: message.text,
            isUser: message.is_user, // преобразуем snake_case в camelCase
            timestamp: message.created_at
        }));

        res.json(formattedData);
    } catch (err) {
        console.error("Ошибка при получении сообщений:", err);
        res.status(500).json({ error: "Ошибка при получении сообщений" });
    }
});

// Добавление сообщения в чат
router.post('/:chatId/messages', isAuthenticated, async (req, res) => {
    try {
        // Проверка доступа
        const { data: access, error: accessError } = await supabase
            .from('user_chatlogs')
            .select()
            .eq('user_id', req.user.id)
            .eq('chatlog_id', req.params.chatId);

        if (accessError) throw accessError;
        if (access.length === 0) {
            return res.status(403).json({ error: "Нет доступа к чату" });
        }

        const { text, isUser } = req.body;

        // Добавляем сообщение
        const { data: message, error: messageError } = await supabase
            .from('messages')
            .insert([{ 
                chat_id: req.params.chatId, 
                text, 
                is_user: isUser 
            }])
            .select()
            .single();

        if (messageError) throw messageError;

        // Обновляем время модификации чата
        const { error: updateError } = await supabase
            .from('chatlogs')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', req.params.chatId);

        if (updateError) throw updateError;

        res.status(201).json(message);
    } catch (err) {
        console.error("Ошибка при сохранении сообщения:", err);
        res.status(500).json({ error: "Ошибка при сохранении сообщения" });
    }
});

// Ответ модели для авторизованных пользователей
router.post('/respond', isAuthenticated, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ 
                reply: "Message cannot be empty",
                processingTime: 0
            });
        }

        const startTime = Date.now();
        
        // Отправляем запрос в Colab-сервер
        const colabResponse = await axios.post(
            'https://copy-exploring-ware-canal.trycloudflare.com/api/colab',
            { message },
            { timeout: 15000 }
        );

        const processingTime = Date.now() - startTime;

        // Форматируем ответ согласно ожиданиям фронтенда
        res.status(200).json({
            answer: colabResponse.data.response || colabResponse.data, // Учитываем разные форматы ответа
            processingTime
        });

    } catch (error) {
        const processingTime = error.response?.data?.processingTime || 0;
        res.status(500).json({ 
            error: error.message,
            processingTime
        });
    }
});
export default router;