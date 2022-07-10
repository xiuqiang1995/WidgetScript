// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: heartbeat;
/*
 * Author: evilbutcher
 * Github: https://github.com/evilbutcher
 * 本脚本使用了@Gideon_Senku的Env.scriptable，感谢！
 */

const $ = importModule("Env");
var rid = 0; //rid对应不同的B站榜单：0全站，1动画，3音乐，4游戏，5娱乐，36科技，119鬼畜，129舞蹈。
var num = 6; //自定义显示数量
var rancolor = true; //true为开启随机颜色

var biData = {
  "data": [{
    "title": "",
    "uri": "",
  }]
}

const res = await getinfo();

let widget = createWidget(res);
Script.setWidget(widget);
Script.complete();

function createWidget(res) {
  var biData = res;
  const w = new ListWidget();
  const fm = FileManager.iCloud();
  const path = fm.documentsDirectory() + '/mt.jpg';
  w.backgroundImage = fm.readImage(path);
  w.addSpacer();
  w.spacing = 5;

  const firstLine = w.addText(`哔哩哔哩排行榜`);
  firstLine.font = new Font('SF Mono', 15);
  firstLine.textColor = Color.white();
  firstLine.textOpacity = 0.7;

  for (var i = 0; i < num; i++) {
    addTextToListWidget(i + 1, biData["data"][i], w);
  }

  w.addSpacer();
  w.spacing = 5;
  w.presentSmall();
  return w;
}

async function getinfo() {
  const blRequest = {
    url: `https://app.bilibili.com/x/v2/rank/region?rid=${rid}`,
  };
  const res = await $.get(blRequest);
  return res;
}

function addTextToListWidget(n, bilibiliData, listWidget) {
  let item = listWidget.addText(n + '. ' + bilibiliData.title);
  item.textColor = Color.white();
  item.font = new Font('SF Mono', 12);
  item.url = bilibiliData.uri;
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
