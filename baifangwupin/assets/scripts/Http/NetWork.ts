import { ConstValue } from "../Data/ConstValue";
import { UIManager } from "../Manager/UIManager";
import ErrorPanel from "../UI/panel/ErrorPanel";
export class NetWork {
    private static instance: NetWork;

    //判断是否是线上   URL里不加参数则默认为测试环境
    public static readonly isOnlineEnv = NetWork.getInstance().GetIsOnline() == 'online';
    //判断是否是pc预加载的协议    URL里不加参数则默认为非预加载
    public static readonly isOwcr = NetWork.getInstance().GetBPreload();

    public static readonly BASE = NetWork.isOnlineEnv ? 'https://courseware.haibian.com' : 'https://ceshi_courseware.haibian.com';


    public static readonly GET_QUESTION = NetWork.BASE + '/get';
    public static readonly GET_USER_PROGRESS = NetWork.BASE + '/get/answer';
    public static readonly GET_TITLE = NetWork.BASE + "/get/title";
    public static readonly ADD = NetWork.BASE + "/add";
    public static readonly MODIFY = NetWork.BASE + "/modify";
    public static readonly CLEAR = NetWork.BASE + "/clear";

    public static empty: boolean = false;//清理脏数据的开关，在URL里面拼此参数 = true；

    //新课堂参数
    public static userId = null;        //用户id
    public static chapterId = null;     //直播讲id
    public static coursewareId = null;  //题目信息   用于交互游戏自身查题目信息  
    public static titleId = null;       //交互游戏绑定id   绑定的时候用（监课平台）  学生端不传
    public static bLive = null;         //是否是直播
    public static bPreload = null;      //是否预加载  （cdn/zip)
    public static env = null;           //运行环境（线上/测试）
    public static app = null;           //App名称
    public static platform = null;      //硬件平台信息（pc/iPad/android/androidPad/web）
    public static channel = null;       //使用方(辅导端、学生端、未来黑板、配齐、教研云、……）
    public static browser = null;       //浏览器信息（内核及版本）
    public static appVersion = null;    //端的版本信息

    private static theRequest = null;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new NetWork();
        }
        return this.instance;
    }

    /**
     * 请求网络Post 0成功 1超时
     * @param url 
     * @param openType 
     * @param contentType 
     * @param callback 
     * @param params 
     */
    httpRequest(url, openType, contentType, callback = null, params = "") {
        if (ConstValue.IS_TEACHER) {
            if (!NetWork.titleId) {
                //教师端没有titleId的情况
                UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                    (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(
                        "URL参数错误,缺少titleId,请联系技术人员！",
                        "", "", "确定");
                });
                return;
            }
        } else {
            //新课堂学生端  判断所有参数
            if (!ConstValue.IS_TEACHER && (!NetWork.userId || !NetWork.coursewareId || !NetWork.env || !NetWork.app || !NetWork.channel || !NetWork.browser)) {
                UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                    (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(
                        "URL参数错误,请联系客服！",
                        "", "", "确定");
                });
                return;
            }
        }


        var xhr = new XMLHttpRequest();
        xhr.open(openType, url);
        xhr.timeout = 10000;
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.withCredentials = true;

        //回调
        xhr.onreadystatechange = function () {
            console.log("httpRequest rsp status", xhr.status, "        xhr.readyState", xhr.readyState, "        xhr.responseText", xhr.responseText);
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 400)) {
                let response = JSON.parse(xhr.responseText);
                if (callback && response.errcode == 0) {
                    callback(false, response);
                } else {
                    if (ConstValue.IS_EDITIONS) {
                        UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                            (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(response.errmsg + ",请联系客服！", "", "", "确定", () => {
                                NetWork.getInstance().httpRequest(url, openType, contentType, callback, params);
                            }, false);
                        });
                    }
                }
            }
        };

        //超时回调
        xhr.ontimeout = function (event) {
            if (ConstValue.IS_EDITIONS) {
                UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                    (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("网络不佳，请稍后重试", "", "若重新连接无效，请联系客服", "重新连接", () => {
                        NetWork.getInstance().httpRequest(url, openType, contentType, callback, params);
                    }, true);
                });
            }
            console.log('httpRequest timeout');
            callback && callback(true, null);
        };

        //出错
        xhr.onerror = function (error) {
            if (ConstValue.IS_EDITIONS) {
                UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                    (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel("网络出错，请稍后重试", "若重新连接无效，请联系客服", "", "重新连接", () => {
                        NetWork.getInstance().httpRequest(url, openType, contentType, callback, params);
                    }, true);
                });
            }
            console.log('httpRequest error');
            callback && callback(true, null);
        }

        xhr.send(params);
    }

    /**
     * 获取url参数
     */
    GetRequest() {
        if (NetWork.theRequest != null) {
            return NetWork.theRequest;
        }
        NetWork.theRequest = new Object();
        var url = location.search; //获取url中"?"符后的字串

        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                NetWork.theRequest[strs[i].split("=")[0]] = decodeURIComponent(strs[i].split("=")[1]);
            }
        }

        //新课堂url必需参数
        NetWork.userId = NetWork.theRequest['userId'];
        NetWork.chapterId = NetWork.theRequest['chapterId'];
        NetWork.coursewareId = NetWork.theRequest['coursewareId'];
        NetWork.titleId = NetWork.theRequest['titleId'];
        NetWork.bLive = NetWork.theRequest['bLive'];
        NetWork.bPreload = NetWork.theRequest['bPreload'];
        NetWork.env = NetWork.theRequest['env'];
        NetWork.app = NetWork.theRequest['app'];
        NetWork.platform = NetWork.theRequest['platform'];
        NetWork.channel = NetWork.theRequest['channel'];
        NetWork.browser = NetWork.theRequest['browser'];
        NetWork.appVersion = NetWork.theRequest['appVersion'];
        NetWork.empty = NetWork.theRequest["empty"];

        this.LogJournalReport('CoursewareLogEvent', '')

        return NetWork.theRequest;

    }

    GetBPreload() {
        let BPreload = 0;
        if (this.GetRequest()["bPreload"]) {
            BPreload = this.GetRequest()["bPreload"];
        }
        return BPreload;
    }

    GetIsOnline() {
        let isOnline = "test";
        if (this.GetRequest()["env"]) {
            isOnline = this.GetRequest()["env"];
        }
        return isOnline;
    }

    LogJournalReport(errorType, data) {
        if (ConstValue.IS_EDITIONS) {
            var img = new Image();
            img.src = (NetWork.isOnlineEnv ? 'https://logserver.haibian.com/statistical/?type=7&' : 'https://ceshi-statistical.haibian.com/?type=7&') +
                'coursewareId=' + this.GetRequest()["coursewareId"] +
                "&chapterId=" + this.GetRequest()["chapterId"] +
                "&userId=" + this.GetRequest()["userId"] +
                "&bLive=" + this.GetRequest()["bLive"] +
                "&bPreload=" + this.GetRequest()["bPreload"] +
                "&env=" + this.GetRequest()["env"] +
                "&app=" + this.GetRequest()["app"] +
                "&platform=" + this.GetRequest()["platform"] +
                "&channel=" + this.GetRequest()["channel"] +
                "&browser=" + this.GetRequest()["browser"] +
                "&appVersion=" + this.GetRequest()["appVersion"] +
                "&event=" + errorType +
                "&identity=1" +
                "&extra=" + JSON.stringify({ url: location, CoursewareKey: ConstValue.CoursewareKey, empty: this.GetRequest()["empty"], CoursewareName: 'baifangwupin169_machao', data: data });
        }
    }
}