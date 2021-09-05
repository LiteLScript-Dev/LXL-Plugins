// 文件名：LxlCheckBag.lxl.js
// 文件功能：LXL平台下背包检查工具
// 作者：yqs112358
// 首发平台：MineBBS

var _VER = '1.0.0'

file.mkdir("plugins/LxlCheckBag");
let conf=data.openConfig("plugins/LxlCheckBag/config.json","json","{}");

///////////////////// Bag Operations /////////////////////

function SaveBag(pl)
{
    let nbt=pl.getNbt();
    let saveNBT = NBT.createTag(NBT.Compound);
    saveNBT.setTag("OffHand",nbt.getTag("Offhand"));
    saveNBT.setTag("Inventory",nbt.getTag("Inventory"));
    saveNBT.setTag("Armor",nbt.getTag("Armor"));
    saveNBT.setTag("EnderChest",nbt.getTag("EnderChestInventory"));
    
    file.writeTo(`plugins/LxlCheckBag/${pl.name}.json`,saveNBT.toSNBT());
    pl.tell("<LxlCheckBag> 你的背包已经备份");
}

function ResumeBag(pl)
{
    let path = `plugins/LxlCheckBag/${pl.name}.json`;

    let readNBT = NBT.parseSNBT(file.readFrom(path));
    let nbt=pl.getNbt();
    nbt.setTag("Offhand",readNBT.getTag("OffHand"));
    nbt.setTag("Inventory",readNBT.getTag("Inventory"));
    nbt.setTag("Armor",readNBT.getTag("Armor"));
    nbt.setTag("EnderChestInventory",readNBT.getTag("EnderChest"));
    pl.setNbt(nbt);
    
    pl.refreshItems();
    file.delete(path);
    pl.tell("<LxlCheckBag> 你的背包已经恢复");
}

function CopyBag(pl1,pl2)
{
    let nbt1=pl1.getNbt(),nbt2=pl2.getNbt();
    nbt2.setTag("Offhand",nbt1.getTag("Offhand"));
    nbt2.setTag("Inventory",nbt1.getTag("Inventory"));
    nbt2.setTag("Armor",nbt1.getTag("Armor"));
    nbt2.setTag("EnderChestInventory",nbt1.getTag("EnderChestInventory"));
    pl2.setNbt(nbt2);

    pl2.refreshItems();
    pl2.tell("<LxlCheckBag> 背包复制完成");
}

///////////////////// UI /////////////////////

function ShowMainUI(pl)
{
    let fm=mc.newSimpleForm();
    fm.setTitle("Check Bag");

    let nowName = pl.getExtraData("_IS_CHECKING_BAG");
    if(!nowName)
    {
        fm.setContent("请选择要查询背包的目标玩家\n点击开始查包：");
        let players = mc.getOnlinePlayers();
        for(let i=0;i<players.length;++i)
            if(players[i].name == pl.name)
            {
                players.splice(i,1);
                break;
            }

        if(players.length == 0)
        {
            pl.tell("<LxlCheckBag> 目前服务器中没有其他玩家！\n<LxlCheckBag> 无法进行查包工作");
            return;
        }
        players.forEach(function(p){
            fm.addButton(p.name);
        });

        pl.sendForm(fm,function(pl,id){
            if(id != null)
            {
                SaveBag(pl);
                CopyBag(players[id],pl);
                pl.setExtraData("_IS_CHECKING_BAG",players[id].name);
                pl.tell("<LxlCheckBag> 所有内容已复制完成，请进行检查工作");
            }
        });
    }
    else
    {
        fm.setContent(`你正在检查${nowName}玩家的背包。\n请选择一项操作：`);

        fm.addButton("结束查包，恢复自己的背包到原状");
        if(mc.getPlayer(nowName))
        {
            fm.addButton("自己当前的背包 => 被查包玩家的背包");
            fm.addButton("自己当前的背包 <= 被查包玩家的背包");
        }

        pl.sendForm(fm,function(pl,id){
            switch(id)
            {
                case 0:
                    ResumeBag(pl);
                    pl.tell("<LxlCheckBag> 查包成功结束");
                    pl.setExtraData("_IS_CHECKING_BAG",null);
                    break;
                case 1:
                    pl.sendModalForm("Confirm",`你确定要覆盖背包内容吗？\n这项操作一旦完成，将无法撤销`,"确定","取消",function(pl,id){
                        if(id == 1)
                        {
                            let nowPl = mc.getPlayer(nowName);
                            if(!nowPl)
                                pl.tell("<LxlCheckBag> 覆盖背包失败！玩家不存在");
                            else
                            {
                                CopyBag(pl,nowPl);
                                pl.tell("<LxlCheckBag> 背包覆盖完成");
                            }
                        }
                        else
                        {
                            ShowMainUI(pl);
                        }
                    });
                    break;
                case 2:
                    let nowPl = mc.getPlayer(nowName);
                    if(!nowPl)
                        pl.tell("<LxlCheckBag> 覆盖背包失败！玩家不存在");
                    else
                    {
                        CopyBag(nowPl,pl);
                        pl.tell("<LxlCheckBag> 背包覆盖完成");
                    }
                    break;
                default:
                    break;
            }
        });
    }
}

///////////////////// Main /////////////////////

mc.regPlayerCmd("checkbag","查包",function(pl,args){
    ShowMainUI(pl);
},1);

mc.regPlayerCmd("checkbag forceback","查包-强制恢复备份背包数据",function(pl,args){
    pl.sendModalForm("Confirm",`你确定要覆盖背包内容吗？\n这项操作一旦完成，将无法撤销`,"确定","取消",function(pl,id){
        if(id == 1)
        {
            if(!file.exists(`plugins/LxlCheckBag/${pl.name}.json`))
                pl.tell('<LxlCheckBag> 未找到已备份的背包数据！');
            else
            {
                ResumeBag(pl);
                pl.setExtraData("_IS_CHECKING_BAG",null);
                pl.tell('<LxlCheckBag> 背包强制恢复完毕');
            }
        }
    });
},1);

log('[LxlBagTools] LxlCheckBag 背包检查工具已装载  当前版本：' + _VER);
log('[LxlBagTools] 作者：yqs112358   首发平台：MineBBS');
log('[LxlBagTools] 想要联系作者可前往MineBBS论坛');