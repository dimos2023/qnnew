var AssetPreloadMgr = {};

AssetPreloadMgr.preloadTags = [];
//延迟加载 分帧加载，优化卡顿
AssetPreloadMgr.delayLoadTags = [];
AssetPreloadMgr.delayLoadAssets = [];
AssetPreloadMgr.currentIndex = 0;
AssetPreloadMgr.resourcesLoaded = 0;

AssetPreloadMgr.loadAssetLoadConfig = function (app, callback, scope) {
    var configAssetTag = 'assetsConfig';
    var assets = app.assets.findByTag(configAssetTag);
    if (!assets || assets.length <= 0) {
        if (typeof callback === 'function')
            callback.call(scope, null);
        return;
    }
    var configAsset = assets[0];
    if (configAsset.resource) {
        var i;
        var assetsTags = null;
        for (var i = 0; i < configAsset._resources.length; i++) {
            if (configAsset._resources[i].sceneName === SCENE_PATH_SN) {
                assetsTags = configAsset._resources[i].assetsTags;
                break;
            }
        }
        if (assetsTags instanceof Array) {
            AssetPreloadMgr.preloadTags.length = 0;
            for (i = 0; i < assetsTags.length; ++i) {
                AssetPreloadMgr.preloadTags.push(assetsTags[i].tags);
            }
        }
        if (typeof callback === 'function') {
            callback.call(scope);
        }
    }
    else {
        configAsset.once('load', AssetPreloadMgr.loadAssetLoadConfig.bind(this, app, callback, scope), this);
        app.assets.load(configAsset);
    }
};

AssetPreloadMgr.setPreloadByTag = function (tags, isPreload) {
    if (isPreload === undefined) {
        isPreload = true;
    }
    else {
        isPreload = !!isPreload;
    }
    if (!(tags instanceof Array)) {
        tags = [tags];
    }
    var assets = pc.app.assets.findByTag.apply(pc.app.assets, tags);
    if (!assets || assets.length <= 0) return;
    var preloadDef = Object.getOwnPropertyDescriptor(pc.Asset.prototype, 'preload');
    var use_preload_getter = !!preloadDef.get;
    assets.forEach(function (asset) {
        if (!asset) return;
        asset.preload = isPreload;
        if (use_preload_getter) {
            asset._preload = isPreload;
        }
        else {
            asset.preload = isPreload;
        }
    });
};
AssetPreloadMgr.delayLoadAssetsByTags = function (callback) {
    var configAssetTag = 'assetsConfig';
    var assets = pc.app.assets.findByTag(configAssetTag);
    if (!assets || assets.length <= 0) {
        if (typeof callback === 'function')
            callback.call(scope, null);
        return;
    }
    var configAsset = assets[0];
    for (let i = 0; i < configAsset._resources.length; i++) {
        if (configAsset._resources[i].sceneName !== SCENE_PATH_SN) {
            assetsTags = configAsset._resources[i].assetsTags;
            AssetPreloadMgr.delayLoadTags.length = 0;
            for (let j = 0; j < assetsTags.length; ++j) {
                AssetPreloadMgr.delayLoadTags.push(assetsTags[j].tags);
            }
            var assetsArr = pc.app.assets.findByTag.apply(pc.app.assets, AssetPreloadMgr.delayLoadTags);
            if (assetsArr || assetsArr.length > 0) {
                // AssetPreloadMgr.delayLoadAssets.concat(assets);
                AssetPreloadMgr.delayLoadAssets.push.apply(AssetPreloadMgr.delayLoadAssets, assetsArr)
            }
        }
    }
    //每秒15帧
    AssetPreloadMgr.delayInterval = setInterval(function () {
        if (AssetPreloadMgr.resourcesLoaded < AssetPreloadMgr.delayLoadAssets.length) {
            var asset = AssetPreloadMgr.delayLoadAssets[AssetPreloadMgr.currentIndex];
            if (!asset.loaded) {
                // 资源尚未加载，继续等待下一帧
                pc.app.assets.load(asset);
            }
            AssetPreloadMgr.resourcesLoaded++;
            AssetPreloadMgr.currentIndex++;
        }
        else {
            clearInterval(AssetPreloadMgr.delayInterval);
            // 所有资源加载完成，执行游戏逻辑
        }
    }, 66);
}

AssetPreloadMgr.setPreload = function (callback, scope) {
    AssetPreloadMgr.loadAssetLoadConfig(pc.app, function () {
        AssetPreloadMgr.setPreloadByTag(AssetPreloadMgr.preloadTags, true);

        if (typeof callback === 'function')
            callback.call(scope);
    });
};

AssetPreloadMgr.injectAppPreload = function () {
    var AppClass = pc.AppBase || pc.Application;
    if (!pc || !AppClass) return;
    if (AppClass.prototype.originPreloadFunc && AppClass.prototype.originPreloadFunc !== AppClass.prototype.preload) return;
    AppClass.prototype.originPreloadFunc = AppClass.prototype.preload;
    AssetPreloadMgr.preload = AppClass.prototype.preload;
    AppClass.prototype.preload = function (callback) {
        AppClass.prototype.isPreloaded = false;
        AssetPreloadMgr.setPreload(function () {
            AppClass.prototype.isPrecompiled = true;
            AppClass.prototype.preloadCallback = callback;
            AppClass.prototype.delayLoad = AssetPreloadMgr.delayLoadAssetsByTags;
            AppClass.prototype.originPreloadFunc.call(this, function () {
                AppClass.prototype.isPreloaded = true;
                if (AppClass.prototype.isPrecompiled) {
                    if (typeof (AppClass.prototype.preloadCallback) == 'function') {
                        AppClass.prototype.preloadCallback();
                        AppClass.prototype.preloadCallback = null;
                        // setTimeout(function () {
                        //     AppClass.prototype.delayLoad();
                        // }, 1000);
                    }
                }
            });
        }, this);
    };
};
AssetPreloadMgr.injectAppPreload();


//如果是PC端启动
var OverrideSetting = {};
OverrideSetting.getPlatform = function () {
    if (pc.platform.browser) {
        window.CONTEXT_OPTIONS = {
            'antialias': true,
            'alpha': false,
            'preserveDrawingBuffer': false,
            'preferWebGl2': true,
            'powerPreference': "high-performance"
        }
    }
}
OverrideSetting.getPlatform();