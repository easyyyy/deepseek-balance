// DeepSeek 余额小组件
const KEYCHAIN_KEY = "ds_api_key";

// ============ 获取 API Key ============
async function getApiKey() {
  if (args.widgetParameter) return args.widgetParameter;
  if (Keychain.contains(KEYCHAIN_KEY)) return Keychain.get(KEYCHAIN_KEY);
  const p = new Prompt();
  p.title = "DeepSeek API Key";
  p.message = "输入你的 API Key (sk-...)";
  p.addTextField("key", "", { placeholder: "sk-..." });
  p.addButton("确定");
  const didSubmit = await p.show();
  if (!didSubmit) return null;
  const key = p.fieldValues["key"].trim();
  if (!key) return null;
  Keychain.set(KEYCHAIN_KEY, key);
  return key;
}

// ============ 查余额 ============
async function fetchBalance(apiKey) {
  const url = "https://api.deepseek.com/user/balance";
  const request = new Request(url);
  request.headers = { "Authorization": `Bearer ${apiKey}` };
  return await request.loadJSON();
}

// ============ 主流程 ============
const apiKey = await getApiKey();
if (!apiKey) {
  const w = new ListWidget();
  w.addText("已取消");
  w.presentMedium();
  Script.complete();
  return;
}

let total = 0, toppedUp = 0, granted = 0;
let rawData = null, error = null;

try {
  const data = await fetchBalance(apiKey);
  rawData = data;
  const info = data.balance_infos?.[0] || {};
  total = parseFloat(info.total_balance ?? 0);
  toppedUp = parseFloat(info.topped_up_balance ?? 0);
  granted = parseFloat(info.granted_balance ?? 0);
} catch(e) {
  error = e.message;
}

// ============ 调试模式 ============
if (!config.runsInWidget) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#0f1117");
  w.setPadding(12, 12, 12, 12);

  let t = w.addText("📡 API 原始返回");
  t.font = Font.boldSystemFont(16);
  t.textColor = new Color("#e8eaf0");
  w.addSpacer(6);

  if (error) {
    let e = w.addText("错误: " + error);
    e.font = Font.systemFont(12);
    e.textColor = new Color("#f87171");
  } else {
    let j = w.addText(JSON.stringify(rawData, null, 2));
    j.font = Font.monospacedSystemFont(12);
    j.textColor = new Color("#34d399");
    w.addSpacer(8);
    let p = w.addText(
      "余额: " + total + "\n" +
      "充值: " + toppedUp + "\n" +
      "赠送: " + granted
    );
    p.font = Font.systemFont(13);
    p.textColor = new Color("#fbbf24");
  }
  w.presentMedium();
  Script.complete();
  return;
}

// ============ 小组件 ============
const widget = new ListWidget();
widget.backgroundColor = new Color("#0f1117");

const gradient = new LinearGradient();
gradient.locations = [0, 1];
gradient.colors = [new Color("#1a1c26"), new Color("#0f1117")];
widget.backgroundGradient = gradient;
widget.setPadding(16, 16, 16, 16);

if (error) {
  let e = widget.addText("⚠️ " + error);
  e.font = Font.systemFont(13);
  e.textColor = new Color("#f87171");
  Script.complete();
  return;
}

// Title
const titleRow = widget.addStack();
let ti = titleRow.addText("DeepSeek");
ti.font = Font.boldSystemFont(15);
ti.textColor = new Color("#e8eaf0");
titleRow.addSpacer();

widget.addSpacer(6);

// Balance
const amt = widget.addStack();
let n = amt.addText(total.toFixed(2));
n.font = Font.boldSystemFont(40);
n.textColor = new Color("#4f8cff");
amt.addSpacer(4);
let u = amt.addText("元");
u.font = Font.systemFont(18);
u.textColor = new Color("#8b8fa3");

widget.addSpacer(4);

// Status
const s = widget.addStack();
let dot = s.addText("●");
dot.font = Font.systemFont(9);
s.addSpacer(5);
let st = s.addText(total > 0 ? "可用" : "已用尽");
st.font = Font.systemFont(12);
st.textColor = total > 0 ? new Color("#34d399") : new Color("#f87171");

widget.addSpacer(10);

// Bottom row: topped up + granted
const row = widget.addStack();
row.layoutHorizontally();

// Topped up
const tc = row.addStack();
tc.layoutVertically();
let tl = tc.addText("充值");
tl.font = Font.systemFont(11);
tl.textColor = new Color("#8b8fa3");
tc.addSpacer(2);
let tv = tc.addText(toppedUp.toFixed(2));
tv.font = Font.boldSystemFont(15);
tv.textColor = new Color("#e8eaf0");

row.addSpacer();

// Granted
const gc = row.addStack();
gc.layoutVertically();
let gl = gc.addText("赠送");
gl.font = Font.systemFont(11);
gl.textColor = new Color("#8b8fa3");
gc.addSpacer(2);
let gv = gc.addText(granted.toFixed(2));
gv.font = Font.boldSystemFont(15);
gv.textColor = granted > 0 ? new Color("#a78bfa") : new Color("#555a70");

widget.addSpacer(8);

// Timestamp
const now = new Date();
const ts = now.getHours().toString().padStart(2,"0") + ":" +
            now.getMinutes().toString().padStart(2,"0") + ":" +
            now.getSeconds().toString().padStart(2,"0");
let ft = widget.addText("更新于 " + ts);
ft.font = Font.systemFont(9);
ft.textColor = new Color("#3f4359");

widget.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);

Script.setWidget(widget);
Script.complete();
