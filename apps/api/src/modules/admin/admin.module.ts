import { Module } from "@nestjs/common";
import { AdminBootstrapController } from "./admin-bootstrap.controller";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { SuperadminGuard } from "../auth/superadmin.guard";

@Module({
  controllers: [AdminController, AdminBootstrapController],
  providers: [AdminService, SuperadminGuard],
})
export class AdminModule {}
