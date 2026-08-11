export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  try {
    const data = req.body || {};
    console.log("WatchPays callback:", data);

    // WatchPays expects plain-text "success" acknowledgement.
    return res.status(200).send("success");
  } catch (err) {
    console.error("Callback error:", err);
    return res.status(200).send("success");
  }
}
