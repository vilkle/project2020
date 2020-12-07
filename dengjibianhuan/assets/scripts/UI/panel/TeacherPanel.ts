import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import SubmissionPanel from "./SubmissionPanel";
import { NetWork } from "../../Http/NetWork";
import { UIHelp } from "../../Utils/UIHelp";
import { DaAnData } from "../../Data/DaAnData";
import ErrorPanel from "./ErrorPanel";
import GamePanel from "./GamePanel";
import { ConstValue } from "../../Data/ConstValue";
import {ListenerManager} from "../../Manager/ListenerManager";
import {ListenerType} from "../../Data/ListenerType";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TeacherPanel extends BaseUI {
    protected static className = "TeacherPanel";
    @property(cc.Node)
    private node1: cc.Node = null
    @property(cc.Node)
    private node2: cc.Node = null
    @property([cc.Toggle])
    private toggleContainer: cc.Toggle[] = []
    @property(cc.SpriteFrame)
    private frame1: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame2: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame3: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame4: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame5: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame6: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame7: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame8: cc.SpriteFrame = null
    @property(cc.SpriteFrame)
    private frame9: cc.SpriteFrame = null
    @property(cc.Node)
    private loadingNode: cc.Node = null

    private option1: cc.Node = null
    private option2: cc.Node = null
    private option3: cc.Node = null
    private type: number = 0
    private qType: number = 0


    onLoad () {
        ListenerManager.getInstance().add(ListenerType.CloseLoading, this, this.closeLoading)
        this.option1 = this.node1.getChildByName('option1')
        this.option2 = this.node1.getChildByName('option2')
        this.option3 = this.node1.getChildByName('option3')
        
        this.option1.on(cc.Node.EventType.TOUCH_START, (e)=>{
            this.option1.color = cc.Color.RED
            this.type = 1
            this.qType = 1
            this.option2.color = cc.Color.BLACK
            this.option3.color = cc.Color.BLACK
            this.interface1()
        })
        this.option2.on(cc.Node.EventType.TOUCH_START, (e)=>{
            this.option2.color = cc.Color.RED
            this.type = 2
            this.qType = 1
            this.option1.color = cc.Color.BLACK
            this.option3.color = cc.Color.BLACK
            this.interface2()
        })
        this.option3.on(cc.Node.EventType.TOUCH_START, (e)=>{
            this.option3.color = cc.Color.RED
            this.type = 3
            this.qType = 1
            this.option2.color = cc.Color.BLACK
            this.option1.color = cc.Color.BLACK
            this.interface3()
        })

    }

    start() {
        this.type = 1
        this.qType = 1
        //this.getNet();
    }

    closeLoading() {
        this.loadingNode.active = false
    }

    setPanel() {//设置教师端界面
        switch (this.type) {
            case 1:
                this.option1.color = cc.Color.RED
                this.interface1()
                break;
            case 2:
                this.option2.color = cc.Color.RED
                this.interface2()
                break;
            case 3:
                this.option3.color = cc.Color.RED
                this.interface3()
                break;
            default:
                break;
        }
    }

    interface1() {
        this.node2.getChildByName('toggle2').active = true
        this.node2.getChildByName('toggle3').active = true
        this.node2.getChildByName('toggle4').active = true
        this.node2.getChildByName('toggle1').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame4
        this.node2.getChildByName('toggle2').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame5
        this.node2.getChildByName('toggle3').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame2
        this.node2.getChildByName('toggle4').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame1
        if(this.qType == 1) {
            this.toggleContainer[0].isChecked = true
        }else if(this.qType == 2) {
            this.toggleContainer[1].isChecked = true
        }else if(this.qType == 3) {
            this.toggleContainer[2].isChecked = true
        }else if(this.qType == 4) {
            this.toggleContainer[3].isChecked = true
        }

    }

    interface2() {
        this.node2.getChildByName('toggle2').active = true
        this.node2.getChildByName('toggle3').active = true
        this.node2.getChildByName('toggle4').active = true
        this.node2.getChildByName('toggle1').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame6
        this.node2.getChildByName('toggle2').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame9
        this.node2.getChildByName('toggle3').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame3
        this.node2.getChildByName('toggle4').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame7
        if(this.qType == 1) {
            this.toggleContainer[0].isChecked = true
        }else if(this.qType == 2) {
            this.toggleContainer[1].isChecked = true
        }else if(this.qType == 3) {
            this.toggleContainer[2].isChecked = true
        }else if(this.qType == 4) {
            this.toggleContainer[3].isChecked = true
        }
    }

    interface3() {
        this.node2.getChildByName('toggle1').getChildByName('frame').getComponent(cc.Sprite).spriteFrame = this.frame8
        this.node2.getChildByName('toggle2').active = false
        this.node2.getChildByName('toggle3').active = false
        this.node2.getChildByName('toggle4').active = false
        if(this.qType == 1) {
            this.toggleContainer[0].isChecked = true
        }else {
            console.error('there is an erro on value of  qType.')
        }
        
    }

    onToggleContainer(toggle) {
        var index = this.toggleContainer.indexOf(toggle)
        switch (index) {
            case 0:
                this.qType = 1
                break;
            case 1:
                this.qType = 2
                break;
            case 2:
                this.qType = 3
                break;
            case 3:
                this.qType = 4
                break;
            default:
                break;
        }
    }

    //上传课件按钮
    onBtnSaveClicked() {
        DaAnData.getInstance().type = this.type
        DaAnData.getInstance().qType = this.qType
        this.loadingNode.active = true
        UIManager.getInstance().showUI(GamePanel, () => {
            ListenerManager.getInstance().trigger(ListenerType.OnEditStateSwitching, {state: 1})
        })
    }

    getNet() {
        NetWork.getInstance().httpRequest(NetWork.GET_TITLE + "?title_id=" + NetWork.titleId, "GET", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                if (Array.isArray(response.data)) {
                    this.setPanel();
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
                            if(content.type) {
                                this.type = content.type
                            }else {
                                console.error('网络请求数据type为空。') 
                            }
                            if(content.qType) {
                                this.qType = content.qType
                            }else {
                                console.error('网络请求数据qType为空。') 
                            }
                            this.setPanel();
                        } else {
                            UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                                (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(
                                    "CoursewareKey错误,请联系客服！",
                                    "", "", "确定");
                            });
                            return;
                        }
                    } else {
                        this.setPanel();
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
