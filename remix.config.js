module.exports = {
    // ... other config options
    routes(defineRoutes) {
        return defineRoutes((route) => {
            route("api/*", "routes/api/$");
        });
    },
};
