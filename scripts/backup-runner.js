#!/usr/bin/env node
/**
 * ==============================================================================
 * Bastiyah Automated Backup & Disaster Recovery Engine
 * Backs up Convex schemas, database tables, environment configurations,
 * packages into timestamped archives, and uploads to S3 / Cloudflare R2.
 * ==============================================================================
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const backupsDir = path.join(projectRoot, 'backups');

if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const backupName = `bastiyah-snapshot-${timestamp}`;
const backupFolder = path.join(backupsDir, backupName);
fs.mkdirSync(backupFolder, { recursive: true });

console.log('========================================================================');
console.log('📦 Bastiyah Disaster Recovery & Backup Engine');
console.log('========================================================================');
console.log(`Snapshot Target: ${backupFolder}`);

// 1. Snapshot Convex Schemas & Logic
console.log('🔹 [1/4] Snapshotting Convex database schemas and functions...');
const convexDir = path.join(projectRoot, 'convex');
const convexBackupDir = path.join(backupFolder, 'convex');
if (fs.existsSync(convexDir)) {
  fs.cpSync(convexDir, convexBackupDir, { recursive: true });
  console.log('   ✅ Convex backend definitions copied.');
}

// 2. Snapshot Platform Configurations & Scripts
console.log('🔹 [2/4] Snapshotting configurations, Traefik routes, and deploy manifests...');
const configsToSave = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'Dockerfile',
  'nginx.conf',
  'docker-compose.yml',
  '.env.example',
  'Jenkinsfile',
];

const configsBackupDir = path.join(backupFolder, 'configs');
fs.mkdirSync(configsBackupDir, { recursive: true });

for (const file of configsToSave) {
  const src = path.join(projectRoot, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(configsBackupDir, file));
  }
}

const traefikDir = path.join(projectRoot, 'traefik');
if (fs.existsSync(traefikDir)) {
  fs.cpSync(traefikDir, path.join(backupFolder, 'traefik'), { recursive: true });
}
console.log('   ✅ Configuration assets and routing tables secured.');

// 3. Convex Cloud Data Export (if CONVEX_DEPLOY_KEY is available)
console.log('🔹 [3/4] Exporting Convex Cloud Data Snapshot...');
const convexExportFile = path.join(backupFolder, 'convex_data_export.zip');
if (process.env.CONVEX_DEPLOY_KEY) {
  try {
    console.log('   Executing npx convex export...');
    execSync(`npx convex export --path "${convexExportFile}"`, {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    console.log('   ✅ Convex data export completed successfully.');
  } catch (err) {
    console.warn('   ⚠️  Convex data export command failed (continuing with schema snapshot):', err.message);
  }
} else {
  console.log('   ℹ️  CONVEX_DEPLOY_KEY not set in environment; snapshotting schema and state manifests.');
  fs.writeFileSync(
    path.join(backupFolder, 'backup_notes.txt'),
    `Convex export skipped: Set CONVEX_DEPLOY_KEY to enable automated table document dumps.\nDate: ${now.toISOString()}\n`
  );
}

// 4. Create Manifest & Tarball Archive
const manifest = {
  version: '1.0.0',
  backupId: backupName,
  timestamp: now.toISOString(),
  environment: process.env.NODE_ENV || 'production',
  filesIncluded: ['convex', 'configs', 'traefik'],
};

fs.writeFileSync(path.join(backupFolder, 'manifest.json'), JSON.stringify(manifest, null, 2));

const archivePath = path.join(backupsDir, `${backupName}.tar.gz`);
try {
  execSync(`tar -czf "${archivePath}" -C "${backupsDir}" "${backupName}"`);
  console.log(`   ✅ Compressed archive created: ${archivePath}`);
  // Clean raw folder to save disk space
  fs.rmSync(backupFolder, { recursive: true, force: true });
} catch (err) {
  console.error('   ❌ Tarball creation failed:', err.message);
}

// 5. Retention Policy: Prune backups older than 14 days
console.log('🔹 [4/4] Checking backup retention policy (Pruning > 14 days)...');
const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
const allBackups = fs.readdirSync(backupsDir).filter(f => f.endsWith('.tar.gz'));

for (const file of allBackups) {
  const filePath = path.join(backupsDir, file);
  const stats = fs.statSync(filePath);
  if (now.getTime() - stats.mtimeMs > fourteenDaysMs) {
    fs.unlinkSync(filePath);
    console.log(`   🗑️  Pruned aged backup archive: ${file}`);
  }
}

// 6. Optional Cloud S3 / Cloudflare R2 Upload
async function uploadToCloudStorage() {
  const bucket = process.env.BACKUP_S3_BUCKET;
  if (!bucket) {
    console.log('ℹ️  BACKUP_S3_BUCKET not set. Backup stored in local volume storage.');
    return;
  }

  try {
    const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
    const s3 = new S3Client({
      region: process.env.AWS_REGION || 'auto',
      endpoint: process.env.AWS_ENDPOINT, // Supports Cloudflare R2 / MinIO
    });

    const fileStream = fs.createReadStream(archivePath);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: `backups/${path.basename(archivePath)}`,
        Body: fileStream,
      })
    );
    console.log(`☁️  Disaster recovery archive successfully uploaded to Cloud S3/R2: s3://${bucket}/backups/${path.basename(archivePath)}`);
  } catch (e) {
    console.error('❌ Failed uploading backup to S3/R2:', e.message);
  }
}

uploadToCloudStorage().then(() => {
  console.log('========================================================================');
  console.log('🎉 Disaster Recovery Backup Procedure Completed Successfully!');
  console.log('========================================================================');
});
