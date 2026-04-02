import fs from 'fs';
import path from 'path';

const MAX_LOG_LINES = 5000;
const LOG_FILE_PATH = path.join(__dirname, '../../sis.log');
const HISTORY_LOG_PATH = path.join(__dirname, '../../sis_history.log');

let originalConsoleLog: typeof console.log;
let originalConsoleError: typeof console.error;

function countLogLines(): number {
  try {
    if (!fs.existsSync(LOG_FILE_PATH)) return 0;
    return fs.readFileSync(LOG_FILE_PATH, 'utf8').split('\n').length;
  } catch { return 0; }
}

function rotateLogFile() {
  try {
    const lineCount = countLogLines();
    if (lineCount > MAX_LOG_LINES) {
      const currentLogData = fs.readFileSync(LOG_FILE_PATH, 'utf8');
      fs.writeFileSync(HISTORY_LOG_PATH, currentLogData);
      const timestamp = new Date().toISOString();
      fs.writeFileSync(LOG_FILE_PATH, `[${timestamp}] LOG ROTATED: Previous ${lineCount} lines moved to sis_history.log\n`);
    }
  } catch (err) {
    if (originalConsoleError) originalConsoleError('Failed to rotate log file:', err);
  }
}

function formatArgs(args: any[]): string {
  return args.map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg).join(' ');
}

function enhancedConsoleLog(...args: any[]) {
  const message = formatArgs(args);
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE_PATH, `[${timestamp}] ${message}\n`);
    if (Math.random() < 0.01) rotateLogFile();
  } catch {}
  if (originalConsoleLog) originalConsoleLog.apply(console, args);
}

function enhancedConsoleError(...args: any[]) {
  const message = formatArgs(args);
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(LOG_FILE_PATH, `[${timestamp}] ERROR: ${message}\n`);
  } catch {}
  if (originalConsoleError) originalConsoleError.apply(console, args);
}

export function setupLogger() {
  originalConsoleLog = console.log;
  originalConsoleError = console.error;
  console.log = enhancedConsoleLog;
  console.error = enhancedConsoleError;
  console.log('Logger initialized - logging to sis.log with auto-rotation at', MAX_LOG_LINES, 'lines');
}
