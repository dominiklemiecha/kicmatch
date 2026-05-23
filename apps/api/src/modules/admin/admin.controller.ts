import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { SuperadminGuard } from "../auth/superadmin.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { AdminService } from "./admin.service";

const markPayoutSchema = z.object({
  status: z.enum(["PAID", "REJECTED"]),
  adminNotes: z.string().max(500).optional(),
});

const blockUserSchema = z.object({
  blocked: z.boolean(),
  reason: z.string().max(500).optional(),
});

const updateSubscriptionSchema = z.object({
  subscriptionStartAt: z.string().datetime().nullable().optional(),
  subscriptionEndAt: z.string().datetime().nullable().optional(),
});

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperadminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("stats")
  async stats(): Promise<unknown> { return this.admin.stats(); }

  @Get("users")
  async users(): Promise<unknown[]> { return this.admin.listUsers(); }

  @Get("users/:id")
  async userDetail(@Param("id") id: string): Promise<unknown> { return this.admin.userDetail(id); }

  @Get("payouts")
  async payouts(@Query("status") status?: string): Promise<unknown[]> {
    const valid = status === "PENDING" || status === "PAID" || status === "REJECTED" ? status : undefined;
    return this.admin.listPayouts(valid);
  }

  @Patch("payouts/:id")
  async markPayout(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(markPayoutSchema)) body: { status: "PAID" | "REJECTED"; adminNotes?: string },
  ): Promise<unknown> {
    return this.admin.markPayout(id, body.status, body.adminNotes);
  }

  @Patch("users/:id/block")
  async blockUser(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(blockUserSchema)) body: { blocked: boolean; reason?: string },
  ): Promise<unknown> {
    return this.admin.setUserBlocked(id, body.blocked, body.reason);
  }

  @Patch("users/:id/subscription")
  async updateSubscription(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateSubscriptionSchema)) body: { subscriptionStartAt?: string | null; subscriptionEndAt?: string | null },
  ): Promise<unknown> {
    return this.admin.updateSubscription(id, body);
  }
}
