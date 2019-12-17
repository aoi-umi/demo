const { Template, ExternalsPlugin } = require('webpack');
const Chunk = require('webpack/lib/Chunk');

const PluginName = 'DynamicImportCdnPlugin';
exports.DynamicImportCdnPlugin = class DynamicImportCdnPlugin {
    constructor(cdn) {
        this.cdn = cdn;
        this.globalCdn = {
            js: {},
            css: {},
        };
    }

    apply(compiler) {
        let self = this;
        let externals = {};
        let cdnJs = self.cdn.js;
        let hasCdnJs = cdnJs && Object.keys(cdnJs).length > 0;
        let cdnCss = self.cdn.css;
        let hasCdnCss = cdnCss && Object.keys(cdnCss).length > 0;
        if (hasCdnJs) {
            for (let key in cdnJs) {
                externals[key] = cdnJs[key].moduleName;
            }
        }

        if (Object.keys(externals).length) {
            new ExternalsPlugin(
                'var',
                externals
            ).apply(compiler);
        }

        let globalCdn = this.globalCdn;

        const findCdnDep = (dep, module, res) => {
            if (!res)
                res = {};
            for (let d of module.dependencies) {
                if (d.request === dep)
                    return d;
                if (d.module && d.userRequest && !res[d.userRequest]) {
                    res[d.userRequest] = true;
                    let rs = findCdnDep(dep, d.module, res);
                    if (rs)
                        return rs;
                }
            }
            return false;
        }

        const setGlobalCdn = (type, chunk) => {
            let global = globalCdn[type];
            let cdnOpt = self.cdn[type];
            for (let key in cdnOpt) {
                if (!global[key] && findCdnDep(key, chunk.entryModule))
                    global[key] = type === 'js' ? cdnOpt[key].url : cdnOpt[key];
            }
        }

        const getDependencies = (modules) => {
            let filterFn = m => typeof m.source === "function" && m.blocks.length > 0;
            let dependencies = [];
            modules.filter(filterFn).forEach(module => {
                module.blocks.forEach(block => {
                    block.dependencies.forEach(d => {
                        let chunkGroup = d.block.chunkGroup;
                        if (!chunkGroup)
                            return;
                        dependencies.push(d);
                    });
                });
            });
            return dependencies;
        }

        compiler.hooks.compilation.tap(PluginName, function (compilation, options) {
            const jsCdnFn = (chunk) => {
                if (!chunk.isOnlyInitial()) {
                    return;
                }
                let entry = !!chunk.name;
                if (entry) {
                    setGlobalCdn('js', chunk);
                }
                let dependencies = getDependencies(chunk.getModules());
                for (let d of dependencies) {
                    let chunkGroup = d.block.chunkGroup;
                    for (let key in cdnJs) {
                        if (globalCdn.js[key] || chunkGroup.chunks.find(ele => ele.id === key)
                            || !findCdnDep(key, d.module)) {
                            continue;
                        }
                        let chunk = new Chunk();
                        chunk.id = key;
                        chunk.chunkReason = 'cdn';
                        chunkGroup.chunks.push(chunk);
                    }
                }
            }

            const jsHandler = (compilation) => {
                let mainTemplate = compilation.mainTemplate;

                mainTemplate.hooks.localVars.tap(PluginName, function (source, chunk, hash) {
                    let str = 'function jsonpScriptSrc(chunkId) {';
                    let idx = source.indexOf(str);
                    if (idx === -1) {
                        return source;
                    }
                    let buf = [];
                    buf.push(
                        source.substr(0, idx),
                        `var cdn = ${JSON.stringify(cdnJs, null, '\t')};`,
                        str,
                        Template.indent([
                            `if(cdn[chunkId]) {`,
                            Template.indent([
                                `return cdn[chunkId].url;`,
                            ]),
                            `}`,]),

                        source.substr(idx + str.length),
                    );
                    return Template.asString(buf);
                });
                if (mainTemplate.hooks.jsonpScript) {
                    mainTemplate.hooks.jsonpScript.tap(PluginName, function (source, chunk, hash) {
                        let buf = [];
                        let idx = source.indexOf('var chunk = installedChunks[chunkId];');
                        buf.push(source.substr(0, idx));
                        buf.push(
                            'if(cdn[chunkId]) {',
                            Template.indent([
                                Template.indent([
                                    `webpackJsonp.push([[chunkId], window[cdn[chunkId].moduleName]]);`,
                                ]),
                            ]),
                            '}'
                        );
                        buf.push(source.substr(idx));
                        return Template.asString(buf);
                    });
                }

                compilation.hooks.afterOptimizeChunks.tap(PluginName, (chunks, chunkGroups) => {
                    for (const chunk of chunks) {
                        jsCdnFn(chunk);
                    }
                });
            }

            let chunkCssMap = {};
            const cssCdnFn = (chunk) => {
                if (!chunk.isOnlyInitial()) {
                    return;
                }
                let entry = !!chunk.name;
                if (entry) {
                    setGlobalCdn('css', chunk);
                }
                let dependencies = getDependencies(chunk.getModules());
                for (let d of dependencies) {
                    for (let key in cdnCss) {
                        if (globalCdn.css[key] || (chunkCssMap[chunk.id] && chunkCssMap[chunk.id].includes(key)))
                            continue;
                        let cdnCssDep = findCdnDep(key, d.module);
                        if (cdnCssDep) {
                            let cssDep = cdnCssDep.module.dependencies.find(e => e.module && e.module.type === "css/mini-extract");
                            if (cssDep) {
                                cssDep.content = '';
                                cssDep.module.content = '';
                                if (!chunkCssMap[chunk.id]) {
                                    chunkCssMap[chunk.id] = [];
                                }
                                chunkCssMap[chunk.id].push(key);
                            }
                        }
                    }

                }
            }

            const cssHandler = (compilation) => {
                let mainTemplate = compilation.mainTemplate;

                compilation.hooks.afterOptimizeChunkIds.tap(PluginName, () => {
                    let chunks = compilation.chunks;
                    for (const chunk of chunks) {
                        cssCdnFn(chunk);
                    }
                });

                mainTemplate.hooks.requireEnsure.tap(PluginName, (source, chunk, hash) => {
                    let idx = source.indexOf('var cssChunks =');
                    if (idx === -1) {
                        return source;
                    }
                    console.log(chunkCssMap);
                    return source;
                });
            }
            if (hasCdnJs) {
                jsHandler(compilation);
            }

            if (hasCdnCss)
                cssHandler(compilation);

            compilation.plugin('html-webpack-plugin-before-html-generation', function (htmlPluginData) {
                function unshiftCdn(cdn, assets) {
                    let list = [];
                    for (let key in cdn) {
                        list.push(cdn[key]);
                    }
                    if (list.length)
                        assets.unshift(...list);
                }
                unshiftCdn(globalCdn.js, htmlPluginData.assets.js);
                unshiftCdn(globalCdn.css, htmlPluginData.assets.css);
                return htmlPluginData;
            });
        });
    }
}