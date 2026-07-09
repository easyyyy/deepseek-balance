// DeepSeek API 调试脚本
const param = args.widgetParameter || "";
let apiKey = "", userToken = "";

if (param.includes("|")) {
  const parts = param.split("|");
  apiKey = parts[0].trim();
  userToken = parts[1].trim();
} else {
  apiKey = param;
}

// 没参数时从 Keychain 读
if (!apiKey && Keychain.contains("ds_api_key")) apiKey = Keychain.get("ds_api_key");
if (!userToken && Keychain.contains("ds_user_token")) userToken = Keychain.get("ds_user_token");

const w = new ListWidget();
w.backgroundColor = new Color("#0f1117");
w.setPadding(10, 10, 10, 10);

function addLine(text, color) {
  let t = w.addText(text);
  t.font = Font.monospacedSystemFont(11);
  t.textColor = color || new Color("#e8eaf0");
}

addLine("🔑 API Key: " + (apiKey ? apiKey.slice(0,8) + "..." : "无"), new Color("#fbbf24"));
addLine("🔑 UserToken: " + (userToken ? userToken.slice(0,8) + "..." : "无"), new Color("#fbbf24"));
w.addSpacer(6);

// Test balance API
if (apiKey) {
  addLine("--- 测试余额 API ---", new Color("#4f8cff"));
  try {
    const r1 = new Request("https://api.deepseek.com/user/balance");
    r1.headers = { "Authorization": "Bearer " + apiKey };
    const d1 = await r1.loadJSON();
    addLine("✅ 成功", new Color("#34d399"));
    addLine(JSON.stringify(d1).slice(0, 200), new Color("#8b8fa3"));
  } catch(e) {
    addLine("❌ " + e.message, new Color("#f87171"));
  }
} else {
  addLine("跳过余额测试", new Color("#555a70"));
}

w.addSpacer(6);

// Test usage API
if (userToken) {
  addLine("--- 测试消费 API ---", new Color("#a78bfa"));
  try {
    const r2 = new Request("https://platform.deepseek.com/api/v0/users/get_user_summary");
    r2.method = "GET";
    r2.headers = { "Authorization": "Bearer " + userToken, "User-Agent": "Scriptable" };
    const d2 = await r2.loadJSON();
    addLine("✅ 成功", new Color("#34d399"));
    addLine("code: " + d2.code, new Color("#8b8fa3"));
    if (d2.code === 0) {
      addLine("消费: ¥" + d2.data?.biz_data?.monthly_costs?.[0]?.amount, new Color("#34d399"));
      addLine("Token: " + d2.data?.biz_data?.monthly_token_usage, new Color("#34d399"));
    } else {
      addLine("msg: " + d2.msg, new Color("#f87171"));
    }
  } catch(e) {
    addLine("❌ " + e.message, new Color("#f87171"));
  }
} else {
  addLine("跳过消费测试", new Color("#555a70"));
}

w.presentMedium();
Script.complete();
