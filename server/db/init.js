/**
 * Script khởi tạo database
 */

import { initDatabase } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔄 Initializing database...');
initDatabase();
console.log('✅ Done!');
