// 文件名：EditSign.lxl.js
// 文件功能：LXL平台下修改告示牌文字工具
// 作者：yqs112358
// 首发平台：MineBBS

var _VER = '1.0.1'

mc.regPlayerCmd("editsign","开始修改告示牌",function(pl,args)
{
    pl.setExtraData("_IS_CHANGING_SIGN",true);
    pl.tell("<EditSign>进入编辑模式\n<EditSign>点击任意告示牌来修改其文字");
});

mc.listen("onPlaceBlock",function(pl,bl){
    if(pl.getExtraData("_IS_CHANGING_SIGN"))
    {
        pl.tell("<EditSign>点击的不是告示牌，编辑模式已退出");
        pl.setExtraData("_IS_CHANGING_SIGN",null);
    }
});

mc.listen("onAttack",function(pl,ac){
    if(pl.getExtraData("_IS_CHANGING_SIGN"))
    {
        pl.tell("<EditSign>点击的不是告示牌，编辑模式已退出");
        pl.setExtraData("_IS_CHANGING_SIGN",null);
    }
});

mc.listen("onUseItemOn",function(pl,it,bl){
    if(pl.getExtraData("_IS_CHANGING_SIGN"))
    {
        if((bl.type == "sign" || bl.type.indexOf("_sign") != -1) && bl.hasBlockEntity())
        {
            if(pl.getExtraData("_IS_EDIT_SIGN_CLICKING"))
                return;
            pl.setExtraData("_IS_EDIT_SIGN_CLICKING",true)
            setTimeout(function(){ pl.setExtraData("_IS_EDIT_SIGN_CLICKING",null) },200);

            let ble = bl.getBlockEntity();
            let nbt = ble.getNbt();
            let text = nbt.getTag("Text").get().replace(/\n/g, "\\n");


            let form = mc.newCustomForm();
            form.setTitle("EditSign - 编辑模式");
            form.addInput("修改目标告示牌的文字为：","",text);
            form.addLabel("使用\\n来表示换行符");
            pl.sendForm(form,function(pl,data){
                if(!data)
                {
                    pl.tell("<EditSign>编辑模式已退出");
                    pl.setExtraData("_IS_CHANGING_SIGN",null);
                }
                else
                {
                    nbt.setString("Text",data[0].replace(/\\n/g, "\n"));
                    ble.setNbt(nbt);
                    pl.tell("<EditSign>编辑完毕");
                    pl.setExtraData("_IS_CHANGING_SIGN",null);
                }
            });
        }
        else
        {
            pl.tell("<EditSign>点击的不是告示牌，编辑模式已退出");
            pl.setExtraData("_IS_CHANGING_SIGN",null);
        }
    }
});

log('[EditSign] EditSign告示牌编辑插件  当前版本：' + _VER);
log('[EditSign] 游戏内使用/editsign命令进入告示牌编辑模式');
log('[EditSign] 作者：yqs112358   首发平台：MineBBS');
log('[EditSign] 想要联系作者可前往MineBBS论坛');