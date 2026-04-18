import PocketBase from 'pocketbase';

// La URL de PocketBase que configurarás en Dokploy
export const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL);

// En desarrollo, esto evita errores de conexión si no está la URL
if (!process.env.NEXT_PUBLIC_POCKETBASE_URL) {
    console.warn("PocketBase URL not found! Please add NEXT_PUBLIC_POCKETBASE_URL to .env");
}
