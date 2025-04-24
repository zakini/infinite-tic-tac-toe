// This file configures the initialization of Sentry for edge features (middleware, edge routes, and
// so on). The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running
// locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // eslint-disable-next-line max-len
  dsn: 'https://27254d1c8108fe6736f5eb5e006bb3b0@o4509210111377408.ingest.de.sentry.io/4509210116816976',

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for
  // greater control.
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting
  // up Sentry.
  debug: false,

  // Disable locally
  enabled: process.env.NODE_ENV !== 'development',
})
