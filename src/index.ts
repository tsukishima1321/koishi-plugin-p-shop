import { Context, Schema } from 'koishi'
import { ShopService } from './shop';
import { decrypt, encrypt } from './utils';
export const name = 'p-shop'

export const usage = `
- **指令：p-shop**\n
    别名：p点商店\n
    `;

export const inject = {
  required: ['database'],
  optional: ['puppeteer'],
}

export interface Config {
  dataDir: string
  secretKey: string
}

export const Config: Schema<Config> = Schema.object({
  dataDir: Schema.string().default("./data").description("数据目录"),
  secretKey: Schema.string().default('abc').role('secret').description("加密用密钥"),
})


export function apply(ctx: Context, cfg: Config) {
  const shop = new ShopService(ctx, cfg)
  ctx.command('p/p-shop <id>').alias('查看商店')
    .action(async ({ session }, id = '') => {
      if (ctx.puppeteer && !shop.puppeteerReady()) {
        shop.setPuppeteer(ctx.puppeteer)
      }
      return await shop.viewShop(session.userId, id)
    })
  ctx.command('p/p-bag').alias('查看背包')
    .action(async ({ session }) => {
      if (ctx.puppeteer && !shop.puppeteerReady()) {
        shop.setPuppeteer(ctx.puppeteer)
      }
      return await shop.viewBag(session.userId)
    })
  ctx.command('p/p-buy <id> [amount:number]').alias('购买道具')
    .action(async ({ session }, id, amount = 1) => { return await shop.buyItem(ctx, session.userId, id, amount) })
  ctx.command('p/p-sell <id> [amount:number]').alias('出售道具')
    .action(async ({ session }, id, amount = 1) => { return await shop.sellItem(ctx, session.userId, id, amount) })
  ctx.command('p/p-use <id> [...args]').alias('使用道具')
    .action(async ({ session }, id, ...args) => { return await shop.useItem(cfg, ctx, session.userId, id, args) })
  ctx.command('p/p-item <id>').alias('查看道具')
    .action(async ({ session }, id) => {
      if (ctx.puppeteer && !shop.puppeteerReady()) {
        shop.setPuppeteer(ctx.puppeteer)
      }
      return await shop.viewItem(session.userId, id)
    })
  ctx.command('p/p-encrypt <text> <id>', '加密', { authority: 5 })
    .alias('加密')
    .action(async ({ session }, text, id) => { return encrypt(encrypt(text, id), cfg.secretKey) })
  ctx.command('p/p-decrypt <text> <id>', '解密', { authority: 5 })
    .alias('解密')
    .action(async ({ session }, text, id) => { return decrypt(decrypt(text, cfg.secretKey), id) })
}
