// Load the Express app lazily. This lets Vercel return a useful response when
// a required runtime secret has not been configured, rather than failing the
// whole serverless invocation during module initialization.
let appPromise;

function getApp() {
  appPromise ??= import('../server/index.js');
  return appPromise;
}

export default async function handler(req, res) {
  try {
    const { default: app } = await getApp();
    return app(req, res);
  } catch (error) {
    console.error('API initialization failed:', error);
    return res.status(503).json({
      success: false,
      code: 'API_CONFIGURATION_ERROR',
      message: 'The API is not configured. Set DATABASE_URL and SESSION_SECRET in the Vercel project environment variables, then redeploy.'
    });
  }
}
