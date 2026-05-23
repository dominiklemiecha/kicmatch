import { z } from "zod";

export const locationTypeEnum = z.enum(["PHYSICAL", "ONLINE"]);
export const eventStatusEnum = z.enum(["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"]);

export const paymentMethodsSchema = z.object({
  card: z.boolean().default(true),
  applePay: z.boolean().default(true),
  googlePay: z.boolean().default(true),
  bankTransfer: z.boolean().default(false),
});
export type PaymentMethods = z.infer<typeof paymentMethodsSchema>;

export const createEventSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio").max(120),
  description: z.string().max(5000).optional().nullable(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional().nullable(),
  locationType: locationTypeEnum.default("PHYSICAL"),
  locationName: z.string().max(200).optional().nullable(),
  locationAddress: z.string().max(400).optional().nullable(),
  onlineUrl: z.string().url().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const updateEventSchema = createEventSchema.partial().extend({
  capacity: z.number().int().positive().optional().nullable(),
  rsvpDeadline: z.string().datetime().optional().nullable(),
  isPaid: z.boolean().optional(),
  priceCents: z.number().int().nonnegative().optional().nullable(),
  currency: z.string().length(3).optional(),
  paymentMethods: paymentMethodsSchema.optional(),
});
export type UpdateEventInput = z.infer<typeof updateEventSchema>;

export const eventResponseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  startAt: z.string(),
  endAt: z.string().nullable(),
  locationType: locationTypeEnum,
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  onlineUrl: z.string().nullable(),
  capacity: z.number().int().nullable(),
  rsvpDeadline: z.string().nullable(),
  isPaid: z.boolean(),
  priceCents: z.number().int().nullable(),
  currency: z.string(),
  paymentMethods: z.unknown(),
  status: eventStatusEnum,
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type EventResponse = z.infer<typeof eventResponseSchema>;

export const invitationSourceEnum = z.enum(["MANUAL", "CSV", "LINK"]);
export type InvitationSource = z.infer<typeof invitationSourceEnum>;

export const createInvitationsSchema = z.object({
  source: invitationSourceEnum,
  emails: z.array(z.string().email("Email non valida")).optional().default([]),
});
export type CreateInvitationsInput = z.infer<typeof createInvitationsSchema>;

export const invitationResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  email: z.string().nullable(),
  token: z.string(),
  source: invitationSourceEnum,
  sentAt: z.string().nullable(),
  openedAt: z.string().nullable(),
  createdAt: z.string(),
});
export type InvitationResponse = z.infer<typeof invitationResponseSchema>;

export const fieldTypeEnum = z.enum([
  "FIRST_LAST_NAME",
  "EMAIL",
  "PHONE",
  "COMPANY",
  "SHORT_TEXT",
  "LONG_TEXT",
  "SELECT",
  "MULTISELECT",
]);
export type FieldType = z.infer<typeof fieldTypeEnum>;

export const fieldDefSchema = z.object({
  id: z.string().min(1),
  type: fieldTypeEnum,
  label: z.string().min(1, "Etichetta obbligatoria").max(160),
  required: z.boolean(),
  placeholder: z.string().max(160).optional().nullable(),
  options: z.array(z.string().min(1).max(120)).optional().nullable(),
});
export type FieldDef = z.infer<typeof fieldDefSchema>;

export const eventFormSchema = z.object({
  fields: z.array(fieldDefSchema).max(40),
  privacyRequired: z.boolean(),
});
export type EventFormInput = z.infer<typeof eventFormSchema>;

export const eventFormResponseSchema = eventFormSchema.extend({
  id: z.string(),
  eventId: z.string(),
  updatedAt: z.string(),
});
export type EventFormResponse = z.infer<typeof eventFormResponseSchema>;

export const participantStatusEnum = z.enum([
  "INVITED",
  "OPENED",
  "STARTED",
  "CONFIRMED",
  "PENDING_PAYMENT",
  "PAID",
  "CANCELLED",
  "REJECTED",
]);
export type ParticipantStatus = z.infer<typeof participantStatusEnum>;

export const publicEventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  startAt: z.string(),
  endAt: z.string().nullable(),
  locationType: locationTypeEnum,
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  onlineUrl: z.string().nullable(),
  capacity: z.number().int().nullable(),
  rsvpDeadline: z.string().nullable(),
  isPaid: z.boolean(),
  priceCents: z.number().int().nullable(),
  currency: z.string(),
  organizerName: z.string(),
  form: z.object({
    fields: z.array(fieldDefSchema),
    privacyRequired: z.boolean(),
  }),
  availableSpots: z.number().int().nullable(),
});
export type PublicEvent = z.infer<typeof publicEventSchema>;

export const rsvpInputSchema = z.object({
  email: z.string().email("Email non valida"),
  firstName: z.string().min(1, "Nome richiesto").max(80),
  lastName: z.string().min(1, "Cognome richiesto").max(80),
  phone: z.string().max(40).optional(),
  formData: z.record(z.string(), z.unknown()).default({}),
  privacyAccepted: z.boolean(),
  invitationToken: z.string().optional(),
});
export type RsvpInput = z.infer<typeof rsvpInputSchema>;

export const participantResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  status: participantStatusEnum,
  ticketCode: z.string().nullable(),
  createdAt: z.string(),
});
export type ParticipantResponse = z.infer<typeof participantResponseSchema>;

export const rsvpResultSchema = z.object({
  participant: participantResponseSchema,
  requiresPayment: z.boolean(),
});
export type RsvpResult = z.infer<typeof rsvpResultSchema>;

export const participantListResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  status: participantStatusEnum,
  ticketCode: z.string().nullable(),
  qrCheckedInAt: z.string().nullable(),
  createdAt: z.string(),
  formData: z.unknown(),
});
export type ParticipantListItem = z.infer<typeof participantListResponseSchema>;

export const updateParticipantStatusSchema = z.object({
  status: participantStatusEnum,
  rejectedReason: z.string().max(500).optional().nullable(),
});
export type UpdateParticipantStatusInput = z.infer<typeof updateParticipantStatusSchema>;

export const paymentStatusEnum = z.enum(["PENDING", "PROCESSING", "SUCCEEDED", "FAILED", "REFUNDED"]);
export type PaymentStatus = z.infer<typeof paymentStatusEnum>;

export const checkoutSessionInputSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  phone: z.string().max(40).optional(),
  formData: z.record(z.string(), z.unknown()).default({}),
  privacyAccepted: z.boolean(),
  invitationToken: z.string().optional(),
});
export type CheckoutSessionInput = z.infer<typeof checkoutSessionInputSchema>;

export const checkoutSessionResponseSchema = z.object({
  url: z.string().url(),
  participantId: z.string(),
});
export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>;

export const paymentListItemSchema = z.object({
  id: z.string(),
  amountCents: z.number().int(),
  feeCents: z.number().int(),
  currency: z.string(),
  status: paymentStatusEnum,
  paidAt: z.string().nullable(),
  createdAt: z.string(),
  participant: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    ticketCode: z.string().nullable(),
  }),
  event: z.object({
    id: z.string(),
    name: z.string(),
  }),
});
export type PaymentListItem = z.infer<typeof paymentListItemSchema>;

export const eventPaymentSummarySchema = z.object({
  totalCollectedCents: z.number().int(),
  totalFeesCents: z.number().int(),
  payoutDueCents: z.number().int(),
  currency: z.string(),
  successfulCount: z.number().int(),
  pendingCount: z.number().int(),
});
export type EventPaymentSummary = z.infer<typeof eventPaymentSummarySchema>;

export const payoutStatusEnum = z.enum(["PENDING", "APPROVED", "PAID", "REJECTED"]);
export type PayoutStatus = z.infer<typeof payoutStatusEnum>;

export const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;

export const payoutRequestInputSchema = z.object({
  amountCents: z.number().int().positive(),
  iban: z.string().regex(ibanRegex, "IBAN non valido"),
  ibanHolder: z.string().min(2).max(120),
  notes: z.string().max(500).optional(),
});
export type PayoutRequestInput = z.infer<typeof payoutRequestInputSchema>;

export const payoutResponseSchema = z.object({
  id: z.string(),
  amountCents: z.number().int(),
  currency: z.string(),
  iban: z.string(),
  ibanHolder: z.string(),
  status: payoutStatusEnum,
  notes: z.string().nullable(),
  adminNotes: z.string().nullable(),
  requestedAt: z.string(),
  processedAt: z.string().nullable(),
  user: z.object({ id: z.string(), firstName: z.string(), lastName: z.string(), email: z.string() }).optional(),
});
export type PayoutResponse = z.infer<typeof payoutResponseSchema>;

export const payoutBalanceSchema = z.object({
  totalCollectedCents: z.number().int(),
  totalFeesCents: z.number().int(),
  totalPaidOutCents: z.number().int(),
  pendingRequestCents: z.number().int(),
  availableCents: z.number().int(),
  currency: z.string(),
});
export type PayoutBalance = z.infer<typeof payoutBalanceSchema>;
