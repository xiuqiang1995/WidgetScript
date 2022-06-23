// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: sticky-note;

// author: 呱行次比猫 (https://space.bilibili.com/38238808)
// modified : Quentin Li
// V1 去掉等级信息，增加参量质变仪状态
// V2 2022-06-21 缓存请求的返回值

const { MD5, getDataFromCache, getImgFromCache } = importModule('./common.js');

// 注意：抓包填入你的米游社的cookie
const mihoyoCookie = ""

const userRoleNumber = 0 // 如果你有多个角色，请将0依次改为1,2,3...后运行查看
// 请设置When Interacting为Open URL，URL为yuanshengame://

// 将图片保存到iCloud，避免每次请求icon url
const fm = FileManager.iCloud();
const cachePath = fm.documentsDirectory() + "/genshin_img";
// json 数据的缓存时间
const jsonCacheSeconds = 480;
// 图片是否使用缓存开关
const imgUseCache = true;

const textColor = Color.white();
const warnColor = Color.red();



function formatExpRemainTime(timeRemain) {
  let processTimeTmp = parseInt(timeRemain / 60)

  let hour = parseInt(processTimeTmp / 60)
  let minute = parseInt(processTimeTmp % 60)
  let second = parseInt(timeRemain % 60)

  return [hour.toString().padStart(2, '0'), minute.toString().padStart(2, '0'), second.toString().padStart(2, '0')]
}

function getFont(fontName, fontSize) {
  const fontGenerator = {
    medium: function () {
      return Font.mediumMonospacedSystemFont(fontSize)
    },
    regular: function () {
      return Font.regularMonospacedSystemFont(fontSize)
    },
    bold: function () {
      return Font.boldMonospacedSystemFont(fontSize)
    },
    heavy: function () {
      return Font.heavyMonospacedSystemFont(fontSize)
    },
    black: function () {
      return Font.blackMonospacedSystemFont(fontSize)
    }
  }

  const systemFont = fontGenerator[fontName]
  if (systemFont) {
    return systemFont()
  }
  return new Font(fontName, fontSize)
}

var genshinData = {
  "current_resin": 0,
  "max_resin": 160,
  "resin_recovery_time": "0",
  "finished_task_num": 0,
  "total_task_num": 4,
  "is_extra_task_reward_received": false,
  "remain_resin_discount_num": 0,
  "resin_discount_num_limit": 3,
  "current_expedition_num": 0,
  "max_expedition_num": 5,
  "expeditions": [],
  "current_home_coin": 0,
  "max_home_coin": 2400,
  "home_coin_recovery_time": "0",
  "transformer": {
    "obtained": false,
    "recovery_time": {
      "Day": 0,
      "Minute": 0,
      "reached": false,
      "Second": 0,
      "Hour": 0
    }
  }
}

function getHeaders(url) {
  var time_ = String(parseInt(Date.now() / 1000))
  var random_ = String(parseInt((Math.random() + 1) * 100000))
  var check = MD5("salt=xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs&t=" + time_ + "&r=" + random_ + "&b=&q=" + url.split("?")[1])

  var ds = time_ + "," + random_ + "," + check

  var headers = {
    "Cookie": mihoyoCookie,
    "DS": ds,
    "x-rpc-app_version": "2.20.1",
    "x-rpc-client_type": "5"
  }
  return headers;
}

async function createWidget() {
  const url1 = "https://api-takumi.mihoyo.com/binding/api/getUserGameRolesByCookie?game_biz=hk4e_cn";
  // 获取角色信息
  var genshinRsp = await getDataFromCache("genshinUserRoleCache", url1, "GET", {}, {}, jsonCacheSeconds)
  const userRole = genshinRsp["data"]["list"][userRoleNumber]


  var url2 = "https://api-takumi-record.mihoyo.com/game_record/app/genshin/api/dailyNote?role_id=" + userRole["game_uid"] + "&server=" + userRole["region"];
  // 获取原神便笺
  var genshinRsp = await getDataFromCache("genshinDailyNoteCache", url2, "GET", getHeaders(url2), {}, jsonCacheSeconds)
  genshinData = genshinRsp["data"]

  // 创建小组件
  const widget = new ListWidget()

  // 设置背景
  const fm = FileManager.iCloud();
  const path = fm.documentsDirectory() + '/bottomLeft.jpg';
  await fm.downloadFileFromiCloud(path);
  widget.backgroundImage = fm.readImage(path);

  // 创建原神标题部分
  var stackHeader = widget.addStack()
  stackHeader.centerAlignContent()

  // 添加原神图标
  var stackImgItem = stackHeader.addImage(await getImgFromCache("genshinIconCache", "https://ys.mihoyo.com/main/favicon.ico", imgUseCache, cachePath))
  stackImgItem.imageSize = new Size(12, 12)
  stackImgItem.cornerRadius = 5
  stackHeader.addSpacer(3)

  // 添加原神标题
  var textItem = stackHeader.addText("原神便笺")
  textItem.font = getFont('semibold', 10)
  textItem.textColor = textColor

  // 添加更新时间
  stackHeader.addSpacer()
  var myDate = new Date();
  var textItem = stackHeader.addText(`${myDate.getHours().toString().padStart(2, '0')}:${myDate.getMinutes().toString().padStart(2, '0')}更新`)
  textItem.font = getFont('semibold', 10)
  textItem.textColor = textColor
  textItem.rightAlignText()

  // 添加旅行者信息
  //   var textItem = widget.addText(`${userRole["level"]}级 - ${userRole["nickname"]}`)
  //   textItem.font = getFont('regular', 11)
  //   textItem.textColor = textColor
  //   textItem.centerAlignText()

  widget.addSpacer(5)

  // 添加小标题
  // var textItem = widget.addText("详细数据")
  // textItem.font = getFont('semibold', 11)
  // textItem.textColor = textColor

  // 添加 树脂信息
  var stackText = widget.addStack()
  var textItem = stackText.addText("·当前树脂: ")
  textItem.font = getFont('regular', 9)
  textItem.textColor = textColor

  var textItem = stackText.addText(`已累计 ${genshinData["current_resin"]} 个`)
  textItem.font = getFont('regular', 9)
  if (genshinData["current_resin"] >= genshinData["max_resin"] * 0.9) {
    textItem.textColor = warnColor
  } else {
    textItem.textColor = textColor
  }

  if (genshinData["current_resin"] != genshinData["max_resin"]) {
    var remainTime = formatExpRemainTime(parseInt(genshinData["resin_recovery_time"]))
    var textItem = widget.addText(`(剩余 ${remainTime[0]}:${remainTime[1]})`)
    textItem.font = getFont('regular', 9)
    textItem.textColor = textColor
    textItem.rightAlignText()
  } else {
    var textItem = widget.addText(`已达上限！`)
    textItem.font = getFont('regular', 9)
    textItem.textColor = warnColor
    textItem.rightAlignText()
  }

  // 添加 洞天宝钱信息
  var stackText = widget.addStack()
  var textItem = stackText.addText("·洞天宝钱: ")
  textItem.font = getFont('regular', 9)
  textItem.textColor = textColor

  var textItem = stackText.addText(`已累计 ${genshinData["current_home_coin"]} 枚`)
  textItem.font = getFont('regular', 9)
  if (genshinData["current_home_coin"] >= genshinData["max_home_coin"] * 0.9) {
    textItem.textColor = warnColor
  } else {
    textItem.textColor = textColor
  }

  if (genshinData["current_home_coin"] != genshinData["max_home_coin"]) {
    var remainTime = formatExpRemainTime(parseInt(genshinData["home_coin_recovery_time"]))
    var textItem = widget.addText(`(剩余 ${remainTime[0]}:${remainTime[1]})`)
    textItem.font = getFont('regular', 9)
    textItem.textColor = textColor
    textItem.rightAlignText()
  } else {
    var textItem = widget.addText(`已达上限！`)
    textItem.font = getFont('regular', 9)
    textItem.textColor = warnColor
    textItem.rightAlignText()
  }

  // 添加 每日委托信息
  var stackText = widget.addStack()
  var textItem = stackText.addText("·每日委托: ")
  textItem.font = getFont('regular', 9)
  textItem.textColor = textColor

  var textItem = stackText.addText(`已完成 ${genshinData["finished_task_num"]} 个`)
  textItem.font = getFont('regular', 9)
  if (genshinData["finished_task_num"] != genshinData["total_task_num"]) {
    textItem.textColor = warnColor
  } else {
    textItem.textColor = textColor
  }

  // 添加 周本信息
  var stackText = widget.addStack()
  var textItem = stackText.addText("·周本减半: ")
  textItem.font = getFont('regular', 9)
  textItem.textColor = textColor

  var textItem = stackText.addText(`还剩余 ${genshinData["remain_resin_discount_num"]} 次`)
  textItem.font = getFont('regular', 9)
  if (genshinData["remain_resin_discount_num"] != 0) {
    textItem.textColor = warnColor
  } else {
    textItem.textColor = textColor
  }

  // 添加 参量质变仪信息
  var stackText = widget.addStack()
  var textItem = stackText.addText("·质变仪: ")
  textItem.font = getFont('regular', 9)
  textItem.textColor = textColor
  if (genshinData["transformer"].recovery_time.reached) {
    var textItem = stackText.addText(`可使用`)
    textItem.textColor = warnColor
    textItem.font = getFont('regular', 9)
  } else {
    const recoveryDay = genshinData["transformer"].recovery_time.Day;
    if (recoveryDay > 0) {
      var textItem = stackText.addText(`冷却中（${genshinData["transformer"].recovery_time.Day} 天）`)
    } else {
      var textItem = stackText.addText(`冷却中（${genshinData["transformer"].recovery_time.Hour} 小时）`)
    }
    textItem.textColor = textColor
    textItem.font = getFont('regular', 9)
  }

  // 添加 派遣信息
  var stackText = widget.addStack()
  var textItem = stackText.addText("·探索派遣: ")
  textItem.font = getFont('regular', 9)
  textItem.textColor = textColor

  var textItem = stackText.addText(`已派出 ${genshinData["current_expedition_num"]} 人`)
  textItem.font = getFont('regular', 9)
  if (genshinData["current_expedition_num"] != genshinData["max_expedition_num"]) {
    textItem.textColor = warnColor
  } else {
    textItem.textColor = textColor
  }


  // 生成派遣状态
  var stackExpImg = widget.addStack()
  stackExpImg.addSpacer(2)
  var stackExpStatus = widget.addStack()
  stackExpStatus.addSpacer(2)

  for (var i = 0; i < genshinData["expeditions"].length; i++) {
    var char = genshinData["expeditions"][i]

    if (char["status"] == "Finished") {
      // 添加 派遣状态
      var textItem = stackExpStatus.addText("已完成")
      textItem.font = getFont('regular', 7)
      textItem.textColor = warnColor
      if (i != 4) { stackExpStatus.addSpacer(3) }
    } else {
      // 添加 派遣状态
      var remainTime = formatExpRemainTime(parseInt(char["remained_time"]))
      // var textItem = stackExpStatus.addText("进行中")
      stackExpStatus.addSpacer(0.5)
      var textItem = stackExpStatus.addText(`${remainTime[0]}:${remainTime[1]}`)
      textItem.font = getFont('regular', 7)
      textItem.textColor = textColor
      if (i != 4) { stackExpStatus.addSpacer(3) }
    }

    const avatar = char["avatar_side_icon"];
    var imgItem = stackExpImg.addImage(await getImgFromCache("genshinAvatarCache_" + i, avatar, imgUseCache, cachePath))
    imgItem.imageSize = new Size(20, 20)
    imgItem.cornerRadius = 10

    if (i != 4) { stackExpImg.addSpacer(4.5) }
  }

  return widget
}

async function main() {
  if (config.runsInWidget) { //为桌面小组件，检查大小
    if (config.widgetFamily != 'small') {
      let widget = new ListWidget()
      widget.addText("小组件大小错误")
      Script.setWidget(widget)
      return
    }
  }
  try { //添加运行错误提示
    let widget = await createWidget()
    if (!config.runsInWidget) { //测试时展示
      widget.presentSmall()
      return
    }
    Script.setWidget(widget)
  } catch (err) {
    log(err)
    let widget = new ListWidget()
    widget.addText("运行异常")
    Script.setWidget(widget)
    return
  }
}

// main
await main()
Script.complete()
