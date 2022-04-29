// 文件名：NbtDbg.net.js
// 文件功能：游戏内停服插件
// 作者：yqs112358
// 首发平台：MineBBS

if(!lxl.checkVersion(0,5,0))
    throw new Error("【加载失败】\nLXL版本过旧！请升级你的LXL版本到0.5.0及以上再使用此插件");

let _VER = '1.2.0'

logger.setTitle("NbtDbg");
logger.setConsole(true);

//Item
mc.listen("onUseItem",function(pl,item){
    if(pl.getExtraData("_NBTDBG_IS_ENABLED") != null)
    {
        let str=item.getNbt().toSNBT();
        pl.tell(str,0);
        logger.log("\n"+str);
    }
});

//Block
mc.listen("onStartDestroyBlock",function(pl,bl){
    if(pl.getExtraData("_NBTDBG_IS_ENABLED") != null)
    {
        let str=bl.getNbt().toSNBT();
        pl.tell(str,0);
        logger.log("\n"+str);
    }
});

//Entity
mc.listen("onAttack",function(pl,ac){
    if(pl.getExtraData("_NBTDBG_IS_ENABLED") != null)
    {
        let str=ac.getNbt().toSNBT();
        pl.tell(str,0);
        logger.log("\n"+str);
    }
});

//BlockEntity
mc.listen("onJump",function(pl){
    if(pl.getExtraData("_NBTDBG_IS_ENABLED") != null)
    {
        let pos=pl.pos;
        pos.y-=1;
        let block=mc.getBlock(Math.floor(pos.x),Math.floor(pos.y),Math.floor(pos.z),pos.dimid);
        if(!block.hasBlockEntity())
        {
            pos.y+=1;
            block=mc.getBlock(Math.floor(pos.x),Math.floor(pos.y),Math.floor(pos.z),pos.dimid);
        }
        if(block != null && block != undefined && block.hasBlockEntity())
        {
            let be = block.getBlockEntity();
            let str=be.getNbt().toSNBT();
            pl.tell(str,0);
            logger.log("\n"+str);
        }
    }
});

//Player
mc.listen("onSneak",function(pl,is){
    if(pl.getExtraData("_NBTDBG_IS_ENABLED") != null && is)
    {
        let str=pl.getNbt().toSNBT();
        pl.tell(str,0);
        logger.log("\n"+str);
    }
});

mc.regPlayerCmd("nbtdbg","Enable/Disable showing NBT Debug info in game",function(pl,args){
    if(pl.getExtraData("_NBTDBG_IS_ENABLED") != null)
    {
        pl.setExtraData("_NBTDBG_IS_ENABLED",null);
        pl.tell("<NbtDbg>NBT调试模式已关闭",1);
    }
    else
    {
        pl.setExtraData("_NBTDBG_IS_ENABLED",1);
        pl.tell("<NbtDbg>NBT调试模式已启用",1);
    }
},1);

log('[NbtDbg] NbtDbg游戏内调试信息插件已装载  当前版本：'+_VER);
log('[NbtDbg] 游戏内使用/nbtdbg命令后，在游戏内操作，将输出相关NBT信息到游戏和控制台');
log('[NbtDbg] 作者：yqs112358   首发平台：MineBBS');
log('[NbtDbg] 欲联系作者可前往MineBBS论坛');