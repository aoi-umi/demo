const { Template, ExternalsPlugin } = require('webpack');
const Chunk = require('webpack/lib/Chunk');

const MyPuginName = 'DynamicImportCdnFactoryPlugin';
exports.MyPugin = class DynamicImportCdnFactoryPlugin {
    constructor(cdn) {
        this.cdn = cdn;
    }
    apply(compiler) {
        let self = this;
        let externals = {};
        for (let key in self.cdn) {
            externals[key] = self.cdn[key].moduleName;
        }
        new ExternalsPlugin(
            'var',
            externals
        ).apply(compiler);

        compiler.hooks.compilation.tap(MyPuginName, function (compilation, options) {
            let mainTemplate = compilation.mainTemplate;

            mainTemplate.hooks.localVars.tap(MyPuginName, function (source, chunk, hash) {
                let str = 'function jsonpScriptSrc(chunkId) {';
                let idx = source.indexOf(str);
                if (idx === -1) {
                    return source;
                }
                let buf = [];
                buf.push(
                    source.substr(0, idx),
                    `var cdn = ${JSON.stringify(self.cdn)};`,
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
                mainTemplate.hooks.jsonpScript.tap(MyPuginName, function (source, chunk, hash) {
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
                            for (let key in self.cdn) {
                                if (!chunkGroup.chunks.find(ele => ele.id === key)
                                    && findCdnDep(key, d.module)) {
                                    let chunk = new Chunk();
                                    chunk.id = key;
                                    chunk.chunkReason = 'cdn';
                                    chunkGroup.chunks.push(chunk);
                                }
                            }
                        });
                    });
                });
            }
            
            compilation.hooks.afterOptimizeChunks.tap(MyPuginName, function (chunks, chunkGroups) {
                for (const chunk of chunks) {
                    if (!chunk.isOnlyInitial()) {
                        return;
                    }
                    cdnFn(chunk);
                }
            });
        });
    }
}