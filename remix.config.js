/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
    ignoredRouteFiles: ["**/.*"],
    serverDependenciesToBundle: [/@shopify\/shopify-api/],
    serverModuleFormat: "cjs",
    future: {
        v2_errorBoundary: true,
        v2_meta: true,
        v2_normalizeFormMethod: true,
        v2_routeConvention: true,
    },
    routes(defineRoutes) {
        return defineRoutes((route) => {
            route(
                "api/save-api-key",
                "routes/api/save-api-key.ts"
            );
        });
    },
};
