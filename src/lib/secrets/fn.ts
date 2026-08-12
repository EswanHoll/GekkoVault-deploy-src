import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import {
  addCatalogEntry,
  createToolClient,
  dashboardStats,
  deleteSecretValue,
  listAudit,
  listCatalog,
  listToolClients,
  putSecretValue,
  revokeToolClient,
} from "./server";
export const getDashboard = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => dashboardStats(context.userId));
export const getCatalog = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listCatalog(context.userId));
export const setSecret = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string; value: string }) => data)
  .handler(async ({ context, data }) =>
    putSecretValue(context.userId, data.name, data.value),
  );
export const clearSecret = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { name: string }) => data)
  .handler(async ({ context, data }) =>
    deleteSecretValue(context.userId, data.name),
  );
export const createCatalogSecret = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      name: string;
      scope_id: string;
      description?: string;
      sensitivity?: string;
    }) => data,
  )
  .handler(async ({ context, data }) => addCatalogEntry(context.userId, data));
export const getTools = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listToolClients(context.userId));
export const mintTool = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (data: {
      name: string;
      platform: string;
      allowlist?: string[];
      purpose?: string;
      ttlHours?: number;
    }) => data,
  )
  .handler(async ({ context, data }) => createToolClient(context.userId, data));
export const revokeTool = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    await revokeToolClient(context.userId, data.id);
    return { ok: true };
  });
export const getAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => listAudit(context.userId));
