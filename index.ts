import Plugins from "~plugins";

const PLUGINS = [
    require("./Dismissables").default,
    require("./MoreSearchOperators").default,
];

for(const plugin of PLUGINS) {
    (plugin.tags ??= []).push("Davr1");
}

const name = Symbol("Davr1");
export default { name };

// This is called from api/Badges.ts, which is the first place that imports ~plugins
Set = new Proxy(Set, {
    construct(target, args) {
        if(Plugins && Plugins[name as any]) {
            Set = target;
            delete Plugins[name as any];
            for(const plugin of PLUGINS)
                Plugins[plugin.name] = plugin;
        }
        return Reflect.construct(target, args);
    }
});