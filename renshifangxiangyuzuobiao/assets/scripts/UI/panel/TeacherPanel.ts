import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import SubmissionPanel from "./SubmissionPanel";
import { NetWork } from "../../Http/NetWork";
import { UIHelp } from "../../Utils/UIHelp";
import { DaAnData } from "../../Data/DaAnData";
import GamePanel from "./GamePanel";
import {ListenerManager} from "../../Manager/ListenerManager";
import {ListenerType} from "../../Data/ListenerType";
import ErrorPanel from "./ErrorPanel";
import { ConstValue } from "../../Data/ConstValue";


const { ccclass, property } = cc._decorator;

@ccclass
export default class TeacherPanel extends BaseUI {
    protected static className = "TeacherPanel";

    @property([cc.Toggle])
    private toggleContainer : cc.Toggle[] = [];
    @property(cc.Button)
    private button : cc.Button = null;
    @property(cc.Node)
    private loadingNode: cc.Node = null
    @property(cc.EditBox)
    private editbox: cc.EditBox = null
    private touchEnable: boolean = true;
    onLoad () {
        cc.loader.loadRes('atlas/loading_01', sp.SkeletonData, null)
    }

    start() {
        ListenerManager.getInstance().add(ListenerType.CloseLoading, this, this.closeLoading)
        DaAnData.getInstance().types = 1;
        this.getNet();
    }

    onToggleContainer(toggle) {
        var index = this.toggleContainer.indexOf(toggle);
        switch(index) {
            case 0:
                DaAnData.getInstance().types = 1;
                break;
            case 1:
                DaAnData.getInstance().types = 2;
                break;
            case 2:
                DaAnData.getInstance().types = 3;
                break;
        }
    }

    onEditBoxCallback(editbox) {
        DaAnData.getInstance().head = editbox.string
        console.log('--------editbox', DaAnData.getInstance().head)
    }

    setPanel() {//设置教师端界面
        this.toggleContainer[DaAnData.getInstance().types-1].isChecked = true
        this.editbox.string = DaAnData.getInstance().head
    }

    closeLoading() {
        this.loadingNode.active = false
    }

    //上传课件按钮
    onBtnSaveClicked() {
        if(DaAnData.getInstance().head.length == 0) {
            UIHelp.showTip('标题不能为空，请输入标题。')
            return
        }
        this.loadingNode.active = true
        UIManager.getInstance().showUI(GamePanel,() => {
            ListenerManager.getInstance().trigger(ListenerType.OnEditStateSwitching, {state: 1}); 
        });
    }

    getNet() {
        NetWork.getInstance().httpRequest(NetWork.GET_TITLE + "?title_id=" + NetWork.titleId, "GET", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                if (Array.isArray(response.data)) {
                    return;
                }
                let content = JSON.parse(response.data.courseware_content);
                NetWork.coursewareId = response.data.courseware_id;
                if (NetWork.empty) {
                    //如果URL里面带了empty参数 并且为true  就立刻清除数据
                    this.ClearNet();
                } else {
                    if (content != null) {
                        if (content.CoursewareKey == ConstValue.CoursewareKey) {
                            if(content.types) {
                                DaAnData.getInstance().types = content.types
                            }else {
                                console.error('网络请求content.types的值为空')
                            }
                            if(content.head) {
                                DaAnData.getInstance().head = content.head
                            }else {
                                console.error('网络请求content.head的值为空')
                            }
                            this.setPanel()
                        } else {
                            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(
                                    "CoursewareKey错误,请联系客服！",
                                    "", "", "确定");
                            });
                            return;
                        }
                    }
                }
            }
        }.bind(this), null);
    }

    initData() {

    }

    //删除课件数据  一般为脏数据清理
    ClearNet() {
        let jsonData = { courseware_id: NetWork.coursewareId };
        NetWork.getInstance().httpRequest(NetWork.CLEAR, "POST", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                UIHelp.showTip("答案删除成功");
            }
        }.bind(this), JSON.stringify(jsonData));
    }

}
