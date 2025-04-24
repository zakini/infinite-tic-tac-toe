import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Dummy Turbopack config to silence a warning
  // This is needed because Sentry needs to configure Webpack, and Next complains if Webpack is
  // configured and Turbopack isn't. We could just swap to using Webpack, but it's slower and
  // Webpack complains about us using top-level await in app/components/tic-tac-toe-board/index.tsx.
  // We're only using Turbopack in dev though, we're using Webpack in production. Can't see that
  // warning about top-level await in the build logs though 🤷
  // See: https://github.com/getsentry/sentry-javascript/issues/8105
  // Turbopack in Next is currently only stable in dev
  // See: https://nextjs.org/docs/app/api-reference/turbopack#getting-started
  turbopack: {
    rules: { foo: { loaders: [] } },
  },
}

export default withSentryConfig(nextConfig, {
// For all available options, see:
// https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'zakini',
  project: 'infinite-tic-tac-toe',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent
  // ad-blockers. This can increase your server load as well as your hosting bill. Note: Check that
  // the configured route will not match with your Next.js middleware, otherwise reporting of
  // client-side errors will fail.
  // tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router
  // route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
