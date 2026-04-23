import { eq } from 'drizzle-orm'
import { db } from '../db/index.ts'
import { gpTenants } from '../db/schema/index.ts'
import type { GpTenant, NewGpTenant } from '../db/schema/tenants.ts'

export const tenantModel = {
  async findBySubdomain(subdomain: string): Promise<GpTenant | undefined> {
    const [tenant] = await db
      .select()
      .from(gpTenants)
      .where(eq(gpTenants.subdomain, subdomain))
      .limit(1)
    return tenant
  },

  async findById(id: string): Promise<GpTenant | undefined> {
    const [tenant] = await db
      .select()
      .from(gpTenants)
      .where(eq(gpTenants.id, id))
      .limit(1)
    return tenant
  },

  async update(id: string, data: Partial<NewGpTenant>): Promise<GpTenant | undefined> {
    const [updated] = await db
      .update(gpTenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(gpTenants.id, id))
      .returning()
    return updated
  },

  async updateLogo(id: string, logoUrl: string): Promise<GpTenant | undefined> {
    const [updated] = await db
      .update(gpTenants)
      .set({ logoUrl, updatedAt: new Date() })
      .where(eq(gpTenants.id, id))
      .returning()
    return updated
  }
}
