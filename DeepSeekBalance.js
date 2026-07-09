// DeepSeek 小组件 v1.0
// 参数格式: API Key|User Token（竖线分隔）
const KEYCHAIN_API_KEY = "ds_api_key";
const KEYCHAIN_USER_TOKEN = "ds_user_token";

async function getCredentials() {
  const param = args.widgetParameter || "";
  if (param.includes("|")) {
    const parts = param.split("|");
    return { apiKey: parts[0].trim(), userToken: parts[1].trim() };
  }
  if (param) {
    const ut = Keychain.contains(KEYCHAIN_USER_TOKEN) ? Keychain.get(KEYCHAIN_USER_TOKEN) : "";
    return { apiKey: param, userToken: ut };
  }
  const apiKey = Keychain.contains(KEYCHAIN_API_KEY) ? Keychain.get(KEYCHAIN_API_KEY) : "";
  const userToken = Keychain.contains(KEYCHAIN_USER_TOKEN) ? Keychain.get(KEYCHAIN_USER_TOKEN) : "";
  return { apiKey, userToken };
}

async function fetchBalance(apiKey) {
  const req = new Request("https://api.deepseek.com/user/balance");
  req.headers = { "Authorization": `Bearer ${apiKey}` };
  return await req.loadJSON();
}

async function fetchUsage(userToken) {
  const req = new Request("https://platform.deepseek.com/api/v0/users/get_user_summary");
  req.headers = { "Authorization": "Bearer " + userToken };
  return await req.loadJSON();
}

const creds = await getCredentials();
let balanceData = null, usageData = null;
let errors = [];

if (creds.apiKey) {
  try { balanceData = await fetchBalance(creds.apiKey); }
  catch(e) { errors.push("余额: " + e.message); }
}
if (creds.userToken) {
  try { usageData = await fetchUsage(creds.userToken); }
  catch(e) { errors.push("消费: " + e.message); }
}

// 调试视图（App 内运行）
if (!config.runsInWidget) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f1117");
  w.setPadding(12, 12, 12, 12);
  w.addText("v1.0 调试").font = Font.boldSystemFont(16);
  w.addText("").textColor = new Color("#e8eaf0");
  w.addSpacer(4);
  w.addText("Key: " + (creds.apiKey ? "✅" : "❌")).font = Font.systemFont(11);
  w.addText("Token: " + (creds.userToken ? "✅" : "❌")).font = Font.systemFont(11);
  w.addSpacer(4);
  if (balanceData) {
    w.addText("余额: " + (balanceData.balance_infos?.[0]?.total_balance || "?")).font = Font.systemFont(11);
  }
  if (usageData?.biz_data) {
    const bd = usageData.biz_data;
    w.addText("本月消费: ¥" + parseFloat(bd.monthly_costs?.[0]?.amount || 0).toFixed(2)).font = Font.systemFont(11);
    w.addText("本月Token: " + parseInt(bd.monthly_token_usage || 0).toLocaleString()).font = Font.systemFont(11);
  } else if (creds.userToken) {
    w.addText("消费数据为空，检查 Token").font = Font.systemFont(11);
  }
  if (errors.length) w.addText("错误: " + errors.join(", ")).font = Font.systemFont(11);
  w.presentMedium();
  Script.complete();
  return;
}

// 小组件
const widget = new ListWidget();
widget.backgroundColor = new Color("#0f1117");
const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [new Color("#1a1c26"), new Color("#0f1117")];
widget.backgroundGradient = gradient;
widget.setPadding(14, 14, 14, 14);

const balance = parseFloat(balanceData?.balance_infos?.[0]?.total_balance ?? 0);
const bd = usageData?.biz_data;
const monthlyCost = bd ? parseFloat(bd.monthly_costs?.[0]?.amount ?? 0) : null;
const monthlyTokens = bd ? parseInt(bd.monthly_token_usage ?? 0) : null;

const titleRow = widget.addStack();
titleRow.addText("DeepSeek").font = Font.boldSystemFont(14);
titleRow.addText("").textColor = new Color("#e8eaf0");
titleRow.addSpacer();
if (errors.length) {
  titleRow.addText("!").font = Font.boldSystemFont(12);
  titleRow.addText("").textColor = new Color("#f87171");
}
widget.addSpacer(4);

const amt = widget.addStack();
let n = amt.addText(balance.toFixed(2));
n.font = Font.boldSystemFont(34);
n.textColor = new Color("#4f8cff");
amt.addSpacer(4);
let u = amt.addText("元");
u.font = Font.systemFont(16);
u.textColor = new Color("#8b8fa3");
amt.addSpacer(6);
let dot = amt.addText("●");
dot.font = Font.systemFont(8);
dot.textColor = balance > 0 ? new Color("#34d399") : new Color("#f87171");
amt.addSpacer(4);
let st = amt.addText(balance > 0 ? "可用" : "已用尽");
st.font = Font.systemFont(11);
st.textColor = balance > 0 ? new Color("#34d399") : new Color("#f87171");
widget.addSpacer(6);

if (monthlyCost !== null) {
  const costRow = widget.addStack();
  costRow.addText("本月").font = Font.systemFont(11);
  costRow.addText("").textColor = new Color("#8b8fa3");
  costRow.addSpacer(6);
  costRow.addText("¥" + monthlyCost.toFixed(2)).font = Font.boldSystemFont(16);
  costRow.addText("").textColor = new Color("#e8eaf0");
  costRow.addSpacer(10);
  costRow.addText("Token").font = Font.systemFont(11);
  costRow.addText("").textColor = new Color("#8b8fa3");
  costRow.addSpacer(6);
  costRow.addText(
    monthlyTokens >= 100000000 ? (monthlyTokens / 100000000).toFixed(1) + "亿" :
    monthlyTokens >= 10000 ? (monthlyTokens / 10000).toFixed(0) + "万" :
    monthlyTokens.toLocaleString()
  ).font = Font.boldSystemFont(16);
  costRow.addText("").textColor = new Color("#a78bfa");
}
widget.addSpacer(6);

const now = new Date();
const ts = now.getHours().toString().padStart(2,"0") + ":" +
            now.getMinutes().toString().padStart(2,"0") + ":" +
            now.getSeconds().toString().padStart(2,"0");
widget.addText("更新于 " + ts).font = Font.systemFont(8);
widget.addText("").textColor = new Color("#3f4359");
widget.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
Script.setWidget(widget);
Script.complete();
