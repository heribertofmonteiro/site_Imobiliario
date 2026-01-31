import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, imoveis } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Buscar imóveis próximos por geolocalização
 * Usa a fórmula de Haversine para calcular distância entre coordenadas
 */
export async function getImovelProximos(
  latitude: number,
  longitude: number,
  raioKm: number = 10
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get imoveis: database not available");
    return [];
  }

  try {
    // Fórmula de Haversine para calcular distância
    const R = 6371; // Raio da Terra em km
    const result = await db.execute(`
      SELECT 
        *,
        (${R} * acos(
          cos(radians(${latitude})) * 
          cos(radians(latitude)) * 
          cos(radians(longitude) - radians(${longitude})) + 
          sin(radians(${latitude})) * 
          sin(radians(latitude))
        )) AS distancia_km
      FROM imoveis
      WHERE ativo = true
      AND (${R} * acos(
        cos(radians(${latitude})) * 
        cos(radians(latitude)) * 
        cos(radians(longitude) - radians(${longitude})) + 
        sin(radians(${latitude})) * 
        sin(radians(latitude))
      )) <= ${raioKm}
      ORDER BY distancia_km ASC
      LIMIT 100
    ` as any);

    return result as any[];
  } catch (error) {
    console.error("[Database] Failed to get imoveis proximos:", error);
    return [];
  }
}

/**
 * Buscar imóveis por status (promocao, imperdivel, disponivel)
 */
export async function getImovelPorStatus(status: string, limite: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get imoveis: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.status, status as any))
      .orderBy(desc(imoveis.dataPublicacao))
      .limit(limite);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get imoveis por status:", error);
    return [];
  }
}

/**
 * Buscar imóvel por ID
 */
export async function getImovelPorId(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get imovel: database not available");
    return null;
  }

  try {
    const result = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.id, id))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get imovel:", error);
    return null;
  }
}

/**
 * Buscar imóveis mais recentes
 */
export async function getImovelRecentes(limite: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get imoveis: database not available");
    return [];
  }

  try {
    const result = await db
      .select()
      .from(imoveis)
      .where(eq(imoveis.ativo, true))
      .orderBy(desc(imoveis.dataPublicacao))
      .limit(limite);

    return result;
  } catch (error) {
    console.error("[Database] Failed to get imoveis recentes:", error);
    return [];
  }
}

/**
 * Incrementar visualizações de um imóvel
 */
export async function incrementarVisualizacoes(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment visualizacoes: database not available");
    return;
  }

  try {
    await db.execute(`UPDATE imoveis SET visualizacoes = visualizacoes + 1 WHERE id = ${id}` as any);
  } catch (error) {
    console.error("[Database] Failed to increment visualizacoes:", error);
  }
}
