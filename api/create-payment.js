import crypto from "node:crypto";
const PLANS = {
  monthly: { label: "Monthly Access", amount: 1999.00 },
  "3months": { label: "3 Months Access", amount: 2999.00 },
  yearly: { label: "1 Year Access", amount: 6999.00 },
};
const WATCHPAYS_ENDPOINT = "https://api.watchpays.com/v1/create";
function md5(str) {
  return crypto.createHash("md5").update(str, "utf8").digest("hex");
}
function buildSignature({ merchant_id, amount, merchant_order_no, callback_url }, apiKey) {
  const params = { merchant_id, amount, merchant_order_no, callback_url };
  Object.keys(params).forEach((k) => {
    if (params[k] === "" || params[k] === null || params[k] === undefined) delete params[k];
  });
  const sortedKeys = Object.keys(params).sort();
  let signStr = "";
  for (const k of sortedKeys) signStr += `${k}=${params[k]}&`;
  signStr += `key=${apiKey}`;
  return md5(signStr);
}
function formatAmount(n) {
  return Number(n).toFixed(2);
}
function genOrderNo() {
  return `ORD${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }
  try {
    const merchantId = process.env.WATCHPAYS_MERCHANT_ID;
    const apiKey = process.env.WATCHPAYS_API_KEY;
    if (!merchantId || !apiKey) {
      return res.status(500).json({
        success: false,
        error: "WatchPays environment variables are not configured"
      });
    }
    const { plan } = req.body || {};
    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }
    const merchant_order_no = genOrderNo();
    const amount = formatAmount(selectedPlan.amount);
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    const callback_url = `${proto}://${host}/api/callback`;
    const signature = buildSignature(
      { merchant_id: merchantId, amount, merchant_order_no, callback_url },
      apiKey
    );
    const payload = {
      merchant_id: merchantId,
      api_key: apiKey,
      amount,
      merchant_order_no,
      callback_url,
      extra: "",
      signature,
    };
    const gwRes = await fetch(WATCHPAYS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const gwData = await gwRes.json().catch(() => null);
    if (!gwData || gwData.success !== true || !gwData.payment_url) {
      return res.status(502).json({
        success: false,
        error: (gwData && gwData.error) || "Gateway error",
        raw: gwData,
      });
    }
    return res.status(200).json({
      success: true,
      payment_url: gwData.payment_url,
      order_no: gwData.order_no || merchant_order_no,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
}
