import { Body, Controller, Get, HttpCode, Patch, Post, Req, Res, UnauthorizedException, UseGuards, UsePipes } from "@nestjs/common";
import { z } from "zod";
import { ConfigService } from "@nestjs/config";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { loginSchema, registerSchema, type AuthResponse, type LoginInput, type MeResponse, type RegisterInput } from "@kicmatch/shared";
import type { Request, Response } from "express";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import type { Env } from "../../config/env.schema";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { JwtPayload } from "./jwt.strategy";

const REFRESH_COOKIE = "kicmatch_refresh";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post("register")
  @UsePipes(new ZodValidationPipe(registerSchema))
  async register(@Body() body: RegisterInput, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const { user, accessToken, refreshToken } = await this.auth.register(body);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user: this.toMe(user) };
  }

  @Post("login")
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(@Body() body: LoginInput, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const { user, accessToken, refreshToken } = await this.auth.login(body);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user: this.toMe(user) };
  }

  @Post("refresh")
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponse> {
    const raw = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    if (!raw) throw new UnauthorizedException("Refresh assente");
    const { user, accessToken, refreshToken } = await this.auth.refresh(raw);
    this.setRefreshCookie(res, refreshToken);
    return { accessToken, user: this.toMe(user) };
  }

  @Post("forgot-password")
  @HttpCode(202)
  async forgotPassword(
    @Body(new ZodValidationPipe(z.object({ email: z.string().email() })))
    body: { email: string },
  ): Promise<{ ok: true }> {
    await this.auth.requestPasswordReset(body.email);
    return { ok: true };
  }

  @Post("reset-password")
  @HttpCode(200)
  async resetPassword(
    @Body(new ZodValidationPipe(z.object({
      token: z.string().min(32),
      password: z.string().min(8).max(120),
    })))
    body: { token: string; password: string },
  ): Promise<{ ok: true }> {
    await this.auth.resetPassword(body.token, body.password);
    return { ok: true };
  }

  @Post("logout")
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    const raw = (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE];
    await this.auth.logout(raw);
    this.clearRefreshCookie(res);
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() jwt: JwtPayload): Promise<MeResponse> {
    const user = await this.auth.getUser(jwt.sub);
    if (!user) throw new UnauthorizedException();
    return this.toMe(user);
  }

  @Patch("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateMe(
    @CurrentUser() jwt: JwtPayload,
    @Body(new ZodValidationPipe(z.object({
      firstName: z.string().min(1).max(80).optional(),
      lastName: z.string().min(1).max(80).optional(),
      profileType: z.enum(["PRIVATE", "BUSINESS"]).optional(),
      profileName: z.string().max(120).nullable().optional(),
      country: z.string().max(60).nullable().optional(),
      avatarUrl: z.string().url().nullable().optional(),
      bio: z.string().max(500).nullable().optional(),
      website: z.string().max(255).nullable().optional(),
      ibanDefault: z.string().max(40).nullable().optional(),
      ibanHolderDefault: z.string().max(120).nullable().optional(),
    }))) body: Record<string, unknown>,
  ): Promise<MeResponse> {
    const user = await this.auth.updateProfile(jwt.sub, body);
    return this.toMe(user);
  }

  private toMe(user: { id: string; email: string; firstName: string; lastName: string; profileType: "PRIVATE" | "BUSINESS"; profileName: string | null; country: string; avatarUrl: string | null; bio: string | null; website: string | null; ibanDefault: string | null; ibanHolderDefault: string | null; plan: "FREE" | "PRO" | "BUSINESS" | "ENTERPRISE"; stripeOnboarded: boolean; emailVerified: boolean; role: "ORGANIZER" | "SUPERADMIN" }): MeResponse {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileType: user.profileType,
      profileName: user.profileName,
      country: user.country,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      website: user.website,
      ibanDefault: user.ibanDefault,
      ibanHolderDefault: user.ibanHolderDefault,
      plan: user.plan,
      stripeOnboarded: user.stripeOnboarded,
      emailVerified: user.emailVerified,
      role: user.role,
    };
  }

  private setRefreshCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.config.get("COOKIE_SECURE", { infer: true }),
      sameSite: "lax",
      domain: this.config.get("COOKIE_DOMAIN", { infer: true }),
      path: "/api/v1/auth",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, {
      domain: this.config.get("COOKIE_DOMAIN", { infer: true }),
      path: "/api/v1/auth",
    });
  }
}
