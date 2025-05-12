import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import supabase from "../utils/data.mjs";

// Сериализация пользователя 
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Десериализация пользователя
passport.deserializeUser(async (id, done) => {
  console.log('deserializing user with id:', id);
  
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      console.error('User not found during deserialization:', error);
      return done(null, false);
    }
    
    done(null, user);
  } catch (err) {
    console.error('Deserialization error:', err);
    done(err, null);
  }
});

// Локальная стратегия аутентификации
export default passport.use(
  new Strategy(async (username, password, done) => {
    try {
      // Ищем пользователя по username
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !user) {
        console.log('User not found:', username);
        return done(null, false, { message: "Пользователь не найден" });
      }

      // Проверяем пароль
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('Invalid password for user:', username);
        return done(null, false, { message: "Неверный пароль" });
      }

      console.log('User authenticated successfully:', username);
      done(null, user);
    } catch (err) {
      console.error('Authentication error:', err);
      done(err, null);
    }
  })
);