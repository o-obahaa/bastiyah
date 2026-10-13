"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const generateUploadUrl = action({
  args: {
    filename: v.string(),
    contentType: v.string(),
    storeSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.CLOUDFLARE_R2_BUCKET || "bastiyah-images";
    const publicUrlBase = process.env.CLOUDFLARE_R2_PUBLIC_URL || "https://images.bastiyah.com";

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Cloudflare R2 credentials (CLOUDFLARE_R2_ACCOUNT_ID, CLOUDFLARE_R2_ACCESS_KEY_ID, CLOUDFLARE_R2_SECRET_ACCESS_KEY) are not set in Convex environment variables."
      );
    }

    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const cleanFilename = args.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storePrefix = args.storeSlug ? `${args.storeSlug}/` : "";
    const key = `uploads/${storePrefix}${Date.now()}-${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: args.contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    const cleanPublicBase = publicUrlBase.replace(/\/+$/, "");
    const publicUrl = `${cleanPublicBase}/${key}`;

    return {
      uploadUrl,
      publicUrl,
      key,
    };
  },
});
