// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: award;

const common = importModule('common');
var rid = 0; //rid对应不同的B站榜单：0全站，1动画，3音乐，4游戏，5娱乐，36科技，119鬼畜，129舞蹈。
var num = 5; //自定义显示数量
const jsonCacheSeconds = 300;
const imgUseCache = true;
const fm = FileManager.iCloud();
const cachePath = fm.documentsDirectory() + "/app_icon";

var biData = {
  "data": [{
    "title": "",
    "uri": ""
  }]
}

function addTextToListWidget(n, bilibiliData, listWidget) {
  let item = listWidget.addText(n + '. ' + bilibiliData.title);
  item.textColor = Color.white();
  item.font = new Font('SF Mono', 15);
  item.url = bilibiliData.uri;
}

const data = await common.getDataFromCache("BilibiliCache", `https://app.bilibili.com/x/v2/rank/region?rid=${rid}`, "GET", {}, {}, jsonCacheSeconds);
const widget = await createWidget(data);
if (!config.runsInWidget) {
  await widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();

async function createWidget(data) {
  biData = data;
  let w = new ListWidget();
  // 创建标题
  var stackHeader = w.addStack()
  stackHeader.centerAlignContent()
  // 添加 icon
  var stackImgItem = stackHeader.addImage(await common.getImgFromCache("Bilibili_app_logo.png", "https://play-lh.googleusercontent.com/XSF7pMzahsz4HBYttQhS0LeWFfjcPxaIPdkSmiuud7qKEODAXFeUVct5J7DXdj-ovDc", imgUseCache, cachePath))
  stackImgItem.imageSize = new Size(15, 15)
  stackImgItem.cornerRadius = 5
  stackHeader.addSpacer(3)
  // 添加标题
  var textItem = stackHeader.addText(`哔哩哔哩`)
  textItem.font = new Font('SF Mono', 15);
  textItem.textColor = Color.white()

  // 添加更新时间
  stackHeader.addSpacer()
  var myDate = new Date();
  var textItem = stackHeader.addText(`${myDate.getHours().toString().padStart(2, '0')}:${myDate.getMinutes().toString().padStart(2, '0')}更新`)
  textItem.font = Font.regularMonospacedSystemFont(10)
  textItem.textColor = Color.white()
  textItem.rightAlignText()

  for (var i = 0; i < num; i++) {
    addTextToListWidget(i + 1, biData["data"][i], w);
  }

  w.spacing = 5;

  // 设置透明壁纸 
  const fm = FileManager.iCloud();
  const path = fm.documentsDirectory() + '/mt.jpg';
  await fm.downloadFileFromiCloud(path);
  w.backgroundImage = fm.readImage(path);
  return w;
}