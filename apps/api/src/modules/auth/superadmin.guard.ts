import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { JwtPayload } from "./jwt.strategy";

@Injectable()
export class SuperadminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const jwt = req.user as JwtPayload | undefined;
    if (!jwt) throw new ForbiddenException();
    const user = await this.prisma.user.findUnique({ where: { id: jwt.sub }, select: { role: true } });
    if (!user || user.role !== "SUPERADMIN") throw new ForbiddenException("Solo per super admin");
    return true;
  }
}
