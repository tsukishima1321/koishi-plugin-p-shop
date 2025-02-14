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

