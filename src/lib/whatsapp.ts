/** Extra charge for printing a name — kept in name-print.ts */

/**
 * Send a WhatsApp text to the shop owner when a new order arrives.
 *
 * Configure ONE of:
 * 1) Meta WhatsApp Cloud API (recommended for Business):
 *    WHATSAPP_CLOUD_TOKEN, WHATSAPP_PHONE_NUMBER_ID, ORDER_NOTIFY_WHATSAPP
 * 2) CallMeBot (personal WhatsApp, quick setup):
 *    CALLMEBOT_APIKEY, ORDER_NOTIFY_WHATSAPP
 *    Setup: https://www.callmebot.com/blog/free-api-whatsapp-messages/
 */
export async function sendWhatsAppText(
  toPhone: string,
  text: string
): Promise<{ sent: boolean; reason?: string }> {
  const digits = toPhone.replace(/\D/g, "");
  if (!digits) return { sent: false, reason: "no_phone" };

  const token = process.env.WHATSAPP_CLOUD_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (token && phoneNumberId) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: digits,
            type: "text",
            text: { preview_url: false, body: text.slice(0, 4096) },
          }),
        }
      );
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn("[whatsapp] Cloud API failed", res.status, body.slice(0, 300));
        return { sent: false, reason: "cloud_api_error" };
      }
      return { sent: true };
    } catch (err) {
      console.warn("[whatsapp] Cloud API exception", err);
      return { sent: false, reason: "exception" };
    }
  }

  const callmebotKey = process.env.CALLMEBOT_APIKEY?.trim();
  if (callmebotKey) {
    try {
      const url = new URL("https://api.callmebot.com/whatsapp.php");
      url.searchParams.set("phone", digits);
      url.searchParams.set("text", text.slice(0, 4000));
      url.searchParams.set("apikey", callmebotKey);
      const res = await fetch(url.toString());
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn("[whatsapp] CallMeBot failed", res.status, body.slice(0, 200));
        return { sent: false, reason: "callmebot_error" };
      }
      return { sent: true };
    } catch (err) {
      console.warn("[whatsapp] CallMeBot exception", err);
      return { sent: false, reason: "exception" };
    }
  }

  console.warn(
    "[whatsapp] Skipping — set WHATSAPP_CLOUD_TOKEN + WHATSAPP_PHONE_NUMBER_ID, or CALLMEBOT_APIKEY, plus ORDER_NOTIFY_WHATSAPP"
  );
  return { sent: false, reason: "not_configured" };
}

export function ownerNotifyWhatsAppPhone(): string {
  return (
    process.env.ORDER_NOTIFY_WHATSAPP?.trim() ||
    process.env.NEXT_PUBLIC_ORDER_NOTIFY_WHATSAPP?.trim() ||
    ""
  );
}
