import express from 'express';
import { startAutoCancelSystem } from './autoCancel.js';

const app = express();
const PORT = process.env.PORT || 3000;

startAutoCancelSystem();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
