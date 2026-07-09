// v1.0
const p = args.widgetParameter || "";
const s = p.split("|");
const key = s[0] || "";
const tok = s[1] || "";

let bal = 0, cost = null, tks = null;
if (key) {
  try {
    const r = new Request("https://api.deepseek.com/user/balance");
    r.headers = { Authorization: "Bearer " + key };
    const d = await r.loadJSON();
    bal = parseFloat(d.balance_infos?.[0]?.total_balance || 0);
  } catch(e) {}
}
if (tok) {
  try {
    const r = new Request("https://platform.deepseek.com/api/v0/users/get_user_summary");
    r.headers = { Authorization: "Bearer " + tok };
    const d = await r.loadJSON();
    if (d.code === 0) {
      cost = parseFloat(d.data.biz_data.monthly_costs[0].amount || 0);
      tks = parseInt(d.data.biz_data.monthly_token_usage || 0);
    }
  } catch(e) {}
}

if (!config.runsInWidget) {
  const w = new ListWidget();
  w.backgroundColor = new Color("#111");
  w.setPadding(10, 10, 10, 10);
  w.addText("Key: " + (key ? "OK" : "NO")).font = Font.systemFont(12);
  w.addText("Tkn: " + (tok ? "OK" : "NO")).font = Font.systemFont(12);
  if (cost != null) {
    w.addText("消费: " + cost.toFixed(2)).font = Font.systemFont(12);
    w.addText("Tokens: " + (tks || 0)).font = Font.systemFont(12);
  }
  w.presentMedium();
  Script.complete();
}

const w = new ListWidget();
w.backgroundColor = new Color("#0f1117");
w.setPadding(14, 14, 14, 14);

const r1 = w.addStack();
r1.addText("DeepSeek").font = Font.boldSystemFont(14);
r1.addText("").textColor = Color.white();

w.addSpacer(6);

const r2 = w.addStack();
r2.addText(bal.toFixed(2)).font = Font.boldSystemFont(34);
r2.addText("").textColor = Color.blue();
r2.addSpacer(4);
r2.addText("元").font = Font.systemFont(16);
r2.addText("").textColor = new Color("#888");

w.addSpacer(6);

if (cost != null) {
  const r3 = w.addStack();
  r3.addText("本月 " + cost.toFixed(2)).font = Font.systemFont(13);
  r3.addText("").textColor = Color.white();
  r3.addSpacer(8);
  const ts = tks >= 10000 ? (tks/10000).toFixed(0)+"万" : (tks||0).toString();
  r3.addText(ts).font = Font.systemFont(13);
  r3.addText("").textColor = new Color("#a78bfa");
}

w.addSpacer(6);

const n = new Date();
w.addText(n.getHours()+":"+n.getMinutes()).font = Font.systemFont(9);
w.addText("").textColor = new Color("#555");

w.refreshAfterDate = new Date(Date.now() + 600000);
Script.setWidget(w);
Script.complete();
