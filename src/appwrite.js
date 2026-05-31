import { Client, Databases, ID } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const databases = new Databases(client);
export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
export const COL_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
export { ID };
