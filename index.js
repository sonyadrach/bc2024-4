const http = require('http');
const { Command } = require('commander');
const fs = require('fs/promises');
const path = require('path');

const program = new Command();

program
  .option('-h, --host <host>', 'server address', 'localhost')
  .option('-p, --port <port>', 'server port', 3000)
  .option('-c, --cache <path>', 'path to cache', './cache');

program.parse(process.argv);//аналіз даних

const { host, port, cache } = program.opts();

const server = http.createServer(async (req, res) => {
    //req об'єкт запиту res об'єкт відповідей
  const urlParts = req.url.split('/');// Розділяємо URL на частини
  const httpCode = urlParts[1]; // Отримуємо код HTTP з URL
  const filePath = path.join(cache, `${httpCode}.jpg`); // Формуємо шлях до файлу

  switch (req.method) {
    case 'GET':
      try {
        const data = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data);
      } catch (err) {
        if (err.code === 'ENOENT') {
            // Якщо файл не знайдено, запитуємо картинку з https://http.cat
            try {
              const response = await superagent.get(`https://http.cat/${httpCode}`);
              const imageBuffer = response.body; // Отримуємо буфер з відповіді
  
              // Зберігаємо картинку у кеш
              await fs.writeFile(filePath, imageBuffer);
              res.writeHead(200, { 'Content-Type': 'image/jpeg' }); // Встановлюємо заголовок відповіді
              res.end(imageBuffer); // Відправляємо картинку у відповіді
            } catch (fetchErr) {
              // Якщо запит завершився помилкою
              res.writeHead(404, { 'Content-Type': 'text/plain' }); // Файл не знайдено
              res.end('Not Found');
            }
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
        }
      }
      break;

      case 'PUT': 
      const chunks = []; // Масив для зберігання частин даних
      req.on('data', chunk => chunks.push(chunk)); // Збираємо частини даних
      req.on('end', async () => {
        const imageBuffer = Buffer.concat(chunks); // Об'єднуємо частини в один буфер
        await fs.writeFile(filePath, imageBuffer); // Записуємо буфер у файл
        res.writeHead(201, { 'Content-Type': 'text/plain' }); // Встановлюємо заголовок відповіді
        res.end('Created'); 
      });
      break;

      case 'DELETE': 
      try {
        await fs.unlink(filePath); // Видаляємо файл
        res.writeHead(200, { 'Content-Type': 'text/plain' }); // Встановлюємо заголовок відповіді
        res.end('Deleted'); 
      } catch (err) {
  
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' }); 
          res.end('Not Found');
        } else {
          res.writeHead(500, { 'Content-Type': 'text/plain' }); 
          res.end('Internal Server Error');
        }
      }
      break;

    default:
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Allowed');
  }
});

server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
