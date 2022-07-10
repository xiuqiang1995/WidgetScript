// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: book-open;
/*
 * Author: evilbutcher
 * Github: https://github.com/evilbutcher
 * 本脚本使用了@Gideon_Senku的Env.scriptable，感谢！
 */
const goupdate = true;
const $ = importModule("Env");
var num = 6; //自定义显示数量
var rancolor = true; //true为开启随机颜色

var zhihuData = {
  "data": [{
    "target":{
      "id":0,
      "title":""
    }
  }]
}

const res = await getinfo();

let widget = createWidget(res);
Script.setWidget(widget);
Script.complete();

function createWidget(res) {
    zhihuData = res;
    const w = new ListWidget();

  const fm = FileManager.iCloud();
  const path = fm.documentsDirectory() + '/mm.jpg';
  w.backgroundImage = fm.readImage(path);


    w.addSpacer();
    w.spacing = 5;

    const firstLine = w.addText(`知乎热榜`);
    firstLine.font = new Font('SF Mono', 15);
    firstLine.textColor = Color.white();
    firstLine.textOpacity = 0.7;

    for (var i = 0; i < num; i++) {
      addTextToListWidget(i + 1, zhihuData["data"][i], w);
    }

    w.addSpacer();
    w.spacing = 5;
    w.presentSmall();
    return w;
}

async function getinfo() {
  const url = {
    url: `https://api.zhihu.com/topstory/hot-lists/total?limit=10&reverse_order=0`,
  };
  const res = await $.get(url);
  log(res);
  return res;
}

function addTextToListWidget(n, zhiData, listWidget) {
  let item = listWidget.addText(n + '. ' + zhiData["target"].title);


    item.textColor = Color.white();
  
  item.font = new Font('SF Mono', 12);
  item.url = "zhihu://questions/" + zhiData["target"].id;
}

function color16() {
  var r = Math.floor(Math.random() * 256);
  if (r + 50 < 255) {
    r = r + 50;
  }
  if (r > 230 && r < 255) {
    r = r - 50;
  }
  var g = Math.floor(Math.random() * 256);
  if (g + 50 < 255) {
    g = g + 50;
  }
  if (g > 230 && g < 255) {
    g = g - 50;
  }
  var b = Math.floor(Math.random() * 256);
  if (b + 50 < 255) {
    b = b + 50;
  }
  if (b > 230 && b < 255) {
    b = b - 50;
  }
  var color = "#" + r.toString(16) + g.toString(16) + b.toString(16);
  return color;
}

