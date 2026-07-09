// Variables
const apiKey = args.widgetParameter || "";

if (!apiKey) {
  const widget = new ListWidget();
  widget.addText("请在小组件参数中\n输入 DeepSeek API Key");
  widget.presentMedium();
  Script.complete();
  return;
}

// Fetch balance - 调试模式下直接显示原始数据
const url = "https://api.deepseek.com/user/balance";
const request = new Request(url);
request.headers = {
  "Authorization": `Bearer ${apiKey}`
};

let balance = 0;
let used = 0;
let rawData = null;
let error = null;

try {
  const data = await request.loadJSON();
  rawData = data;
  // 兼容不同返回格式
  if (data.balance_infos && data.balance_infos.length > 0) {
    balance = parseFloat(data.balance_infos[0].total_balance ?? 0);
    used = parseFloat(data.balance_infos[0].total_used ?? data.balance_infos[0].used ?? 0);
  } else if (data.balance) {
    balance = parseFloat(data.balance);
    used = parseFloat(data.used ?? 0);
  }
} catch(e) {
  error = e.message + (rawData ? "\n" + JSON.stringify(rawData) : "");
}

// ============ 调试模式：在 App 里运行时显示原始数据 ============
if (!config.runsInWidget) {
  const debugWidget = new ListWidget();
  debugWidget.backgroundColor = new Color("#0f1117");
  debugWidget.setPadding(12, 12, 12, 12);

  const title = debugWidget.addText("📡 API 原始返回");
  title.font = Font.boldSystemFont(16);
  title.textColor = new Color("#e8eaf0");
  debugWidget.addSpacer(8);

  if (error) {
    const err = debugWidget.addText("错误: " + error);
    err.font = Font.systemFont(12);
    err.textColor = new Color("#f87171");
  } else {
    const jsonStr = JSON.stringify(rawData, null, 2);
    const text = debugWidget.addText(jsonStr);
    text.font = Font.monospacedSystemFont(12);
    text.textColor = new Color("#34d399");

    debugWidget.addSpacer(10);
    const parseInfo = debugWidget.addText(
      "→ 解析结果:\n" +
      "  余额: " + balance + "\n" +
      "  已用: " + used + "\n\n" +
      "💡 截图发给我看看字段结构"
    );
    parseInfo.font = Font.systemFont(13);
    parseInfo.textColor = new Color("#fbbf24");
  }

  debugWidget.presentMedium();
  Script.complete();
  return;
}

// ============ 小组件模式 ============
const widget = new ListWidget();
widget.backgroundColor = new Color("#0f1117");

const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [
  new Color("#1a1c26"),
  new Color("#0f1117"),
];
widget.backgroundGradient = gradient;
widget.setPadding(16, 16, 16, 16);

if (error) {
  const errText = widget.addText("⚠️ " + error);
  errText.font = Font.systemFont(13);
  errText.textColor = new Color("#f87171");
  Script.complete();
  return;
}

// Title
const titleRow = widget.addStack();
const title = titleRow.addText("DeepSeek");
title.font = Font.boldSystemFont(15);
title.textColor = new Color("#e8eaf0");
titleRow.addSpacer();

widget.addSpacer(6);

// Balance
const amountStack = widget.addStack();
const amountText = amountStack.addText(balance.toFixed(2));
amountText.font = Font.boldSystemFont(40);
amountText.textColor = new Color("#4f8cff");
amountStack.addSpacer(4);

const unitText = amountStack.addText("元");
unitText.font = Font.systemFont(18);
unitText.textColor = new Color("#8b8fa3");

widget.addSpacer(4);

// Status
const statusStack = widget.addStack();
const dot = statusStack.addText("●");
dot.font = Font.systemFont(9);
statusStack.addSpacer(5);
const statusText = statusStack.addText(balance > 10 ? "余额充足" : (balance > 0 ? "余额不足" : "已用尽"));
statusText.font = Font.systemFont(12);
statusText.textColor = balance > 10 ? new Color("#34d399") : (balance > 0 ? new Color("#fbbf24") : new Color("#f87171"));

widget.addSpacer(10);

// Bottom
const bottomRow = widget.addStack();
bottomRow.layoutHorizontally();

const leftCol = bottomRow.addStack();
leftCol.layoutVertically();
const usedLabel = leftCol.addText("本月已用");
usedLabel.font = Font.systemFont(11);
usedLabel.textColor = new Color("#8b8fa3");
leftCol.addSpacer(2);
const usedValTxt = used > 0 ? used.toFixed(2) : "--";
const usedVal = leftCol.addText(usedValTxt);
usedVal.font = Font.boldSystemFont(15);
usedVal.textColor = new Color("#e8eaf0");
if (used === 0) {
  const usedHint = leftCol.addText("暂无数据");
  usedHint.font = Font.systemFont(9);
  usedHint.textColor = new Color("#555a70");
}

bottomRow.addSpacer();

const rightCol = bottomRow.addStack();
rightCol.layoutVertically();
const rightLabel = rightCol.addText("状态");
rightLabel.font = Font.systemFont(11);
rightLabel.textColor = new Color("#8b8fa3");
rightCol.addSpacer(2);
const rightVal = rightCol.addText(balance > 0 ? "可用" : "不可用");
rightVal.font = Font.boldSystemFont(15);
rightVal.textColor = balance > 0 ? new Color("#34d399") : new Color("#f87171");

widget.addSpacer(8);

const now = new Date();
const timeStr = now.getHours().toString().padStart(2, "0") + ":" +
                now.getMinutes().toString().padStart(2, "0") + ":" +
                now.getSeconds().toString().padStart(2, "0");
const timeText = widget.addText("更新于 " + timeStr);
timeText.font = Font.systemFont(9);
timeText.textColor = new Color("#3f4359");

widget.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);

Script.setWidget(widget);
Script.complete();
