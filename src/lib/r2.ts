import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`${name} is not set`)
  }
  return value
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

const r2Endpoint = getRequiredEnv('R2_ENDPOINT').replace(/\/+$/, '')
const r2AccessKeyId = getRequiredEnv('R2_ACCESS_KEY_ID')
const r2SecretAccessKey = getRequiredEnv('R2_SECRET_ACCESS_KEY')

// 初始化 S3 客户端（指向 R2）
const s3Client = new S3Client({
  region: 'auto',
  endpoint: r2Endpoint,
  // R2 常用 path-style，更稳妥地避免虚拟主机风格的 TLS/SNI 兼容问题
  forcePathStyle: true,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey,
  },
})

// 上传文件到 R2
export async function uploadToR2(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const bucketName = getRequiredEnv('R2_BUCKET_NAME')
  const publicUrl = getRequiredEnv('R2_PUBLIC_URL')

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: contentType,
      ContentLength: fileBuffer.length,
    })
  )

  // 返回永久的公开链接
  return joinUrl(publicUrl, fileName)
}
