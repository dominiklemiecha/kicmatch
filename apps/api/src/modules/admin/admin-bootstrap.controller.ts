import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Headers,
  HttpCode,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiTags } from "@nestjs/swagger";
import * as argon2 from "argon2";
import { z } from "zod";
import { PrismaService } from "../../common/prisma/prisma.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { Env } from "../../config/env.schema";

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1).default("Super"),
  lastName: z.string().min(1).default("Admin"),
});

type BootstrapBody = z.infer<typeof bootstrapSchema>;

@ApiTags("admin")
@Controller("admin")
export class AdminBootstrapController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post("bootstrap")
  @HttpCode(201)
  async bootstrap(
    @Headers("x-bootstrap-token") token: string | undefined,
    @Body(new ZodValidationPipe(bootstrapSchema)) body: BootstrapBody,
  ): Promise<{ id: string; email: string }> {
    const expected = this.config.get("ADMIN_BOOTSTRAP_TOKEN", { infer: true });
    if (!expected) throw new ServiceUnavailableException("Bootstrap disabilitato");
    if (!token || token !== expected) throw new UnauthorizedException();

    const existing = await this.prisma.user.findFirst({ where: { role: "SUPERADMIN" } });
    if (existing) throw new ConflictException("Superadmin already exists");

    const emailLower = body.email.toLowerCase();
    const duplicate = await this.prisma.user.findUnique({ where: { email: emailLower } });
    if (duplicate) throw new BadRequestException("Email già in uso");

    const passwordHash = await argon2.hash(body.password);
    const user = await this.prisma.user.create({
      data: {
        email: emailLower,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        role: "SUPERADMIN",
        emailVerified: true,
      },
      select: { id: true, email: true },
    });
    return user;
  }
}
