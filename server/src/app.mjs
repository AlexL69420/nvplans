import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import indexRouter from './routes/index.mjs'
import './strategies/local-strategy.mjs';

const app = express();
app.use(express.json({ limit: '10mb' })); 

app.use(cors({
    origin: 'https://mockingly-pumped-parakeet.cloudpub.ru', // Указываем домен фронтенда
    credentials: true, // Разрешаем отправку кук
    
  }));

// Обработка preflight-запросов
app.options('*', cors()); // Разрешаем preflight для всех маршрутов

// Настройка сессии с MemoryStore 
app.use(session({
  secret: "TzOu5>EbBayK",
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 60000 * 60 * 168,
    httpOnly: true,
    secure: false, // В production true
    sameSite: 'lax',
  },
  store: new session.MemoryStore() // только для разработки
}));
app.use(passport.initialize())
app.use(passport.session())

app.use(indexRouter);


const PORT = process.env.PORT || 5001;
app.listen(PORT, ()=>{
    console.log(`server listening on port ${PORT}`);
});
