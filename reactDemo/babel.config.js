module.exports = function (api) {
    api.cache(true);

    const presets = [];
    const plugins = [];

    return {
        presets,
        plugins,
        "presets": ["es2015"]
    };
}