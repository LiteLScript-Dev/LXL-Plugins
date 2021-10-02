// 文件名：LxlBlackBe.lxl.js
// 文件功能：LXL平台下BlackBe云黑与本地黑名单工具
// 作者：yqs112358
// 首发平台：MineBBS

var _VER = '1.8.4'

logger.setConsole(true);
logger.setFile("./logs/BlackBe.log", 3);
logger.setTitle("BlackBe")
var conf = data.openConfig("./plugins/LxlBlackBe/config.json", "json", "{}");

function FormatDate(value) {
    var date = new Date(value);
    var y = date.getFullYear(),
        m = date.getMonth() + 1,
        d = date.getDate(),
        h = date.getHours(),
        i = date.getMinutes(),
        s = date.getSeconds();
    if (m < 10) { m = '0' + m; }
    if (d < 10) { d = '0' + d; }
    if (h < 10) { h = '0' + h; }
    if (i < 10) { i = '0' + i; }
    if (s < 10) { s = '0' + s; }
    var t = y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
    return t;
}

function GetLocalKickMsg(pl) {
    let kickMsg = conf.get("KickByLocalMsg");
    if(kickMsg.indexOf("%ENDTIME%") != -1)
        return kickMsg.replace(/%ENDTIME%/g, CheckPlayerLocal(pl));
    else
        return kickMsg;
}

function CheckPlayerLocal(pl) {
    blackList = conf.get("BlackList", []);
    for (var i in blackList) {
        if (blackList[i].name == pl.realName ||
            blackList[i].xuid == pl.xuid ||
            (conf.get("banip") && blackList[i].ip == pl.ip)) {
            return (blackList[i].endTime && blackList[i].endTime != "") ? blackList[i].endTime : " ";
        }
    }
    return null;
}

function BanPlayer(name, minutes) {
    while (name.startsWith("\""))
        name = name.substr(1);
    while (name.endsWith("\""))
        name = name.substr(0, name.length - 1);

    let pl = mc.getPlayer(name);
    let banInfo = {};

    if (pl) {
        //在线
        banInfo.name = pl.realName;
        banInfo.xuid = pl.xuid;
        if (conf.get("banip"))
            banInfo.ip = pl.ip;
    }
    else {
        //离线
        banInfo.name = name;
        xuidStr = data.name2xuid(name);
        if (xuidStr && xuidStr != "")
            banInfo.xuid = xuidStr;
    }
    if (minutes) {
        banInfo.endTime = FormatDate(new Date().getTime() + minutes * 60000);
    }

    //查询是否已存在
    blackList = conf.get("BlackList", []);
    for (var i in blackList) {
        if (blackList[i].name == name) {
            //存在
            if (banInfo.xuid)
                blackList[i].xuid = banInfo.xuid;
            if (banInfo.ip)
                blackList[i].ip = banInfo.ip;
            if (banInfo.endTime)
                blackList[i].endTime = banInfo.endTime;

            conf.set("BlackList", blackList);
            return false;
        }
    }
    //不存在
    blackList.push(banInfo);
    conf.set("BlackList", blackList);
    return true;
}

function UnbanPlayer(name) {
    blackList = conf.get("BlackList", []);
    for (var i in blackList) {
        if (blackList[i].name == name) {
            blackList.splice(i, 1);
            conf.set("BlackList", blackList);
            return true;
        }
    }
    return false;
}

function ListBan() {

    blackList = conf.get("BlackList", []);
    if (blackList.length == 0)
        log('[BlackBe] 本地黑名单列表为空。');
    else {
        log('[BlackBe] 本地黑名单列表如下：');
        blackList.forEach(function (item) {
            log("[Name] ", item.name, "\t[Xuid] ", item.xuid, "\t\t[IP] ", item.ip, "\t\t[EndTime] ", item.endTime);
        });
    }
}

//自动解ban
setInterval(function () {
    blackList = conf.get("BlackList", []);
    for (var i in blackList) {
        if (new Date(blackList[i].endTime).getTime() <= new Date().getTime()) {
            let msg = '玩家' + blackList[i].name + '的黑名单封禁已到期。已自动解封';
            mc.broadcast(msg);
            logger.warn(msg);
            blackList.splice(i, 1);
            conf.set("BlackList", blackList);
        }
    }
}, 60000);

mc.listen("onPreJoin", function (pl) {
    logger.info('玩家' + pl.name + '正在进入服务器...');


    //检查本地黑名单
    let localBanTime = CheckPlayerLocal(pl);
    if (localBanTime != null) {
        pl.kick(GetLocalKickMsg(pl));
        logger.warn('发现玩家' + pl.realName + '在服务器本地黑名单上，已断开连接！');
        return;
    }
    else
        logger.info('对玩家' + pl.realName + '的本地黑名单检测通过。');


    //检查云端黑名单
    network.httpGet('http://api.blackbe.xyz/api/check?v2=true&id=' + pl.name, function (status, result) {
        if (status != 200)
            logger.error('云黑检查失败！请检查你的网络连接。返回码：' + status);
        else {
            let res = JSON.parse(result);

            if (!res.success)
                logger.error('云黑检查失败！请检查你的网络连接。');
            else if (res.error != 2003) {
                setTimeout(function () {
                    pl.kick(conf.get("KickByCloudMsg"));
                }, 1);
                logger.warn('发现玩家' + pl.realName + '在BlackBe云端黑名单上，已断开连接！');
            }
            else
                logger.info('对玩家' + pl.realName + '的云端黑名单检测通过。');
        }
    });

});

mc.regConsoleCmd("ban", "封禁一个玩家", function (args) {
    if (args.length == 0)
        log('[Error] 参数错误！命令用法：ban <玩家名> [封禁时间/分钟]');
    else {
        let name = args[0];
        let time = args[1];

        if (!BanPlayer(name, time))
            log('[BlackBe] 玩家' + name + '已存在于本地黑名单中');
        else
            log('[BlackBe] 玩家' + name + '已加入本地黑名单');

        let pl = mc.getPlayer(name);
        if (pl)
            pl.kick(GetLocalKickMsg(pl));
    }
});

mc.regPlayerCmd("ban", "封禁一个玩家", function (pl, args) {
    if (args.length == 0)
        pl.tell('参数错误！命令用法：ban <玩家名> [封禁时间/分钟]');
    else {
        let name = args[0];
        let time = args[1];

        if (!BanPlayer(name, time))
            pl.tell('玩家' + name + '已存在于本地黑名单中');
        else
            pl.tell('玩家' + name + '已加入本地黑名单');

        let pl = mc.getPlayer(name);
        if (pl)
            pl.kick(GetLocalKickMsg(pl));
    }
}, 1);

mc.regConsoleCmd("unban", "解封一个玩家", function (args) {
    if (args.length == 0)
        log('[Error] 参数错误！命令用法：unban <玩家名>');
    else {
        let name = args[0];

        if (!UnbanPlayer(name))
            log('[BlackBe] 玩家' + name + '不在本地黑名单中！');
        else {
            log('[BlackBe] 已从本地黑名单中移除玩家' + name);
        }
    }
});

mc.regPlayerCmd("unban", "解封一个玩家", function (pl, args) {
    if (args.length == 0)
        pl.tell('参数错误！命令用法：unban <玩家名>');
    else {
        let name = args[0];

        if (!UnbanPlayer(name))
            pl.tell('玩家' + name + '不在本地黑名单中！');
        else {
            pl.tell('已从本地黑名单中移除玩家' + name);
        }
    }
}, 1);

mc.regConsoleCmd("banlist", "查询本地黑名单列表", function (args) {
    ListBan();
});

log('[BlackBe] JsBlackBe云黑插件已装载  当前版本：' + _VER);
log('[BlackBe] 作者：yqs112358   首发平台：MineBBS');
log('[BlackBe] 想要联系作者可前往MineBBS论坛');

log('[BlackBe] ============== 本地黑名单命令 ===============');
log('[BlackBe]    封禁指定玩家：ban <玩家名>  [封禁时间/分钟]  ');
log('[BlackBe]    解封指定玩家：unban <玩家名>   ');
log('[BlackBe]    列出本地黑名单中的信息：banlist   ');
log('[BlackBe] ============================================');