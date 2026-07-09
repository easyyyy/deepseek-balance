// Variables
const apiKey = args.widgetParameter || "";

if (!apiKey) {
  const widget = new ListWidget();
  widget.addText("请在小组件参数中\n输入 DeepSeek API Key");
  widget.presentMedium();
  Script.complete();
  return;
}

// Fetch balance
const url = "https://api.deepseek.com/user/balance";
const request = new Request(url);
request.headers = {
  "Authorization": `Bearer ${apiKey}`
};

let balance = 0;
let used = 0;
let error = null;

try {
  const data = await request.loadJSON();
  balance = parseFloat(data.balance_infos?.[0]?.total_balance ?? data.balance ?? 0);
  used = parseFloat(data.balance_infos?.[0]?.total_used ?? 0);
} catch(e) {
  error = e.message;
}

// Create widget
const widget = new ListWidget();
widget.backgroundColor = new Color("#0f1117");

// Gradient background
const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [
  new Color("#1a1c26"),
  new Color("#0f1117"),
];
widget.backgroundGradient = gradient;

// Padding
widget.setPadding(16, 16, 16, 16);

if (error) {
  // Error state
  const errText = widget.addText("⚠️ " + error);
  errText.font = Font.systemFont(13);
  errText.textColor = new Color("#f87171");
  Script.complete();
  return;
}

// Title row
const titleRow = widget.addStack();
const title = titleRow.addText("🧠 DeepSeek");
title.font = Font.boldSystemFont(14);
title.textColor = new Color("#e8eaf0");
titleRow.addSpacer();

// Balance section
widget.addSpacer(8);

const amountStack = widget.addStack();
const amountText = amountStack.addText(balance.toFixed(2));
amountText.font = Font.boldSystemFont(36);
amountText.textColor = new Color("#4f8cff");
amountStack.addSpacer(4);

const unitText = amountStack.addText("元");
unitText.font = Font.systemFont(16);
unitText.textColor = new Color("#8b8fa3");
unitText.lineLimit = 1;

widget.addSpacer(4);

// Status
const statusStack = widget.addStack();
const statusDot = statusStack.addText("●");
statusDot.font = Font.systemFont(10);
statusStack.addSpacer(6);
const statusText = statusStack.addText(balance > 10 ? "余额充足" : (balance > 0 ? "余额不足" : "已用尽"));
statusText.font = Font.systemFont(12);
statusText.textColor = balance > 10 ? new Color("#34d399") : (balance > 0 ? new Color("#fbbf24") : new Color("#f87171"));

widget.addSpacer(12);

// Details row
const detailStack = widget.addStack();
detailStack.layoutHorizontally();

// Used
const usedCol = detailStack.addStack();
usedCol.layoutVertically();
const usedLabel = usedCol.addText("已用");
usedLabel.font = Font.systemFont(11);
usedLabel.textColor = new Color("#8b8fa3");
usedCol.addSpacer(2);
const usedVal = usedCol.addText(used.toFixed(2));
usedVal.font = Font.boldSystemFont(14);
usedVal.textColor = new Color("#e8eaf0");

detailStack.addSpacer();

// Estimate
const estCol = detailStack.addStack();
estCol.layoutVertically();
const estLabel = estCol.addText("预估 tokens");
estLabel.font = Font.systemFont(11);
estLabel.textColor = new Color("#8b8fa3");
estCol.addSpacer(2);
const estValText = balance > 0 ? `${Math.floor(balance / 0.002).toLocaleString()}` : "0";
const estVal = estCol.addText(estValText);
estVal.font = Font.boldSystemFont(14);
estVal.textColor = new Color("#e8eaf0");
const estUnit = estCol.addText("tokens");
estUnit.font = Font.systemFont(10);
estUnit.textColor = new Color("#8b8fa3");

widget.addSpacer(8);

// Update time
const timeText = widget.addText("更新: " + new Date().toLocaleTimeString("zh-CN", {hour12: false}));
timeText.font = Font.systemFont(9);
timeText.textColor = new Color("#3f4359");

// Refresh interval (10 minutes)
widget.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);

// Present
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}

Script.complete();
