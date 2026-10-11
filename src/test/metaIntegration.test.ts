import { describe, it } from 'node:test';
import assert from 'node:assert';
import { INITIAL_COMPANY_CONFIG } from '../data/mockData.ts';

// Simulated Meta Webhook Verification function
function verifyMetaWebhook(query: Record<string, string>, expectedToken: string) {
  const mode = query['hub.mode'];
  const token = query['hub.verify_token'];
  const challenge = query['hub.challenge'];

  if (mode === 'subscribe' && token === expectedToken) {
    return { status: 200, body: challenge };
  }
  return { status: 403, body: 'Forbidden' };
}

// Simulated Meta Inbound Message Parser
function parseMetaInboundPayload(payload: any) {
  if (payload.object !== 'whatsapp_business_account') {
    return null;
  }

  const entry = payload.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;

  if (!value || !value.messages || value.messages.length === 0) {
    return null;
  }

  const msg = value.messages[0];
  return {
    from: msg.from,
    wamid: msg.id,
    text: msg.text?.body || '',
    timestamp: msg.timestamp,
  };
}

// Simulated Meta Outbound Payload Formatter
function buildWhatsAppPayload(toPhone: string, text: string) {
  const cleanPhone = toPhone.replace(/\D/g, '');
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: { body: text },
  };
}

describe('Meta Graph API & WhatsApp Cloud API Integration Suite', () => {

  describe('1. Webhook Handshake Verification (GET)', () => {
    const SECRET = 'centegix_secure_verify_token_2026';

    it('should successfully verify handshake when verify token matches', () => {
      const query = {
        'hub.mode': 'subscribe',
        'hub.verify_token': SECRET,
        'hub.challenge': '1158201203948',
      };

      const result = verifyMetaWebhook(query, SECRET);
      assert.strictEqual(result.status, 200);
      assert.strictEqual(result.body, '1158201203948');
    });

    it('should reject handshake with HTTP 403 when verify token does not match', () => {
      const query = {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_invalid_token',
        'hub.challenge': '1158201203948',
      };

      const result = verifyMetaWebhook(query, SECRET);
      assert.strictEqual(result.status, 403);
      assert.strictEqual(result.body, 'Forbidden');
    });
  });

  describe('2. Inbound WhatsApp Payload Ingestion (POST)', () => {
    it('should parse valid Meta WhatsApp inbound webhook payload', () => {
      const sampleMetaWebhookBody = {
        object: 'whatsapp_business_account',
        entry: [
          {
            id: '109283746591029',
            changes: [
              {
                value: {
                  messaging_product: 'whatsapp',
                  metadata: {
                    display_phone_number: '+91 80 4920 8800',
                    phone_number_id: '105938201928471',
                  },
                  messages: [
                    {
                      from: '919876543210',
                      id: 'wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSQjE4OTM3NEY2NTkxMDI5AA==',
                      timestamp: '1760000000',
                      text: { body: 'Hello! I need a quote for enterprise cloud migration.' },
                      type: 'text',
                    },
                  ],
                },
                field: 'messages',
              },
            ],
          },
        ],
      };

      const parsed = parseMetaInboundPayload(sampleMetaWebhookBody);
      assert.notStrictEqual(parsed, null);
      assert.strictEqual(parsed?.from, '919876543210');
      assert.strictEqual(parsed?.wamid, 'wamid.HBgMOTE5ODc2NTQzMjEwFQIAERgSQjE4OTM3NEY2NTkxMDI5AA==');
      assert.strictEqual(parsed?.text, 'Hello! I need a quote for enterprise cloud migration.');
    });
  });

  describe('3. Outbound Message Payload Formatter', () => {
    it('should format phone number and structure valid WhatsApp Cloud API request payload', () => {
      const rawPhone = '+91 (987) 654-3210';
      const text = 'Dear Rajesh, your quotation #Q-2026-804 is ready.';

      const payload = buildWhatsAppPayload(rawPhone, text);

      assert.strictEqual(payload.messaging_product, 'whatsapp');
      assert.strictEqual(payload.to, '919876543210'); // Verify non-digits stripped
      assert.strictEqual(payload.type, 'text');
      assert.strictEqual(payload.text.body, text);
    });
  });

  describe('4. CRM Settings & Meta Configuration Validation', () => {
    it('should have valid initial Meta and Email configurations in CompanyConfig', () => {
      const config = INITIAL_COMPANY_CONFIG;

      assert.ok(config.metaConfig, 'metaConfig should be defined');
      assert.strictEqual(config.metaConfig?.status, 'Connected');
      assert.strictEqual(config.metaConfig?.wabaId, '109283746591029');
      assert.strictEqual(config.metaConfig?.phoneNumberId, '105938201928471');

      assert.ok(config.emailConfig, 'emailConfig should be defined');
      assert.strictEqual(config.emailConfig?.provider, 'Resend');
      assert.strictEqual(config.emailConfig?.status, 'Connected');
    });
  });
});
