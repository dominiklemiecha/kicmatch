import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import type { Stripe as StripeCore } from "stripe/cjs/stripe.core.js";
import type { Env } from "../../config/env.schema";

const FREE_PLAN_CARD_FEE_BPS = 800; // 8%

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private readonly client: StripeCore | null;

  constructor(private readonly config: ConfigService<Env, true>) {
    const key = this.config.get("STRIPE_SECRET_KEY", { infer: true });
    if (!key || key.includes("PLACEHOLDER")) {
      this.logger.warn("STRIPE_SECRET_KEY non configurata: i pagamenti sono disabilitati");
      this.client = null;
    } else {
      this.client = new Stripe(key) as unknown as StripeCore;
    }
  }

  get isConfigured(): boolean {
    return this.client !== null;
  }

  ensureClient(): StripeCore {
    if (!this.client) {
      throw new ServiceUnavailableException("Stripe non configurato. Contatta il supporto.");
    }
    return this.client;
  }

  calculateFee(amountCents: number): number {
    return Math.round((amountCents * FREE_PLAN_CARD_FEE_BPS) / 10000);
  }

  async createCheckoutSession(params: {
    amountCents: number;
    currency: string;
    eventName: string;
    eventSlug: string;
    customerEmail: string;
    participantId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<StripeCore.Checkout.Session> {
    const stripe = this.ensureClient();
    return stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: params.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: params.currency.toLowerCase(),
            unit_amount: params.amountCents,
            product_data: {
              name: params.eventName,
              description: `Iscrizione a ${params.eventName}`,
            },
          },
        },
      ],
      metadata: {
        participantId: params.participantId,
        eventSlug: params.eventSlug,
      },
      payment_intent_data: {
        metadata: { participantId: params.participantId },
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    });
  }

  constructWebhookEvent(rawBody: Buffer, signature: string): StripeCore.Event {
    const stripe = this.ensureClient();
    const secret = this.config.get("STRIPE_WEBHOOK_SECRET", { infer: true });
    return stripe.webhooks.constructEvent(rawBody, signature, secret);
  }

  async retrieveSession(sessionId: string): Promise<StripeCore.Checkout.Session> {
    const stripe = this.ensureClient();
    return stripe.checkout.sessions.retrieve(sessionId);
  }
}
