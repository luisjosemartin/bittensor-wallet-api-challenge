import { Factory } from 'fishery';
import { ApiKey, ApiKeyScope } from '@prisma/client';
import { db } from '#/providers/Database/PrismaClient';
import bcrypt from 'bcrypt';

export const apiKeyFactory = Factory.define<ApiKey>(({ sequence, onCreate }) => {
  const attributes = {
    name: `Test API Key ${sequence}`,
    keyHash: '',
    scopes: Object.values(ApiKeyScope),
    isActive: true,
    createdAt: new Date(),
  }

  onCreate(async (apiKey) => {
    const testRandomPart = `test-random-part-${sequence}`;
    const keyHash = await bcrypt.hash(testRandomPart, 10);
    
    return db.apiKey.create({ 
      data: {
        ...attributes,
        ...apiKey,
        keyHash
      }
    });
  });

  return {
    id: `test-id-${sequence}`,
    ...attributes
  }
});

export async function createApiKeyWithKnownRandomPart(options: {
  name?: string;
  scopes?: ApiKeyScope[];
  isActive?: boolean;
  sequence?: number;
} = {}) {
  const sequence = options.sequence || Math.floor(Math.random() * 1000);
  const randomPart = `test-random-part-${sequence}`;
  const keyHash = await bcrypt.hash(randomPart, 10);
  const apiKey = await db.apiKey.create({
    data: {
      name: options.name || `Test API Key ${sequence}`,
      keyHash,
      scopes: options.scopes || Object.values(ApiKeyScope),
      isActive: options.isActive !== undefined ? options.isActive : true,
    }
  });

  const fullApiKey = `ak.${apiKey.id}.${randomPart}`;

  return {
    apiKey,
    randomPart,
    fullApiKey
  };
}
