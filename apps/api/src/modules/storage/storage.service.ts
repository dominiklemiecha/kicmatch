import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { CreateBucketCommand, HeadBucketCommand, PutBucketPolicyCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import type { Env } from "../../config/env.schema";

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly signingClient: S3Client;
  private readonly bucket: string;
  private readonly publicEndpoint: string;

  constructor(private readonly config: ConfigService<Env, true>) {
    this.bucket = this.config.get("MINIO_BUCKET", { infer: true });
    this.publicEndpoint = this.config.get("MINIO_PUBLIC_ENDPOINT", { infer: true });
    const creds = {
      accessKeyId: this.config.get("MINIO_ACCESS_KEY", { infer: true }),
      secretAccessKey: this.config.get("MINIO_SECRET_KEY", { infer: true }),
    };
    // Internal client for server-side ops (bucket create, policy)
    this.client = new S3Client({
      endpoint: this.config.get("MINIO_ENDPOINT", { infer: true }),
      region: "us-east-1",
      credentials: creds,
      forcePathStyle: true,
    });
    // Signing client uses the PUBLIC endpoint so the browser can PUT against the signed URL
    this.signingClient = new S3Client({
      endpoint: this.publicEndpoint,
      region: "us-east-1",
      credentials: creds,
      forcePathStyle: true,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
        await this.client.send(new PutBucketPolicyCommand({
          Bucket: this.bucket,
          Policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            }],
          }),
        }));
        this.logger.log(`Bucket ${this.bucket} creato`);
      } catch (err) {
        this.logger.error("Errore init MinIO bucket", err as Error);
      }
    }
  }

  async createPresignedUploadUrl(contentType: string, prefix = "covers"): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const ext = contentType.split("/")[1] || "bin";
    const key = `${prefix}/${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, ContentType: contentType });
    const uploadUrl = await getSignedUrl(this.signingClient, cmd, { expiresIn: 300 });
    const publicUrl = `${this.publicEndpoint}/${this.bucket}/${key}`;
    return { uploadUrl, publicUrl, key };
  }
}
