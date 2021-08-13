// 文件名：ServerStopper.net.js
// 文件功能：游戏内停服插件
// 作者：yqs112358
// 首发平台：MineBBS

if(!lxl.checkVersion(0,3,0))
    throw new Error("【加载失败】\nLXL版本过旧！请升级你的LXL版本到0.3.0及以上再使用此插件");

let _VER = '1.1.0'
let _HasConfirmed = 1;

mc.regPlayerCmd("stop","关闭服务器",function(pl,args){
    if(pl.getExtraData("_SERVER_STOPPER_STATUS") == _HasConfirmed)
    {
        pl.tell("停服命令执行成功",1);
        mc.broadcast("玩家" + pl.realName + "执行停服命令。服务器将在5秒之后关闭");
        setTimeout(function(){ mc.runcmd("stop"); },5000);
        pl.setExtraData("_SERVER_STOPPER_STATUS",null);
    }
    else
    {
        pl.tell("你真的确定要停服吗？请再次执行/stop确认",1);
        pl.setExtraData("_SERVER_STOPPER_STATUS",_HasConfirmed);
    }
},1);

mc.listen("onPlayerCmd",function(pl,cmd){
    if(cmd != "stop" && pl.getExtraData("_SERVER_STOPPER_STATUS") == _HasConfirmed)
    {
        pl.tell("确认失败。你的停服命令已被取消",1);
        pl.setExtraData("_SERVER_STOPPER_STATUS",null);
    }
});

log('[ServerStopper] ServerStopper停服命令插件已装载  当前版本：'+_VER);
log('[ServerStopper] 有权限的玩家在游戏内输入/stop并再次确认后即可停服');
log('[ServerStopper] 主要用于配合有自动重启功能的服务端以实现用游戏内命令重启服务器');
log('[ServerStopper] 作者：yqs112358   首发平台：MineBBS');
log('[ServerStopper] 欲联系作者可前往MineBBS论坛');