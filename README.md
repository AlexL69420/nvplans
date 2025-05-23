# Функционал

Веб-приложение реализует чат c языковой моделью (переобученной google/mt5-small). Есть возможность авторизации и регистрации и доступ к истории чатов для авторизованных пользователей. Есть возможность сменить пароль.

Стек решения:

- Клиентская часть была реализована с помощью React (TypeScript), используя такие фреймворки, как Tailwind.css, Flowbite и библиотеку Axios.
- Серверная часть была реализована с помощью Node.js (Express.js).
- База данных была реализована с помощью supabase (sql)
- Веб-приложение было задеплоено с помощью Cloud Pub: https://mockingly-pumped-parakeet.cloudpub.ru/ (если сайт не работает по ссылке, значит сервер отключён).

# Инструкция по запуску

Простой вариант: сайт доступен по следующему url: https://mockingly-pumped-parakeet.cloudpub.ru/

> Важно: сайт задеплоен с помощью аналога ngrok, перед переходом по ссылке нужно обратиться к разработчику приложения для того, чтобы он запустил сервер. Контакты: @FiredAgitator

Сложный вариант: задеплоить приложение самому

- Получить решение из гитхаба (например, с помощью git clone)
- Открыть папку client в терминале и ввести:
  - npm i
  - npm run dev
  - кликнуть на появившуюся ссылку (здесь можно будет посмотреть порт фронтенда)
- Открыть папку server в терминале и ввести:
  - npm i
- провести каналы от портов http://localhost:5001 и http://localhost:5173 (или другой порт фронтенда)
- заменить url фронтенда в файле server\src\app.mjs (на url канала от http://localhost:5173)
- заменить url бекенда в файле client\src\environment.ts (на url канала от http://localhost:5001)
- Загрузить модель из https://drive.google.com/drive/folders/1p5tqAvb4BdVHQK5Gyy8BtXrP7A5U9UFR?usp=drive_link и сохранить её на свой google drive.
- Открыть новый проект в google colab и вставить в ячейку код из файла code.txt
- Запустить ячайку, скопировать url сервера и вставить его в файл server\src\routes\answer.mjs вместо https://copy-exploring-ware-canal.trycloudflare.com/api/colab
- Открыть папку server в терминале и ввести:
  - npm start
- Наслаждаться работающим веб-сайтом

При возникновении проблем с использованией приложения обратитесь к разработчику.
Вот пара скриншотов интерфейса:
![screenshot 1](<Screenshot 2025-05-13 135146.png>)
![screenshot 2](<Screenshot 2025-05-13 135320.png>)
![screenshot 3](<Screenshot 2025-05-13 135516.png>)
