import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import {
  checkoutSessionInputSchema,
  checkoutSessionResponseSchema,
  publicEventSchema,
  rsvpInputSchema,
  rsvpResultSchema,
  type CheckoutSessionInput,
  type CheckoutSessionResponse,
  type FieldDef,
  type PublicEvent,
  type RsvpInput,
  type RsvpResult,
} from "@kicmatch/shared";
import type { Request } from "express";
import type { Stripe } from "stripe/cjs/stripe.core.js";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { Env } from "../../config/env.schema";
import { StripeService } from "../stripe/stripe.service";
import { PublicService } from "./public.service";

@ApiTags("public")
@Controller()
export class PublicController {
  constructor(
    private readonly publicSvc: PublicService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {}

  @Get("public/events/:slug")
  async getEvent(@Param("slug") slug: string): Promise<PublicEvent> {
    const data = await this.publicSvc.getBySlug(slug);
    if (!data) throw new NotFoundException("Evento non trovato");
    const e = data.event;
    const fields = Array.isArray(data.form.fields) ? (data.form.fields as FieldDef[]) : [];
    const organizerName = e.user.profileName ?? `${e.user.firstName} ${e.user.lastName}`;
    const availableSpots = e.capacity !== null ? Math.max(0, e.capacity - data.participantCount) : null;
    return publicEventSchema.parse({
      id: e.id,
      slug: e.slug,
      name: e.name,
      description: e.description,
      coverImageUrl: e.coverImageUrl,
      startAt: e.startAt.toISOString(),
      endAt: e.endAt ? e.endAt.toISOString() : null,
      locationType: e.locationType,
      locationName: e.locationName,
      locationAddress: e.locationAddress,
      onlineUrl: e.onlineUrl,
      capacity: e.capacity,
      rsvpDeadline: e.rsvpDeadline ? e.rsvpDeadline.toISOString() : null,
      isPaid: e.isPaid,
      priceCents: e.priceCents,
      currency: e.currency,
      organizerName,
      form: { fields, privacyRequired: data.form.privacyRequired },
      availableSpots,
    });
  }

  @Post("public/events/:slug/rsvp")
  @HttpCode(201)
  async rsvp(
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(rsvpInputSchema)) body: RsvpInput,
  ): Promise<RsvpResult> {
    const { participant, requiresPayment } = await this.publicSvc.rsvp(slug, body);
    return rsvpResultSchema.parse({
      participant: {
        id: participant.id,
        eventId: participant.eventId,
        email: participant.email,
        firstName: participant.firstName,
        lastName: participant.lastName,
        status: participant.status,
        ticketCode: participant.ticketCode,
        createdAt: participant.createdAt.toISOString(),
      },
      requiresPayment,
    });
  }

  @Get("public/checkout/:sessionId")
  async getCheckoutInfo(@Param("sessionId") sessionId: string): Promise<{
    eventName: string;
    eventStartAt: string;
    eventEndAt: string | null;
    locationName: string | null;
    locationAddress: string | null;
    locationType: string;
    onlineUrl: string | null;
    slug: string;
    participantEmail: string;
    ticketCode: string | null;
    status: string;
  }> {
    let payment = await this.prisma.payment.findUnique({
      where: { stripeCheckoutId: sessionId },
      include: { participant: { include: { event: true } } },
    });
    if (!payment) throw new NotFoundException("Sessione non trovata");
    // Fallback: if webhook never fired but Stripe says paid, finalize now
    if (payment.status !== "SUCCEEDED" && this.stripe.isConfigured) {
      try {
        const session = await this.stripe.retrieveSession(sessionId);
        if (session.payment_status === "paid" && session.amount_total) {
          const feeCents = this.stripe.calculateFee(session.amount_total);
          await this.publicSvc.markPaid(payment.participantId, {
            stripeCheckoutId: session.id,
            stripePaymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
            amountCents: session.amount_total,
            feeCents,
            currency: (session.currency ?? "eur").toUpperCase(),
          });
          payment = await this.prisma.payment.findUnique({
            where: { stripeCheckoutId: sessionId },
            include: { participant: { include: { event: true } } },
          });
        }
      } catch {
        // swallow — if Stripe call fails just return current state
      }
    }
    if (!payment) throw new NotFoundException("Sessione non trovata");
    const p = payment.participant;
    const e = p.event;
    return {
      eventName: e.name,
      eventStartAt: e.startAt.toISOString(),
      eventEndAt: e.endAt ? e.endAt.toISOString() : null,
      locationName: e.locationName,
      locationAddress: e.locationAddress,
      locationType: e.locationType,
      onlineUrl: e.onlineUrl,
      slug: e.slug,
      participantEmail: p.email,
      ticketCode: p.ticketCode,
      status: p.status,
    };
  }

  @Post("public/events/:slug/checkout-session")
  @HttpCode(201)
  async createCheckout(
    @Param("slug") slug: string,
    @Body(new ZodValidationPipe(checkoutSessionInputSchema)) body: CheckoutSessionInput,
  ): Promise<CheckoutSessionResponse> {
    if (!this.stripe.isConfigured) {
      throw new ServiceUnavailableException("I pagamenti non sono ancora attivi. Contatta l'organizzatore.");
    }
    const { participant, event } = await this.publicSvc.rsvp(slug, body);
    if (!event.isPaid || event.priceCents === null || event.priceCents <= 0) {
      throw new BadRequestException("Evento gratuito: non serve checkout");
    }
    const appUrl = this.config.get("APP_PUBLIC_URL", { infer: true });
    const feeCents = this.stripe.calculateFee(event.priceCents);
    const session = await this.stripe.createCheckoutSession({
      amountCents: event.priceCents,
      currency: event.currency,
      eventName: event.name,
      eventSlug: event.slug,
      customerEmail: participant.email,
      participantId: participant.id,
      successUrl: `${appUrl}/e/${event.slug}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/e/${event.slug}/cancelled?participant=${participant.id}`,
    });
    await this.publicSvc.createPendingPayment(participant.id, event.priceCents, feeCents, event.currency, session.id);
    if (!session.url) throw new ServiceUnavailableException("URL Stripe non disponibile");
    return checkoutSessionResponseSchema.parse({ url: session.url, participantId: participant.id });
  }

  @Post("webhooks/stripe")
  @HttpCode(200)
  async stripeWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") signature: string,
  ): Promise<{ received: boolean }> {
    if (!this.stripe.isConfigured) throw new ServiceUnavailableException();
    if (!signature) throw new BadRequestException("Firma Stripe assente");
    // @ts-expect-error rawBody attached by main.ts express config
    const raw: Buffer | undefined = req.rawBody;
    if (!raw) throw new BadRequestException("Body grezzo non disponibile");

    let event: Stripe.Event;
    try {
      event = this.stripe.constructWebhookEvent(raw, signature);
    } catch (err) {
      throw new BadRequestException(`Webhook signature invalida: ${(err as Error).message}`);
    }

    const existing = await this.prisma.processedWebhook.findUnique({ where: { stripeEventId: event.id } });
    if (existing) return { received: true };

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const participantId = session.metadata?.participantId;
      if (participantId && session.payment_status === "paid") {
        const amountCents = session.amount_total ?? 0;
        const feeCents = this.stripe.calculateFee(amountCents);
        await this.publicSvc.markPaid(participantId, {
          stripeCheckoutId: session.id,
          stripePaymentIntent: typeof session.payment_intent === "string" ? session.payment_intent : null,
          amountCents,
          feeCents,
          currency: (session.currency ?? "eur").toUpperCase(),
        });
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const participantId = intent.metadata?.participantId;
      if (participantId) {
        await this.publicSvc.recordFailedPayment(participantId, intent.last_payment_error?.message ?? "Pagamento fallito");
      }
    }

    await this.prisma.processedWebhook.create({ data: { stripeEventId: event.id } });
    return { received: true };
  }
}
