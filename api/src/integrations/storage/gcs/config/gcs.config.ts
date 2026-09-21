import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { GcsConfig as GcsConfigInterface } from '../interfaces/gcs.interfaces';

@Injectable()
export class GcsConfig {
    private storageClient: Storage;
    private readonly logger = new Logger(GcsConfig.name);
    private config: GcsConfigInterface;

    constructor(private readonly configService: ConfigService) {
        this.initGcs();
    }

    private initGcs() {
        try {
            const projectId = this.configService.get('GCS_PROJECT_ID');
            const bucketName = this.configService.get('GCS_BUCKET_NAME');
            const credentialsJsonBase64 = this.configService.get('GCS_CREDENTIALS_JSON_BASE64');
            const folderName = this.configService.get('GCS_FOLDER_NAME');

            if (!projectId || !bucketName) {
                this.logger.error('GCS_PROJECT_ID and GCS_BUCKET_NAME are required');
                return;
            }

            if (!credentialsJsonBase64) {
                this.logger.error('GCS_CREDENTIALS_JSON_BASE64 is required');
                return;
            }

            this.config = {
                project_id: projectId,
                bucket_name: bucketName,
                credentials: this.decodeCredentials(credentialsJsonBase64),
                folder_name: folderName || 'documents'
            };

            this.storageClient = new Storage({
                projectId: this.config.project_id,
                credentials: this.config.credentials
            });
            this.disableResponseCompression(this.storageClient);
            this.logger.debug('Google Cloud Storage initialized');
        } catch (error) {
            this.logger.error('Error initializing Google Cloud Storage', error);
        }
    }

    // The node-fetch@2 used by Google's auth library fails to gunzip responses on newer
    // Node versions ("Invalid response body ... Premature close"), which breaks the OAuth token request.
    private disableResponseCompression(storage: Storage): void {
        storage.authClient
            .getClient()
            .then((client) => {
                if (client.transporter) {
                    // `compress` is forwarded to node-fetch but missing from GaxiosOptions typings
                    client.transporter.defaults = { ...client.transporter.defaults, compress: false } as typeof client.transporter.defaults;
                }
            })
            .catch((error) => {
                this.logger.error('Failed to configure Google auth transport', error);
            });
    }

    private decodeCredentials(credentialsJsonBase64: string): object {
        const json = Buffer.from(credentialsJsonBase64, 'base64').toString('utf8');
        return JSON.parse(json);
    }

    getStorageClient(): Storage {
        return this.storageClient;
    }

    getConfig(): GcsConfigInterface {
        return this.config;
    }

    getBucketName(): string {
        return this.config.bucket_name;
    }
}
