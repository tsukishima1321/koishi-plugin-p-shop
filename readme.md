# koishi-plugin-p-shop

[![npm](https://img.shields.io/npm/v/koishi-plugin-p-shop?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-p-shop) [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://choosealicense.com/licenses/mit/) ![Language](https://img.shields.io/badge/language-TypeScript-brightgreen) ![Static Badge](https://img.shields.io/badge/QQ交流群-2167028216-green)

# p-shop 插件文档

基于 Koishi 框架的 P点商店插件（[satori-ai](https://github.com/gfjdh/koishi-plugin-satori-ai)及[p-qiandao](https://github.com/gfjdh/koishi-plugin-p-qiandao)的拓展功能），提供道具购买、出售、使用及背包管理功能，包含多种趣味道具及好感度互动机制。

---

## 功能列表
- **商店系统**：查看/购买道具、好感度限制
- **背包管理**：查看道具、出售、使用
- **道具交互**：符卡抽奖、记忆删除、好感度操作等
- **自定义配置**：支持通过 JSON 文件扩展道具

---

## 安装与配置
### 前置要求
- 已安装 Koishi 框架
- 启用 `database` 数据库服务
- 已使用 [satori-ai](https://github.com/gfjdh/koishi-plugin-satori-ai)及[p-qiandao](https://github.com/gfjdh/koishi-plugin-p-qiandao) 插件

### 安装插件
```bash
npm install koishi-plugin-p-shop
# 或通过 Koishi 插件市场安装
```

### 基础配置
```yaml
# koishi.yml
plugins:
  p-shop:
    dataDir: "./data"  # 数据存储目录
```

---

## 指令说明
| 指令示例                | 别名       | 功能                     | 参数说明              |
|-------------------------|------------|--------------------------|-----------------------|
| `p/p-shop <id>`         | 查看商店   | 查看商品列表或单个详情   | `id`: 道具ID（可选） |
| `p/p-bag`               | 查看背包   | 显示背包内所有道具       | -                     |
| `p/p-buy <id> [amount]` | 购买道具   | 购买指定数量的道具       | `amount`: 数量（默认1）|
| `p/p-sell <id> [amount]`| 出售道具   | 出售指定数量的道具       | `amount`: 数量（默认1）|
| `p/p-use <id> [...args]`| 使用道具   | 使用道具并触发效果       | `args`: 额外参数      |
| `p/p-item <id>`         | 查看道具   | 显示道具详细信息         | -                     |

---

## 核心道具列表
### 1. 空白符卡
- **效果**: 随机获得 SSR/SR/R/N 等级符卡
- **彩蛋**: 有 2% 概率抽到垃圾符卡 (GG级)

### 2. 消忆药水
- **效果**: 删除包含指定关键词的记忆
- **限制**: 关键词必须为2个字

### 3. 败者食尘
- **效果**: 清空所有好感度与记忆

### 4. 订婚戒指
- **动态定价**: 根据好感度动态定价
- **效果**: 佩戴后修改对话交互逻辑
- **彩蛋**: 出售已佩戴戒指会触发特殊提示

### 5. 心碎魔药
- **效果**:
  - 首次使用：好感度降至 -99999
  - 再次使用：恢复原好感度

---

## 高级配置
### 自定义道具
1. 在 `data/p-shop.json` 中添加或修改配置：
```json
{
  "新道具ID": {
    "price": 5000,
    "maxStack": 5,
    "description": "自定义道具描述",
    "favorability": 100
  }
}
```
2. 重启插件生效

### 数据目录结构
```
data/
├─ p-shop.json       # 自定义道具配置
└─ satori_ai/dialogues/*.txt  # 用户记忆数据
```

---

## 问题反馈
如有问题请提交 Issue 至 [GitHub仓库](https://github.com/your-repo-url)
