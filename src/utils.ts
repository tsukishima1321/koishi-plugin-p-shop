// ==================== 辅助函数 ====================
import { MemoryEntry, ShopItem } from './types'
import { ITEMS } from './items'
import fs from 'fs'
import path from 'path'

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// 确保文件存在
export async function ensureShopFile(filePath: string): Promise<void> {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  const initShop = { ...ITEMS }
  const initShopString = JSON.stringify(initShop, null, 2)
  if (!fs.existsSync(filePath)) { fs.writeFileSync(filePath, initShopString, 'utf-8') }
}

// 加载文件
export async function loadShopFile(filePath: string): Promise<Record<string, Partial<ShopItem>>> {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

// 加载记忆文件
export async function loadMemoryFile(userId: string): Promise<MemoryEntry[]> {
  const memoriesPath = path.join('./data/satori_ai/dialogues', `${userId}.txt`)
  fs.mkdirSync(path.dirname(memoriesPath), { recursive: true })
  if (!fs.existsSync(memoriesPath)) { fs.writeFileSync(memoriesPath, '[]', 'utf-8') }
  return JSON.parse(fs.readFileSync(memoriesPath, 'utf-8'))
}
// 写入记忆文件
export async function writeMemoryFile(userId: string, content: MemoryEntry[]): Promise<void> {
  const memoriesPath = path.join('./data/satori_ai/dialogues', `${userId}.txt`)
  fs.writeFileSync(memoriesPath, JSON.stringify(content, null, 2), 'utf-8')
}


// ================== Base64 实现 ==================
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// Base64 编码（手动实现）
function customBtoa(str: string): string {
  let result = '';
  let buffer = 0;
  let bitsRemaining = 0;

  for (let i = 0; i < str.length; i++) {
    buffer = (buffer << 8) | str.charCodeAt(i);
    bitsRemaining += 8;

    while (bitsRemaining >= 6) {
      bitsRemaining -= 6;
      const index = (buffer >> bitsRemaining) & 0x3f;
      result += BASE64_CHARS[index];
    }
  }

  // 处理剩余 bits
  if (bitsRemaining > 0) {
    buffer <<= 6 - bitsRemaining;
    const index = buffer & 0x3f;
    result += BASE64_CHARS[index];
  }

  // 添加 padding
  const padding = (4 - (result.length % 4)) % 4;
  return result + '='.repeat(padding);
}

// Base64 解码（手动实现）
function customAtob(base64: string): string {
  base64 = base64.replace(/=+$/, '');
  let result = '';
  let buffer = 0;
  let bitsStored = 0;

  for (const char of base64) {
    const index = BASE64_CHARS.indexOf(char);
    if (index === -1) throw new Error('Invalid Base64 character');

    buffer = (buffer << 6) | index;
    bitsStored += 6;

    if (bitsStored >= 8) {
      bitsStored -= 8;
      const byte = (buffer >> bitsStored) & 0xff;
      result += String.fromCharCode(byte);
    }
  }

  return result;
}

// ================== 加密/解密核心 ==================
/**
 * XOR 加密/解密核心函数
 * （由于 XOR 特性，加密和解密使用相同逻辑）
 */
function processText(text: string, key: string): string {
  if (key.length === 0) throw new Error("密钥不能为空");

  return Array.from(text)
    .map((char, index) => {
      const keyChar = key[index % key.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0))
    })
    .join('');
}

// ================== 对外接口 ==================
export function encrypt(plainText: string, key: string): string {
  const encrypted = processText(plainText, key);
  return customBtoa(encrypted);
}

export function decrypt(cipherText: string, key: string): string {
  const decoded = customAtob(cipherText);
  return processText(decoded, key);
}
