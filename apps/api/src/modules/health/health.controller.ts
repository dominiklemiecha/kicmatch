import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../../common/prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check(): Promise<{ status: "ok"; uptime: number; db: "ok" | "down"; timestamp: string }> {
    let db: "ok" | "down" = "down";
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      db = "ok";
    } catch {
      db = "down";
    }
    return {
      status: "ok",
      uptime: process.uptime(),
      db,
      timestamp: new Date().toISOString(),
    };
  }
}
