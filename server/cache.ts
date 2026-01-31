import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Obter instância do cliente Redis
 */
export async function getRedisClient() {
  if (!redisClient && process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      redisClient.on('error', (err: any) => {
        console.error('[Redis] Erro de conexão:', err);
        redisClient = null;
      });

      await redisClient.connect();
      console.log('[Redis] Conectado com sucesso');
    } catch (error) {
      console.warn('[Redis] Falha ao conectar:', error);
      redisClient = null;
    }
  }
  return redisClient;
}

/**
 * Obter valor do cache
 */
export async function getCacheValue(key: string) {
  try {
    const client = await getRedisClient();
    if (!client) return null;

    const value = await client.get(key);
    if (value) {
      return JSON.parse(value);
    }
    return null;
  } catch (error) {
    console.error('[Cache] Erro ao obter valor:', error);
    return null;
  }
}

/**
 * Definir valor no cache com TTL
 */
export async function setCacheValue(
  key: string,
  value: any,
  ttlSeconds: number = 300
) {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    await client.setEx(key, ttlSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao definir valor:', error);
    return false;
  }
}

/**
 * Deletar valor do cache
 */
export async function deleteCacheValue(key: string) {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    await client.del(key);
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao deletar valor:', error);
    return false;
  }
}

/**
 * Limpar cache por padrão
 */
export async function clearCacheByPattern(pattern: string) {
  try {
    const client = await getRedisClient();
    if (!client) return false;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
    return true;
  } catch (error) {
    console.error('[Cache] Erro ao limpar cache:', error);
    return false;
  }
}

/**
 * Gerar chave de cache para geolocalização
 */
export function generateGeoCacheKey(
  latitude: number,
  longitude: number,
  raioKm: number
): string {
  // Arredondar para 2 casas decimais para agrupar buscas próximas
  const lat = Math.round(latitude * 100) / 100;
  const lng = Math.round(longitude * 100) / 100;
  return `geo_cache:${lat}:${lng}:${raioKm}`;
}

/**
 * Gerar chave de cache para ofertas
 */
export function generateOfertasCacheKey(status: string): string {
  return `ofertas:${status}`;
}

/**
 * Gerar chave de cache para bairro/cidade
 */
export function generateBairroCacheKey(cidade: string, bairro: string): string {
  return `bairro:${cidade}:${bairro}`;
}
