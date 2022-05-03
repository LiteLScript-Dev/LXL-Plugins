// 文件名：LxlMute.lxl.js
// 文件功能：LXL平台下禁言工具
// 作者：yqs112358
// 首发平台：MineBBS

var _VER = '1.0.0'

var conf = data.openConfig("./plugins/LxlMute/config.json", "json", "{}");

//Utils

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

function ReplaceStr(str,from,to)
{
    while(str.indexOf(from) != -1)
        str = str.replace(from,String(to));
    return str;
}

function SolveStr(str,name) {
    str = ReplaceStr(str,"%TIME%", days);
    return str;
}

function CheckPlayerLocal(pl) {
    blackList = conf.get("BlackList", []);
    for (var i in blackList) {
        if (blackList[i].name == pl.realName ||
            blackList[i].xuid == pl.xuid ||
            blackList[i].ip == pl.ip) {
            return (blackList[i].endTime && blackList[i].endTime != "") ? blackList[i].endTime : " ";
        }
    }
    return null;
}

function MutePlayer(name, minutes) {
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

mc.listen("onChat", function (pl,msg) {
    let list = conf.get("List");
    let names = Object.keys(list);
    let name = pl.realName;

    if(names.indexOf(name) != -1)
    {
        if(list[name] == "INFINITE")
        {
            pl.tell("")
        }
        return false;
    }
});

mc.regConsoleCmd("mute", "禁言一个玩家", function (args) {
    if (args.length == 0)
        log('[Error] 参数错误！命令用法：mute <玩家名> [封禁时间/分钟]');
    else {
        let name = args[0];
        let time = args[1];

        MutePlayer(name, time)
        log('[LxlMute] 玩家' + name + '已被禁言');
    }
});

mc.regPlayerCmd("ban", "禁言一个玩家", function (pl, args) {
    if (args.length == 0)
        log('[Error] 参数错误！命令用法：mute <玩家名> [封禁时间/分钟]');
    else {
        let name = args[0];
        let time = args[1];

        MutePlayer(name, time)
        log('[LxlMute] 玩家' + name + '已被禁言');
    }
}, 1);

mc.regConsoleCmd("unmute", "解除玩家禁言", function (args) {
    if (args.length == 0)
        log('[Error] 参数错误！命令用法：unmute <玩家名>');
    else {
        let name = args[0];

        if(UnmutePlayer(name))
            log('[LxlMute] 玩家' + name + '已被解除禁言');
        else
            log('[LxlMute] 玩家' + name + '尚未被禁言！');
    }
});

mc.regPlayerCmd("unmute", "解除玩家禁言", function (pl, args) {
    if (args.length == 0)
        log('[Error] 参数错误！命令用法：unmute <玩家名>');
    else {
        let name = args[0];

        if(UnmutePlayer(name))
            log('[LxlMute] 玩家' + name + '已被解除禁言');
        else
            log('[LxlMute] 玩家' + name + '尚未被禁言！');
    }
}, 1);

mc.regConsoleCmd("mutelist", "查询禁言列表", function (args) {
    ListMute();
});

log('[LxlMute] LxlMute 禁言插件已装载  当前版本：' + _VER);
log('[LxlMute] 作者：yqs112358   首发平台：MineBBS');
log('[LxlMute] 想要联系作者可前往MineBBS论坛');