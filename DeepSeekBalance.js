// v1.1
const param = args.widgetParameter || "";
let apiKey = "", userToken = "";

if (param.includes("|")) {
  const parts = param.split("|");
  apiKey = parts[0].trim();
  userToken = parts[1].trim();
} else {
  apiKey = param;
}

let balance = 0, cost = null, tokens = null;

if (apiKey) {
  try {
    const r1 = new Request("https://api.deepseek.com/user/balance");
    r1.headers = { Authorization: "Bearer " + apiKey };
    const d1 = await r1.loadJSON();
    balance = parseFloat(d1.balance_infos?.[0]?.total_balance || 0);
  } catch(e) {}
}

if (userToken) {
  try {
    const r2 = new Request("https://platform.deepseek.com/api/v0/users/get_user_summary");
    r2.headers = { Authorization: "Bearer " + userToken };
    const d2 = await r2.loadJSON();
    if (d2.code === 0) {
      cost = parseFloat(d2.data.biz_data.monthly_costs[0].amount);
      tokens = parseInt(d2.data.biz_data.monthly_token_usage);
    }
  } catch(e) {}
}

const w = new ListWidget();
w.backgroundColor = new Color("#0f1117");
const g = new LinearGradient();
g.locations = [0, 1];
g.colors = [new Color("#1a1c26"), new Color("#0f1117")];
w.backgroundGradient = g;
w.setPadding(14, 14, 14, 14);

// Title
let t = w.addText("DeepSeek");
t.font = Font.boldSystemFont(14);
t.textColor = new Color("#e8eaf0");

w.addSpacer(6);

// Balance
const row1 = w.addStack();
let n = row1.addText(balance.toFixed(2));
n.font = Font.boldSystemFont(34);
n.textColor = new Color("#4f8cff");
row1.addSpacer(4);
let u = row1.addText("元");
u.font = Font.systemFont(16);
u.textColor = new Color("#8b8fa3");
row1.addSpacer(6);
let dot = row1.addText("●");
dot.font = Font.systemFont(8);
dot.textColor = new Color("#34d399");
row1.addSpacer(4);
let st = row1.addText("可用");
st.font = Font.systemFont(11);
st.textColor = new Color("#34d399");

if (cost != null) {
  w.addSpacer(6);
  let lbl = w.addText("本月");
  lbl.font = Font.systemFont(11);
  lbl.textColor = new Color("#8b8fa3");
  w.addSpacer(2);
  const row2 = w.addStack();
  let v1 = row2.addText("¥" + cost.toFixed(2));
  v1.font = Font.boldSystemFont(16);
  v1.textColor = new Color("#e8eaf0");
  row2.addSpacer(10);
  let v2 = row2.addText(
    tokens >= 100000000 ? (tokens/100000000).toFixed(1)+"亿" :
    tokens >= 10000 ? (tokens/10000).toFixed(0)+"万" :
    tokens.toLocaleString()
  );
  v2.font = Font.boldSystemFont(16);
  v2.textColor = new Color("#a78bfa");
}

w.addSpacer(8);

const now = new Date();
let ft = w.addText(
  now.getHours().toString().padStart(2,"0") + ":" +
  now.getMinutes().toString().padStart(2,"0") + ":" +
  now.getSeconds().toString().padStart(2,"0")
);
ft.font = Font.systemFont(8);
ft.textColor = new Color("#3f4359");

w.refreshAfterDate = new Date(Date.now() + 10 * 60 * 1000);
Script.setWidget(w);
Script.complete();
