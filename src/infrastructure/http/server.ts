import { buildApp } from './app';

const app = await buildApp();

await app.ready();
