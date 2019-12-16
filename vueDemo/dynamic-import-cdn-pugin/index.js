const { Template, ExternalsPlugin } = require('webpack');
const Chunk = require('webpack/lib/Chunk');
const Entrypoint = require('webpack/lib/Entrypoint');

const PuginName = 'DynamicImportCdnFactoryPlugin';
exports.DynamicImportCdnFactoryPlugin = class DynamicImportCdnFactoryPlugin {
    constructor(cdn) {
        this.cdn = cdn;
        this.globalCdn = {};
    }
    apply(compiler) {
        let self = this;
        let externals = {};
        let cdnJs = self.cdn.js;
        let hasCdnJs = cdnJs && Object.keys(cdnJs).length > 0;
        if (hasCdnJs) {
            for (let key in cdnJs) {
                externals[key] = cdnJs[key].moduleName;
            }
            new ExternalsPlugin(
                'var',
                externals
            ).apply(compiler);
        }
        let globalCdn = this.globalCdn;
        compiler.hooks.compilation.tap(PuginName, function (compilation, options) {
            if (hasCdnJs) {
                self.jsHandler(compilation);
            }

            compilation.plugin('html-webpack-plugin-before-html-generation', function (htmlPluginData) {
                let js = [];
                for (let key in globalCdn) {
                    js.push(globalCdn[key]);
                }
                if (js.length)
                    htmlPluginData.assets.js.unshift(...js);
                return htmlPluginData;
            });
        });
    }

    jsHandler(compilation) {
        let mainTemplate = compilation.mainTemplate;
        let globalCdn = this.globalCdn;
        let cdnJs = this.cdn.js;

        mainTemplate.hooks.localVars.tap(PuginName, function (source, chunk, hash) {
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
            mainTemplate.hooks.jsonpScript.tap(PuginName, function (source, chunk, hash) {
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

        function findCdnDep(dep, module, res) {
            if (!res)
                res = {};
            for (let d of module.dependencies) {
                if (d.request === dep)
                    return true;
                if (d.module && d.userRequest && !res[d.userRequest]) {
                    res[d.userRequest] = true;
                    let rs = findCdnDep(dep, d.module, res);
                    if (rs)
                        return rs;
                }
            }
            return false;
        }

        function cdnFn(chunk) {
            let entry = !!chunk.name;
            if (entry) {
                for (let key in cdnJs) {
                    if (!globalCdn[key] && findCdnDep(key, chunk.entryModule))
                        globalCdn[key] = cdnJs[key].url;
                }
            }
            let filterFn = m => typeof m.source === "function";
            const modules = chunk.getModules().filter(filterFn);
            modules.forEach(module => {
                if (!module.blocks.length)
                    return;
                module.blocks.forEach(block => {
                    block.dependencies.forEach(d => {
                        let chunkGroup = d.block.chunkGroup;
                        if (!chunkGroup)
                            return;
                        for (let key in cdnJs) {
                            if (globalCdn[key] || chunkGroup.chunks.find(ele => ele.id === key)
                                || !findCdnDep(key, d.module)) {
                                continue;
                            }
                            let chunk = new Chunk();
                            chunk.id = key;
                            chunk.chunkReason = 'cdn';
                            chunkGroup.chunks.push(chunk);
                        }
                    });
                });
            });
        }

        compilation.hooks.afterOptimizeChunks.tap(PuginName, function (chunks, chunkGroups) {
            for (const chunk of chunks) {
                if (!chunk.isOnlyInitial()) {
                    return;
                }
                cdnFn(chunk);
            }
        });
    }
}