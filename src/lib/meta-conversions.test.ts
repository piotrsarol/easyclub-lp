import { afterEach, describe, expect, it, vi } from "vitest";
import { sendMetaLead } from "./meta-conversions";

const originalEnvironment = { ...process.env };

afterEach(() => {
  vi.restoreAllMocks();
  process.env = { ...originalEnvironment };
});

describe("sendMetaLead", () => {
  it("does not call Meta without marketing consent", async () => {
    process.env.META_PIXEL_ID = "pixel-id";
    process.env.META_CONVERSIONS_API_ACCESS_TOKEN = "token";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await sendMetaLead({
      email: "jan@example.com",
      eventId: "event-1",
      eventSourceUrl: "https://www.easyclub.pl/pilot",
      request: new Request("https://www.easyclub.pl/api/leads"),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a deduplicatable hashed Lead payload", async () => {
    process.env.META_PIXEL_ID = "pixel-id";
    process.env.META_CONVERSIONS_API_ACCESS_TOKEN = "token";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ events_received: 1 }), { status: 200 })));

    await sendMetaLead({
      email: "JAN@example.com",
      eventId: "event-1",
      eventSourceUrl: "https://www.easyclub.pl/pilot",
      phone: "+48 500 600 700",
      request: new Request("https://www.easyclub.pl/api/leads", {
        headers: {
          Cookie: "easyclub-cookie-consent=accepted; _fbp=fb.1.123; _fbc=fb.1.456",
          "User-Agent": "Vitest",
          "X-Forwarded-For": "203.0.113.10",
        },
      }),
    });

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(options.body)) as {
      data: Array<{
        event_id: string;
        event_name: string;
        user_data: Record<string, string>;
      }>;
    };

    expect(url).toBe("https://graph.facebook.com/v20.0/pixel-id/events");
    expect(payload.data[0]).toMatchObject({
      event_id: "event-1",
      event_name: "Lead",
    });
    expect(payload.data[0].user_data).toMatchObject({
      client_ip_address: "203.0.113.10",
      client_user_agent: "Vitest",
      fbc: "fb.1.456",
      fbp: "fb.1.123",
    });
    expect(payload.data[0].user_data.em).toMatch(/^[a-f0-9]{64}$/);
    expect(payload.data[0].user_data.ph).toMatch(/^[a-f0-9]{64}$/);
  });

  it("does not call Meta when credentials are missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await sendMetaLead({
      email: "jan@example.com",
      eventId: "event-1",
      eventSourceUrl: "https://www.easyclub.pl/",
      request: new Request("https://www.easyclub.pl/api/leads", {
        headers: { Cookie: "easyclub-cookie-consent=accepted" },
      }),
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
