import { Router } from "express";
import supabase from "../utils/data.mjs";
import passport from "passport";
import "../strategies/local-strategy.mjs";
import bcrypt from "bcrypt";
import { isAuthenticated } from "../utils/middlewares.mjs";

const router = Router();

// Регистрация
router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Проверка уникальности username
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .maybeSingle();

        if (userError) throw userError;
        if (existingUser) {
            return res.status(400).json({ error: "Имя пользователя уже занято" });
        }

        // Хэширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ username, password: hashedPassword }])
            .select()
            .single();

        if (insertError) throw insertError;

        res.status(201).json(newUser);
    } catch (err) {
        console.error("Ошибка при создании пользователя:", err);
        res.status(500).json({ error: "Ошибка при создании пользователя" });
    }
});

// Изменение пароля
router.put("/change-password", isAuthenticated, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // Получаем текущий пароль пользователя
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('password')
            .eq('id', userId)
            .single();

        if (userError) throw userError;
        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        // Проверяем старый пароль
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Неверный старый пароль" });
        }

        // Хэшируем новый пароль
        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        // Обновляем пароль
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: newPasswordHash })
            .eq('id', userId);

        if (updateError) throw updateError;

        res.status(200).json({ message: "Пароль успешно изменён" });
    } catch (err) {
        console.error("Ошибка при изменении пароля:", err);
        res.status(500).json({ error: "Ошибка при изменении пароля" });
    }
});

// Вход в аккаунт 
router.post("/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json({ message: "Успешный вход", user: req.user });
});

// Выход из профиля 
router.post("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Ошибка при выходе из профиля" });
        }
        res.status(200).json({ message: "Успешный выход" });
    });
});

export default router;