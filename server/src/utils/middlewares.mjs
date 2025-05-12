
// Middleware для проверки авторизации
export const isAuthenticated = (req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session:', req.session);
    console.log('User:', req.user);
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ error: "Пользователь не авторизован" });
  };