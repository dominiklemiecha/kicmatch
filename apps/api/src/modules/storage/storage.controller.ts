import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { z } from "zod";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { StorageService } from "./storage.service";

const presignSchema = z.object({
  contentType: z.string().regex(/^image\/(png|jpe?g|webp|gif)$/i, "Tipo non supportato"),
});

@ApiTags("storage")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("storage")
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post("presign")
  async presign(@Body(new ZodValidationPipe(presignSchema)) body: { contentType: string }): Promise<{ uploadUrl: string; publicUrl: string }> {
    const { uploadUrl, publicUrl } = await this.storage.createPresignedUploadUrl(body.contentType);
    return { uploadUrl, publicUrl };
  }
}
