//LiteXLoader Dev Helper
/// <reference path="c:\Users\yqs11\.vscode\extensions\moxicat.lxldevhelper-0.1.4/Library/JS/Api.js" /> 


// 文件名：OnlineTimer.lxl.js
// 文件功能：LXL平台下玩家在线时间统计工具
// 作者：yqs112358
// 首发平台：MineBBS

var _VER = '1.2.2'

ProcessOldDataJson();
var records=data.openConfig('.\\plugins\\OnlineTimer\\data.json' ,"json","{}");
var conf = data.openConfig('.\\plugins\\OnlineTimer\\config.ini' ,"ini");

//Utils
function GetTimeGap(timestr)
{
    return ((new Date().getTime() - new Date(timestr).getTime()) / 1000).toFixed(0);
}

function ReplaceStr(str,from,to)
{
    while(str.indexOf(from) != -1)
        str = str.replace(from,String(to));
    return str;
}

function SolveStr(name,str,isWelcome)
{
    let dat = records.get(name);
    if(!dat)
        return str;

    let lastLogin = dat.LastLogin;
    let minutes = dat.TotalTime;
    let days = 0, hours = 0;

    while(minutes > 60)
    {
        minutes -= 60;
        ++hours;
    }
    while(hours > 24)
    {
        hours -= 24;
        ++days;
    }

    str = ReplaceStr(str,"%DAY%", days);
    str = ReplaceStr(str,"%HOUR%", hours);
    str = ReplaceStr(str,"%MINUTE%", minutes);
    str = ReplaceStr(str,"%LASTLOGIN%", lastLogin);

    if(isWelcome)
    {
        let timeMinus = GetTimeGap(lastLogin);
        let nodays = (timeMinus / 86400).toFixed(0);
        str = ReplaceStr(str,"%NODAYS%", nodays);
    }
    return str;
}

//Enter & Leave
function EnterPlayer(name)
{
    let dat = records.get(name);
    if(!dat)
        records.set(name, { "LastLogin":system.getTimeStr(), "TotalTime":0 } );
    else
    {
        dat.LastLogin = system.getTimeStr();
        records.set(name,dat);
    }
}

function GetWelcome(name)
{
    let dat = records.get(name);
    if(!dat)
        return SolveStr(name, conf.getStr("Welcome","FirstTime"), true);

    let timeMinus = GetTimeGap(dat.LastLogin);
    let days = (timeMinus / 86400).toFixed(0);
    
    if(days < 1)
        return SolveStr(name, conf.getStr("Welcome","Back"), true);
    else
        return SolveStr(name, conf.getStr("Welcome","BackLong"), true);
}

function GetOnlineTime(name)
{
    let dat = records.get(name);
    if(!dat)
        return "Data no found";
    else
        return SolveStr(name, conf.getStr("OnlineTime","Query"), false);
}

//Time Record
function AddTime(name)
{
    let dat = records.get(name);
    if(!dat)
        records.set(name, { "LastLogin":system.getTimeStr(), "TotalTime":0 } );
    else
    {
        ++dat.TotalTime;
        records.set(name,dat);
    }
}

function QueryTime(pl)
{
    mc.runcmdEx(`titleraw ${pl.realName} actionbar {"rawtext":[{"text":"${GetOnlineTime(pl.realName)}"}]}`);
}

function QueryRank(pl)
{
    let arr = [];
    let dat = JSON.parse(records.read());
    let names = Object.keys(dat);
    for(i in names)
    {
		try
		{
			arr.push( {name:names[i], time:eval(`dat.${names[i]}.TotalTime`)} );
		}
		catch(_)
		{}
    }

    arr.sort(function(a,b){
        return b.time-a.time;
    });

    let content = "";
    for(i in arr)
    {
        content += `${Number(i)+1}. ${arr[i].name} - ${arr[i].time} 分钟\n`;
    }

    let fm = mc.newSimpleForm();
    fm.setTitle("Online Time Ranking");
    fm.setContent(content);
    fm.addButton("关闭");
    pl.sendForm(fm,function(pl,id){;});
}

//Main
setInterval(function(){
    let pls = mc.getOnlinePlayers();
    for(let i=0; i<pls.length; ++i)
    {
        AddTime(pls[i].realName);
    }
},60000);

mc.listen("onJoin",function(pl){
    let name = pl.realName;
    if(conf.getBool("Welcome","Enable"))
    {
        setTimeout(function(){
            mc.runcmdEx(`titleraw ${name} actionbar {"rawtext":[{"text":"${GetWelcome(name)}"}]}`);
        },1000);
    }
    EnterPlayer(name);
});

mc.regPlayerCmd("onlinetime","查询你的在线时长",function(pl,args){
    QueryTime(pl);
});

mc.regPlayerCmd("onlinetime rank","查询在线时长排名",function(pl,args){
    QueryRank(pl);
});

log('[OnlineTimer] OnlineTimer在线时间统计插件-已装载  当前版本：' + _VER);
log('[OnlineTimer] 作者：yqs112358   首发平台：MineBBS');
log('[OnlineTimer] 欲联系作者可前往MineBBS论坛');















//For Compatibility
function ProcessOldDataJson()
{
    try{
        let f = file.open('.\\plugins\\OnlineTimer\\data.json',file.ReadMode);
        let c = f.readSync(1);
        f.close();

        if(c == '[')
        {
            log("[OnlineTimer] 检测到旧版数据文件。正在自动更新...");
            let oldData = JSON.parse(file.readFrom('.\\plugins\\OnlineTimer\\data.json'));
            let newData = {};
            for(i in oldData)
            {
                newData[oldData[i].name] = {};
                newData[oldData[i].name].LastLogin = oldData[i].lastLogin;
                newData[oldData[i].name].TotalTime = oldData[i].totalTime;
            }
            file.writeTo('.\\plugins\\OnlineTimer\\data.json',JSON.stringify(newData,null,4));
            log("[OnlineTimer] 数据文件自动升级完毕");
        }
    }
    catch(_)
    { }
}