import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Inserta o actualiza el usuario en la base de datos de Convex 
 * basándose en el token de Clerk.
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("No autenticado");
    }

    // Buscar si ya existe el usuario
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();

    if (user !== null) {
      // Si el nombre o email cambió en Clerk, lo actualizamos aquí
      if (user.nombre_completo !== identity.name || user.email !== identity.email) {
        await ctx.db.patch(user._id, {
          nombre_completo: identity.name,
          email: identity.email,
        });
      }
      return user._id;
    }

    // Si es nuevo, lo creamos
    // Nota: El rol por defecto será 'maestro' o similar, 
    // luego puedes cambiarlo manualmente en el dashboard de Convex.
    return await ctx.db.insert("users", {
      tokenIdentifier: identity.tokenIdentifier,
      nombre_completo: identity.name ?? "Sin nombre",
      email: identity.email ?? "sin@email.com",
      role: "maestro", 
    });
  },
});

export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .unique();
  },
});
