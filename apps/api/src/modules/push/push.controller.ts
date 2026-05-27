import { Body, Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { PrismaService } from "../../common/prisma/prisma.service";
import { CurrentUser } from "../auth/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { JwtPayload } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";

const registerSchema = z.object({
  token: z.string().min(10).max(500),
  platform: z.enum(["android", "ios", "web"]),
});

@ApiTags("devices")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("devices")
export class PushController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("register")
  async register(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(registerSchema)) body: { token: string; platform: "android" | "ios" | "web" },
  ): Promise<{ ok: true }> {
    // Upsert: a token is globally unique; re-link it to the current user if
    // the same device was previously used by someone else.
    await this.prisma.deviceToken.upsert({
      where: { token: body.token },
      update: { userId: user.sub, platform: body.platform },
      create: { userId: user.sub, token: body.token, platform: body.platform },
    });
    return { ok: true };
  }

  @Delete(":token")
  async unregister(@Param("token") token: string): Promise<{ ok: true }> {
    await this.prisma.deviceToken.deleteMany({ where: { token } });
    return { ok: true };
  }
}
