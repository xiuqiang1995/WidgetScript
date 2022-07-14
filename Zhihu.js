// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: award;

const common = importModule('./common.js');

// 图片是否使用缓存开关
const imgUseCache = true;
// 图片地址
const fm = FileManager.iCloud();
const cachePath = fm.documentsDirectory() + "/app_icon";
const num = 5;
const jsonCacheSeconds = 300;

var zhihuData = {
  "data": [{
    "target": {
      "id": 0,
      "title": ""
    }
  }]
}

function addTextToListWidget(n, zhiData, listWidget) {
  let item = listWidget.addText(n + '. ' + zhiData["target"].title);
  item.textColor = Color.white();
  item.font = new Font('SF Mono', 15);
  item.url = "zhihu://questions/" + zhiData["target"].id;
}

const data = await common.getDataFromCache("ZhihuCache", `https://api.zhihu.com/topstory/hot-lists/total?limit=10&reverse_order=0`, "GET", {}, {}, jsonCacheSeconds);
const widget = await createWidget(data);
if (!config.runsInWidget) {
  await widget.presentMedium();
}
Script.setWidget(widget);
Script.complete();

async function createWidget(data) {
  zhihuData = data;
  let w = new ListWidget();
  // 创建标题
  var stackHeader = w.addStack()
  stackHeader.centerAlignContent()
  // 添加 icon
  var stackImgItem = stackHeader.addImage(await common.getImgFromCache("Zhihu_app_logo.png", "https://static.zhihu.com/heifetz/favicon.ico", imgUseCache, cachePath))
  stackImgItem.imageSize = new Size(15, 15)
  stackImgItem.cornerRadius = 5
  stackHeader.addSpacer(3)
  // 添加标题
  var textItem = stackHeader.addText("知乎热榜")
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
    addTextToListWidget(i + 1, zhihuData["data"][i], w);
  }

  w.spacing = 5;

  // 设置透明壁纸 
  const fm = FileManager.iCloud();
  const path = fm.documentsDirectory() + '/mm.jpg';
  await fm.downloadFileFromiCloud(path);
  w.backgroundImage = fm.readImage(path);
  return w;
}