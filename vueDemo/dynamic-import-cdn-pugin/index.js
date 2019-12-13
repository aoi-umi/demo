const { Template, ExternalsPlugin } = require('webpack');

class DynamicImportCdnFactoryPlugin {
    constructor(cdn) {
        this.cdn = cdn;
    }
    apply(normalModuleFactory) {
        normalModuleFactory.hooks.factory.tap(
            "DynamicImportCdnFactoryPlugin",
            factory => (data, callback) => {
                const context = data.context;
                const dependency = data.dependencies[0];
                if (
                    typeof externals === "object" &&
                    Object.prototype.hasOwnProperty.call(externals, dependency.request)
                ) {
                    callback(null,
                        new ExternalModule(value, type || globalType, dependency.request)
                    );
                }
                callback();
            }
        );
    }
}

exports.MyPugin = class MyPugin {
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

        compiler.plugin('compilation', function (compilation, options) {
            let mainTemplate = compilation.mainTemplate;
            const getScriptSrcPath = (hash, chunk, chunkIdExpression) => {
                const chunkFilename = mainTemplate.outputOptions.chunkFilename;
                const chunkMaps = chunk.getChunkMaps();
                return mainTemplate.getAssetPath(JSON.stringify(chunkFilename), {
                    hash: `" + ${mainTemplate.renderCurrentHashCode(hash)} + "`,
                    hashWithLength: length =>
                        `" + ${mainTemplate.renderCurrentHashCode(hash, length)} + "`,
                    chunk: {
                        id: `" + ${chunkIdExpression} + "`,
                        hash: `" + ${JSON.stringify(
                            chunkMaps.hash
                        )}[${chunkIdExpression}] + "`,
                        hashWithLength(length) {
                            const shortChunkHashMap = Object.create(null);
                            for (const chunkId of Object.keys(chunkMaps.hash)) {
                                if (typeof chunkMaps.hash[chunkId] === "string") {
                                    shortChunkHashMap[chunkId] = chunkMaps.hash[chunkId].substr(
                                        0,
                                        length
                                    );
                                }
                            }
                            return `" + ${JSON.stringify(
                                shortChunkHashMap
                            )}[${chunkIdExpression}] + "`;
                        },
                        name: `" + (${JSON.stringify(
                            chunkMaps.name
                        )}[${chunkIdExpression}]||${chunkIdExpression}) + "`,
                        contentHash: {
                            javascript: `" + ${JSON.stringify(
                                chunkMaps.contentHash.javascript
                            )}[${chunkIdExpression}] + "`
                        },
                        contentHashWithLength: {
                            javascript: length => {
                                const shortContentHashMap = {};
                                const contentHash = chunkMaps.contentHash.javascript;
                                for (const chunkId of Object.keys(contentHash)) {
                                    if (typeof contentHash[chunkId] === "string") {
                                        shortContentHashMap[chunkId] = contentHash[chunkId].substr(
                                            0,
                                            length
                                        );
                                    }
                                }
                                return `" + ${JSON.stringify(
                                    shortContentHashMap
                                )}[${chunkIdExpression}] + "`;
                            }
                        }
                    },
                    contentHashType: "javascript"
                });
            };
            mainTemplate.plugin('localVars', function (source, chunk, hash) {
                let buf = [];
                buf.push(source);
                buf.push(
                    "function jsonpScriptSrc(chunkId) {",
                    Template.indent([
                        `if(/^http/.test(chunkId)) {`,
                        Template.indent([
                            `return chunkId`,
                        ]),
                        `}`,
                        `return ${mainTemplate.requireFn}.p + ${getScriptSrcPath(
                            hash,
                            chunk,
                            "chunkId"
                        )}`
                    ]),
                    "}"
                );
                return Template.asString(buf);
            });
            if (mainTemplate.hooks.jsonpScript)
                mainTemplate.plugin('jsonpScript', function (source, chunk, hash) {
                    let buf = [];
                    let idx = source.indexOf('var chunk = installedChunks[chunkId];');
                    buf.push(source.substr(0, idx));
                    buf.push(
                        'if(/^http/.test(chunkId)) {',
                        Template.indent([
                            `var cdn = ${JSON.stringify(self.cdn)};`,
                            `for(var key in cdn) {`,
                            Template.indent([
                                'if(cdn[key].url === chunkId) {',
                                Template.indent([
                                    `webpackJsonp.push([[chunkId], window[cdn[key].moduleName]]);`,
                                    'break;',
                                ]),
                                '}'
                            ]),
                            '}',
                        ]),
                        '}'
                    );
                    buf.push(source.substr(idx));
                    return Template.asString(buf);
                });

            compilation.plugin('afterOptimizeChunks', function (chunks, chunkGroups) {
                // console.log(chunks[0])
                for (const chunk of chunks) {
                    if (!chunk.isOnlyInitial()) {
                        return;
                    }
                    let modules = chunk.getModules();
                    // for
                }
                console.log(1);
                // rawRequest
            });
        });

        // compiler.hooks.compile.tap("MyPugin", ({ normalModuleFactory }) => {
        //     new DynamicImportCdnFactoryPlugin(this.cdn).apply(
        //         normalModuleFactory
        //     );
        // });
    }
}