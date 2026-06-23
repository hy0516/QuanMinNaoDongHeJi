import GameData from "./GameData";

/**
 * 资源管理
 */
export default class AssetManager {
    /**自定义资源包名 */
    public static BundleName = {
        level: "level",
        levelWeb: "levelWeb",
        RESOURCES: "resources",
        picture:"picture"
    }

    /**
     * 加载资源包
     * @param name 资源包名
     * @param options  可选配置参数
     * @param completeCallback 成功回调
     */
    public static async loadBundle(name: string, options?: Object): Promise<cc.AssetManager.Bundle> {
        return new Promise(resolve => {
            cc.assetManager.loadBundle(name, options, (error: Error, bundle: cc.AssetManager.Bundle) => {
                if (error) {
                    resolve(null);
                    return console.log(error.message);
                }
                resolve(bundle);
            });
        })
    }

    /**
     * 获取已加载的分包
     * @param name 资源包名
     */
    public static getBundle(name: string): cc.AssetManager.Bundle {
        return cc.assetManager.getBundle(name);
    }

    /**
     * 移除此资源包，注意：这个包内的资源不会自动释放, 如果需要的话你可以在摧毁之前手动调用 releaseAll 进行释放
     * @param name 资源包名
     */
    public static removeBundle(name: string): void {
        let bundle: cc.AssetManager.Bundle = this.getBundle(name);
        if (bundle) {
            cc.assetManager.removeBundle(bundle);
        } else {
            console.warn(`load ${name} bundle first`);
        }
    }

    /**
     * 加载指定资源包内资源
     * @param name  资源包名
     * @param paths 相对分包文件夹路径的相对路径
     * @param type  资源类型
     * @param progressCallback  加载回调
     * @param completedCallback 完成回调
     */
    public static load(name: string, paths: string, type: typeof cc.Asset, progressCallback?: (completedCount: number, totalCount: number) => void, completedCallback?: (asset: any) => void): void {
        // if (GameData.lvConfig.isweb == 1) {
        //     name = AssetManager.BundleName.levelWeb;
        // } else {
        if (name == AssetManager.BundleName.level) {
            name = GameData.curGameStyle;
        }
        // }
        let bundle: cc.AssetManager.Bundle = this.getBundle(name);
        if (bundle) {
            bundle.load(paths, type, (completedCount: number, totalCount: number) => {
                progressCallback && progressCallback(completedCount, totalCount);
            }, (error: Error, asset: cc.Asset) => {
                if (error) {
                    return console.log(error.message);
                }
                // console.log(`load ${asset.name} completed`);
                completedCallback && completedCallback(asset);
            })
        } else {
            console.warn(`load ${name} bundle first`);
        }
    }

    /**
     * 加载目标文件夹中的所有资源, 注意：路径中只能使用斜杠，反斜杠将停止工作
     * @param name  资源包名
     * @param paths 相对分包文件夹路径的相对路径
     * @param type  资源类型
     * @param progressCallback  加载回调
     * @param completedCallback 完成回调
     */
    public static loadDir(name: string, paths: string, type: typeof cc.Asset, progressCallback?: Function, completedCallback?: Function): void {
        if (GameData.lvConfig) {
            // if (GameData.lvConfig.isweb == 1) {
            //     name = AssetManager.BundleName.levelWeb;
            // } else {
            // name = AssetManager.BundleName.level;
            // }
        }
        let bundle: cc.AssetManager.Bundle = this.getBundle(name);
        if (bundle) {
            bundle.loadDir(paths, type, (completedCount: number, totalCount: number) => {
                progressCallback && progressCallback(completedCount, totalCount);
            }, (error: Error, assets: cc.Asset[]) => {
                if (error) {
                    return console.log(error.message);
                }

                if (assets.length == 0) {
                    completedCallback && completedCallback(null);
                    return console.log(`Bundle ${bundle.name} doesn't contain ${paths}`);
                }

                // assets.forEach(asset => {
                // console.log(`load ${asset.name} completed`);
                // })
                completedCallback && completedCallback(assets);
            })
        } else {
            console.warn(`load ${name} bundle first`);
        }
    }

    /**
     * 释放指定资源包内的资源
     * @param name 资源包名
     * @param path 资源包内资源的相对路径
     * @param type 资源类型
     */
    public static releaseBundleAsset(name: string, path: string, type: typeof cc.Asset): void {
        let bundle: cc.AssetManager.Bundle = this.getBundle(name);
        if (bundle) {
            bundle.release(path, type);
        } else {
            console.warn(`load ${name} bundle first`);
        }
    }

    /**
     * 释放指定资源包内的所有资源
     * @param name 资源包名
     */
    public static releaseAllBundleAsset(name: string): void {
        let bundle: cc.AssetManager.Bundle = this.getBundle(name);
        if (bundle) {
            bundle.releaseAll();
        } else {
            console.warn(`load ${name} bundle first`);
        }
    }

    /**
     * 释放资源以及其依赖资源, 这个方法不仅会从 assetManager 中删除资源的缓存引用，还会清理它的资源内容。 比如说，当你释放一个texture资源，这个texture和它的gl贴图数据都会被释放。
     * 注意：这个函数可能会导致资源贴图或资源所依赖的贴图不可用，如果场景中存在节点仍然依赖同样的贴图，它们可能会变黑并报 GL 错误。
     * @param asset 资源
     */
    public static releaseAsset(asset: cc.Asset): void {
        cc.assetManager.releaseAsset(asset);
    }

    /**
     * 释放所有资源
     */
    public static releaseAllAsset(): void {
        cc.assetManager.releaseAll();
    }
}
