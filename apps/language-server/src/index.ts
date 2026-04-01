import { createLanguageServer } from './server.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);

createLanguageServer(PORT);
