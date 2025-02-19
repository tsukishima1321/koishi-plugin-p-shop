import Puppeteer, { } from 'koishi-plugin-puppeteer'
import { ShopItem, UserItem } from './types'
import path from 'path'

// 生成资源路径
const fontGenJyuuGothic = path.resolve(__dirname, 'renderer/fonts/GenJyuuGothic-Normal-2.ttf').split('\\').join('/')
const fontJiangxiZK = path.resolve(__dirname, 'renderer/fonts/JiangxiZK.ttf').split('\\').join('/')
const fontKosugiMaru = path.resolve(__dirname, 'renderer/fonts/KosugiMaru-Regular.ttf').split('\\').join('/')
const backItemboard = path.resolve(__dirname, 'renderer/itemboard.png').split('\\').join('/')
const backDockback = path.resolve(__dirname, 'renderer/dockback.png').split('\\').join('/')
const backDockBoard = path.resolve(__dirname, 'renderer/dockboard.png').split('\\').join('/')
const imgSatoriKomeiji_1 = path.resolve(__dirname, 'renderer/SatoriKomeiji_1.webp').split('\\').join('/')
const imgSatoriKomeiji_2 = path.resolve(__dirname, 'renderer/SatoriKomeiji_2.webp').split('\\').join('/')
const imgDialogue = path.resolve(__dirname, 'renderer/dialogue.png').split('\\').join('/')


export const renderViewShop = async (pup: Puppeteer, items: ShopItem[], targetItem?: ShopItem): Promise<string> => {
    const itemsHtml = items.map((item) => {
        const icon = path.resolve(__dirname, 'renderer/itemicon/' + item.id + ".png")
        const name = item.id
        const price = item.price
        const itemHtml = `
<div class="item">
    <div class="icon"><img class="imgicon" src="${icon}"></div>
    <div class="column">
        <div class="des">${name}</div>
        <div class="price">${price}p</div>
    </div>
</div>`
        return itemHtml
    }).join('')
    let dialogue = "欢迎光临，这里是地灵殿的商店，有什么需要的尽管说吧。"
    let satori = imgSatoriKomeiji_1
    if (targetItem) {
        satori = imgSatoriKomeiji_1
        dialogue = `这是${targetItem.id}，价格为${targetItem.price}p，${targetItem.description}`
    }
    const html = `
<html>
<body>
<div class="body">
    <div class="head"></div>
    <div class="middle">
        <div class="wrapper">
            ${itemsHtml}
        </div>
        <div class="ava"><img src="${satori}"></div>
    </div>
    <div class="foot">
        <div class="detail">${dialogue}</div>
    </div>
</div>
</body>
</html>

<style>
@font-face {
    font-family: GenJyuuGothic;
    src: url('${fontGenJyuuGothic}');
}
@font-face {
    font-family: JiangxiZK;
    src: url('${fontJiangxiZK}');
}
@font-face {
    font-family: KosugiMaru;
    src: url('${fontKosugiMaru}');
}
body {
    width: 680px;
    display: inline-block;
    min-height: 350px;
}
.head {
    height: 10px;
}
.body {
    width: 680px;
    background: #FFE4B5;
    display: flex;
    flex-direction: column;
}
.middle {
    display: flex;
    flex-direction: row;
}
.ava {
    margin-top: auto;
    width: 200px;
    height: 400px;
    text-align: center;
}
.ava img {
    image-rendering: pixelated;
    margin-left: -130px;
    padding-bottom: 20px;
    width: 200%;
    object-fit: cover;
    overflow: visible;
    overflow-y: hidden;
}
.wrapper {
    border-radius: 5px;
    margin-left: 10px;
    background: url('${backDockback}');
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 460px;
    justify-content: flex-start;
    align-content: flex-start;
    min-height: 350px;
}
.foot {
    margin-left: 5px;
    margin-right: 5px;
    margin-top: -20px;
    height:100px;
    opacity: 0.9;
    background: url('${imgDialogue}') no-repeat;
    background-size: 100% 100%;
}
.detail {
    font-family: GenJyuuGothic;
    color: white;
    padding-top: 20px;
    padding-left: 20px;
}

.item {
    width: 200px;
    height: 70px;
    margin: 6px;
    background: url('${backItemboard}') no-repeat;
    background-size: 100% 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
.icon {
    margin-top: auto;
    margin-bottom: auto;
    height: 50px;
    width: 70px;
    border-right: 2px solid black;
}
.imgicon {
    margin-left: 12px;
    width: 50px; 
    height: 50px;  
    background: #fbefcb; 
    border-radius: 50%/10%; 
    text-align: center; 
    text-indent: .1em; 
}
.column {
    height: 70px;
    width: 130px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.des {
    font-family: JiangxiZK;
    font-size: 16px;
    text-align: center;
}
.price {
    font-family: JiangxiZK;
    color: #b31c0d;
    font-size: 12px;
    text-align: center;
}
</style>`
    console.log(html)
    return await pup.render(html)
}

export const renderViewBag = async (pup: Puppeteer, items: UserItem[]): Promise<string> => {
    let itemsHTML = items.map((item) => {
        const icon = path.resolve(__dirname, 'renderer/itemicon/' + item.id + ".png")
        const itemName = item.id
        const price = item.price
        const count = item.count
        const itemHTML = `
<div class="item">
    <div class="icon"><img src="${icon}"></div>
    <div class="column">
        <div class="des">${itemName}</div>
        <div class="price">${price}p</div>
    </div>
    <div class="count">库存：<a>${count}</a></div>
</div>`
        return itemHTML
    }).join('')

    const html = `
<html>
<body>
<div class="middle">
    <div class="wrapper">
        ${itemsHTML}
    </div>
</div>
</body>
</html>

<style>
@font-face {
    font-family: GenJyuuGothic;
    src: url('${fontGenJyuuGothic}');
}
@font-face {
    font-family: JiangxiZK;
    src: url('${fontJiangxiZK}');
}
@font-face {
    font-family: KosugiMaru;
    src: url('${fontKosugiMaru}');
}
body {
    width: 420px;
    min-height: 450px;
    display: inline-block;
}
.body {
    width: 420px;
    background: #FFE4B5;
}
.middle {
}
.wrapper {
    background: url('${backDockback}');
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 420px;
    justify-content: flex-start;
    align-content: flex-start;
    min-height: 450px;
}
.item {
    margin-left: auto;
    margin-right: auto;
    margin-top: 6px;
    margin-bottom: 6px;
    border-radius: 2px;
    width: 400px;
    height: 70px;
    background: url('${backDockBoard}') no-repeat;
    background-size: 100% 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
}
.icon {
    margin-top: auto;
    margin-bottom: auto;
    height: 50px;
    width: 70px;
    border-right: 2px solid black;
}
img {
    margin-left: 12px;
    width: 50px; 
    height: 50px;  
    background: #fbefcb; ; 
    border-radius: 50%/10%; 
    text-align: center; 
    text-indent: .1em; 
}
.column {
    height: 70px;
    width: 240px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.des {
    font-family: JiangxiZK;
    padding-left: 5px;
    font-size: 20px;
}
.price {
    padding-left: 5px;
    font-size: 16px;
    font-family: JiangxiZK;
    color: #b31c0d;
}
.count {
    font-size: 16px;
    margin-right: 10px;
    margin-left: auto;
    margin-top: auto;
    margin-bottom: auto;
    text-align: left;
    font-family: JiangxiZK;
}
.count a {
    margin-left: 5px;
    color: #b23f06;
}
</style>`
    return await pup.render(html)
}

export const renderViewItem = async (pup: Puppeteer, item: UserItem, shopDes: string): Promise<string> => {
    const icon = path.resolve(__dirname, 'renderer/itemicon/' + item.id + ".png")
    const itemName = item.id
    const price = item.price
    let description = shopDes.replace('\n', '<BR>')
    const count = item.count
    let status = ""
    if (item.description) {
        if (['on', 'ON', 'off', 'OFF'].includes(item.description)) {
            status = `状态：<a>${item.description}</a>`
        } else {
            if (description) {
                description = description + "<BR>" + item.description
            } else {
                description = item.description
            }
        }
    }
    const html = `<html>
<body>
    <div class="body">
        <div class="up">
            <div class="icon"><img src="${icon}"></div>
            <div class="name">${itemName}</div>
            <div class="price">${price}p</div>
        </div>
        <div class="down">
            <div class="des">
                ${description}
            </div>
            <div class="dock">
                <div class="count">
                    库存：<a>${count}</a>
                </div>
                <div class="status">
                    ${status}
                </div>
            </div>
        </div>
    </div>
</body>
</html>

<style>
@font-face {
    font-family: GenJyuuGothic;
    src: url('${fontGenJyuuGothic}');
}
@font-face {
    font-family: JiangxiZK;
    src: url('${fontJiangxiZK}');
}
@font-face {
    font-family: KosugiMaru;
    src: url('${fontKosugiMaru}');
}
body {
    width: 600px;
    height: 300px;
}
.body {
    padding: 20px;
    width: 560px;  
    height: 260px;  
    background: url(${backItemboard});
    background-size: contain;
    display: flex;
    flex-direction: column;
}
.up {
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: flex-start;
}
.icon {
    position: relative;
    margin-left: 20px;
    margin-top: 10px;
    margin-bottom: 10px;
    height: 100px;
    width: 100px;
    background: #fbefcb; 
    border-radius: 50%/10%; 
    text-align: center; 
    text-indent: .1em; 
}
img {
    display: block;
    border: none;
    object-fit: contain;
    width: 100px; 
    height: 100px;   
}
.name {
    margin-top: auto;
    margin-bottom: auto;
    width: 250px;
    padding-left: 30px;
    padding-right: 3px;
    word-wrap: wrap;
    text-align: left;
    font-size: 32px;
    font-family: JiangxiZK;
}
.price {
    margin-left: auto;
    margin-top: auto;
    margin-bottom: auto;
    margin-right: 20px;
    text-align: center;
    font-size: 32px;
    font-family: JiangxiZK;
    color: #b31c0d;
}
.down {
    display: flex;
    flex-direction: column;
}
.des {
    height: 80px;
    font-size: 20px;
    margin-left: 10px;
    margin-right: auto;
    text-align: left;
    font-family: KosugiMaru;
}
.dock {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}
.status {
    font-size: 24px;
    margin-left: 10px;
    margin-right: 15px;
    text-align: left;
    font-family: JiangxiZK;
}
.status a {
    margin-left: 5px;
    color: #b23f06;
}
.count {
    font-size: 24px;
    margin-left: 10px;
    margin-right: auto;
    text-align: left;
    font-family: JiangxiZK;
}
.count a {
    margin-left: 5px;
    color: #b23f06;
}
</style>`
    return await pup.render(html)
}