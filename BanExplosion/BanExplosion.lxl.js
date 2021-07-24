// 文件名：BanExplosion.lxl.js
// 文件功能：LXL平台下自定义防爆插件
// 作者：yqs112358
// 首发平台：MineBBS

var _VER = '1.0.2';
var _ConfigPath = "plugins/BanExplosion/config.json"

var conf = data.openConfig(_ConfigPath,"json","{}");

logger.setTitle("BanExplosion")
if(conf.get("LogToFile",false))
    logger.setFile("./log/BanExplosion.log");
if(!conf.get("LogToConsole",false))
    logger.setConsole(false);


let banEnabled = true;
mc.listen("onExplode",function(entity,pos){
    if(banEnabled && conf.get("NoExplosion").indexOf(entity.type) != -1)
    {
        logger.info("已拦截位于",pos," 由",entity.name,"引发的爆炸");
        if(conf.get("BroadcastToGame",false))
            mc.broadcast("爆炸已拦截");
        return false;
    }
});

mc.regConsoleCmd("banexp","设置自定义防爆状态",function(args){
    if(args[0] == "on")
    {
        banEnabled = true;
        _LOG('=== 自定义防爆规则已启用 ===');
    }
    else if(args[0] == "off")
    {
        banEnabled = false;
        _LOG('=== 自定义防爆规则已临时关闭 ===');
    }
});


log('[BanExplosion] BanExplosion自定义防爆插件-已装载  当前版本：'+_VER);
log('[BanExplosion] 作者：yqs112358   首发平台：MineBBS');
log('[BanExplosion] 欲联系作者可前往MineBBS论坛');

log('[BanExplosion] ============== 后台命令 ==============');
log('[BanExplosion]    banexp on    封禁列表中指定的爆炸');
log('[BanExplosion]    banexp off   解封列表中指定的爆炸');
log('[BanExplosion] =====================================');
log('[BanExplosion] 配置文件位置：' + _ConfigPath);
log('[BanExplosion] === 自定义防爆规则已启用 ===');