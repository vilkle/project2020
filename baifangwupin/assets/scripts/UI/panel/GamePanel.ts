import { BaseUI } from "../BaseUI";
import { NetWork } from "../../Http/NetWork";
import {ConstValue} from "../../Data/ConstValue"
import { UIManager } from "../../Manager/UIManager";
import UploadAndReturnPanel from "./UploadAndReturnPanel";
import {AudioManager} from "../../Manager/AudioManager"
import {UIHelp} from "../../Utils/UIHelp";
import ErrorPanel from "./ErrorPanel";
import GameMsg from "../../Data/GameMsg";
import { GameMsgType } from "../../Data/GameMsgType";
import { Tools } from "../../UIComm/Tools";
import {ReportManager}from "../../Manager/ReportManager";
import { AnswerResult } from "../../Data/ConstValue";
import {OverTips} from "../Item/OverTips";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GamePanel extends BaseUI {

    protected static className = "GamePanel";
    @property(cc.Node)
    private roundNode1 : cc.Node = null;
    @property(cc.Node)
    private roundNode2 : cc.Node = null;
    @property(cc.Node)
    private mask : cc.Node = null;
    @property(cc.Node)
    private bg : cc.Node = null;
    @property(cc.Sprite)
    private titleSp: cc.Sprite = null
    @property(cc.Node)
    private erge: cc.Node = null
    @property(cc.Node)
    private progress: cc.Node = null
    @property(cc.Node) 
    private title: cc.Node = null
    @property(cc.Node) 
    private laba: cc.Node = null
    @property(cc.Node)
    private touchNode: cc.Node = null
    private overNum: number = 0
    private rightNum: number = 0
    private optionsArr: cc.Node[] = null
    private slotsArr: cc.Node[] = null
    private touchTarget: cc.Node = null
    private distance: cc.Vec2 = null
    private optionNode: cc.Node = null
    private slotNode: cc.Node = null
    private standardNum: number = 1
    private timeoutArr: number[] = []
    private gameResult: AnswerResult = AnswerResult.NoAnswer
    private isTitle: boolean = false
    private isPoint: boolean = false
    private isAudio: boolean = false
    private actionId: number = 0
    private isAction: boolean = false
    private isOver: boolean = false
    private isBreak: boolean = false
    private archival = {
        answerdata: null,
        level: null,
        rightNum: null,
        totalNum: null,
        standardNum: this.standardNum
    }
  
    onLoad() {
         //监听新课堂发出的消息
         this.addSDKEventListener()
         //新课堂上报
         GameMsg.getInstance().gameStart()
         //添加上报result数据
         ReportManager.getInstance().addResult(2)
         this.standardNum = 8
         ReportManager.getInstance().setStandardNum(this.standardNum)
         ReportManager.getInstance().setQuestionInfo(0, '一起动手，挑战下面的关卡吧！')
         ReportManager.getInstance().setQuestionInfo(1, '一起动手，挑战下面的关卡吧！')
        if(ConstValue.IS_TEACHER) {
            UIManager.getInstance().openUI(UploadAndReturnPanel, 212)
        }else {
            this.getNet()
        }
        this.title.on(cc.Node.EventType.TOUCH_START, this.audioCallback, this)
        this.laba.on(cc.Node.EventType.TOUCH_START, this.audioCallback, this)
        this.erge.on(cc.Node.EventType.TOUCH_START, ()=>{
            let level = ReportManager.getInstance().getLevel()
            this.playAudio(level, this.rightNum)
        } )
    }

    start() {
        this.round1()
        
    }

    round1() {
        this.rightNum = 0
        this.roundNode1.active = true
        this.roundNode2.active = false
        this.progress.getChildByName('p1').active = true
        this.progress.getChildByName('p2').active = false
        this.slotNode = this.roundNode1.getChildByName('slots')
        this.optionNode = this.roundNode1.getChildByName('options')
        this.optionsArr = this.optionNode.children
        this.addListenerOnOptions(this.optionsArr)
        this.slotsArr = this.slotNode.children
        this.mask.active = true
        AudioManager.getInstance().playSound('听语音把物品放到合适的位置', false, 1, null, ()=>{
            AudioManager.getInstance().playSound('小黄鸭在池塘的里边', false, 1, null, ()=>{
                this.mask.active = false
            })  
        })
    }

    round2() {
        this.rightNum = 0
        this.roundNode1.active = false
        this.roundNode2.active = true
        this.progress.getChildByName('p1').active = false
        this.progress.getChildByName('p2').active = true
        this.slotNode = this.roundNode2.getChildByName('slots')
        this.optionNode = this.roundNode2.getChildByName('options')
        this.optionsArr = this.optionNode.children
        this.addListenerOnOptions(this.optionsArr)
        this.slotsArr = this.slotNode.children
        this.mask.active = true
        AudioManager.getInstance().playSound('听语音把物品放到合适的位置', false, 1, null, ()=>{
            AudioManager.getInstance().playSound('电话在台灯的右边', false, 1, null, ()=>{
                this.mask.active = false
            })  
        })
    }

    actionStart(nodeIndex: number, pos: cc.Vec2) {
        let node = this.optionsArr[nodeIndex]
        if(!this.startRight(nodeIndex)) {
            // let wrong = node.getChildByName('wrong')
            // wrong.active = true
            // let fi = cc.fadeIn(0.3)
            // let fo = cc.fadeOut(0.3)
            // wrong.stopAllActions()
            // wrong.runAction(cc.sequence(fi, fo, fi, fo, fi, fo, cc.callFunc(()=>{wrong.active = false})))
            return
        }
        node.opacity = 0
        this.touchNode.active = true
        this.touchNode.setPosition(pos)
        this.touchNode.getChildByName('sp').getComponent(cc.Sprite).spriteFrame = node.getChildByName('sp').getComponent(cc.Sprite).spriteFrame
        this.touchNode.getChildByName('box').getComponent(cc.Sprite).spriteFrame = node.getChildByName('right').getComponent(cc.Sprite).spriteFrame


    }

    actionMove(nodeIndex: number, pos: cc.Vec2, slotPos: cc.Vec2) {
        this.touchNode.setPosition(pos)
        if(!this.touchNode.active) {
            return
        }
        for(let n = 0; n < this.slotsArr.length; ++n) {
            let slot = this.slotsArr[n]
            if(slot.getBoundingBox().contains(slotPos)) {
                slot.getChildByName('box').active = true
                for(let j = 0; j < this.slotsArr.length; ++j) {
                    if(j != n) {
                        this.slotsArr[j].getChildByName('box').active = false
                    }
                }
            }else {
                this.overNum++
            }
            if(n == this.slotsArr.length-1) {
                if(this.overNum == this.slotsArr.length) {
                    for(let m = 0; m < this.slotsArr.length; ++m) {
                        this.slotsArr[m].getChildByName('box').active = false
                    }
                }
                this.overNum = 0
            }
        }
        
    }

    actionEnd(nodeIndex: number, slotPos: cc.Vec2, optionPos: cc.Vec2) {
        for(let n = 0; n < this.slotsArr.length; ++n) {
            let slot = this.slotsArr[n]
            if(slot.getBoundingBox().contains(slotPos)) {
                if(this.EndRight(nodeIndex ,n)) {
                    ReportManager.getInstance().answerRight()
                    this.rightNum++
                    let level = ReportManager.getInstance().getLevel()
                    this.mask.active = true
                    AudioManager.getInstance().playSound('right', false, 1, null, ()=>{
                        this.playAudio(level, this.rightNum)
                    })
                    slot.getChildByName('box').active = false
                    slot.getChildByName('sp').active = true
                    for(let m = 0; m < this.slotsArr.length; ++m) {
                        this.slotsArr[m].getChildByName('box').active = false
                    }
                    this.touchNode.active = false
                    if(this.rightNum == 4) {
                        let level = ReportManager.getInstance().getLevel()
                        if(level == 1) {
                            ReportManager.getInstance().levelEnd(AnswerResult.AnswerRight)
                            let id = setTimeout(() => {
                                this.round2()
                                clearTimeout(id)
                                let index = this.timeoutArr.indexOf(id)
                                this.timeoutArr.splice(index, 1)
                            }, 2000);
                            this.timeoutArr[this.timeoutArr.length] = id
                        }else if(level == 2) {
                            this.isOver = true
                            ReportManager.getInstance().gameOver(AnswerResult.AnswerRight)
                            if(!this.isAction) {
                                GameMsg.getInstance().gameOver(ReportManager.getInstance().getAnswerData())
                            }
                            let id = setTimeout(() => {
                                UIHelp.showOverTip(2, '','',null,null,'闯关成功')
                                clearTimeout(id)
                                let index = this.timeoutArr.indexOf(id)
                                this.timeoutArr.splice(index, 1)
                            }, 2000);
                            this.timeoutArr[this.timeoutArr.length] = id
                        }   
                    }
                    return
                }
            }
        }
        let node = this.optionsArr[nodeIndex]
        if(!node.getBoundingBox().contains(optionPos) && this.touchNode.active) {
            let wrong = node.getChildByName('wrong')
            wrong.active = true
            let fi = cc.fadeIn(0.2)
            let fo = cc.fadeOut(0.3)
            wrong.stopAllActions()
            ReportManager.getInstance().answerWrong()
            AudioManager.getInstance().playSound('wrong', false)
            wrong.runAction(cc.sequence(fo, fi, fo, fi, fo, fi, fo, cc.callFunc(()=>{wrong.active = false})))
        }
        this.touchNode.active = false
        node.opacity = 255
        for(let m = 0; m < this.slotsArr.length; ++m) {
            this.slotsArr[m].getChildByName('box').active = false
        }
    }

    addListenerOnOptions(optionsArr: cc.Node[]) {
        for(let i = 0; i < optionsArr.length; ++i) {
            let node = optionsArr[i]
            node.on(cc.Node.EventType.TOUCH_START, (e)=>{
                if(node.opacity == 0 || this.touchTarget) {
                    return
                }
                this.touchTarget = e.target
                
                let pos = node.position
                this.distance = node.convertToNodeSpaceAR(e.currentTouch._point)
                this.gameResult = AnswerResult.AnswerHalf
                if(!ReportManager.getInstance().isStart()) {
                    ReportManager.getInstance().levelStart(this.isBreak)
                }
                ReportManager.getInstance().touchStart()
                ReportManager.getInstance().setAnswerNum(1)
    
                if(!this.isAction) {
                    GameMsg.getInstance().actionSynchro({type: 1, pos: pos, nodeIndex: i})
                }
                this.actionStart(i, pos)
            })
            node.on(cc.Node.EventType.TOUCH_MOVE, (e)=>{
                if(this.touchTarget != e.target || !this.touchNode.active) {
                    return
                }
                let pos = this.node.convertToNodeSpaceAR(e.currentTouch._point) 
                let realPos = cc.v2(pos.x - this.distance.x, pos.y - this.distance.y)
                let slotPos = this.slotNode.convertToNodeSpaceAR(e.currentTouch._point)
                if(!this.isAction) {
                    GameMsg.getInstance().actionSynchro({type:2, pos: pos, nodeIndex: i, soltPos: slotPos})
                }
                this.actionMove(i, realPos, slotPos)
            })
            node.on(cc.Node.EventType.TOUCH_END, (e)=>{
                if(this.touchTarget != e.target || !this.touchNode.active) {
                    return
                }
                let slotPos = this.slotNode.convertToNodeSpaceAR(e.currentTouch._point)
                let optionPos = this.optionNode.convertToNodeSpaceAR(e.currentTouch._point)
                this.touchTarget = null
                if(!this.isAction) {
                    GameMsg.getInstance().actionSynchro({type: 3, nodeIndex: i, soltPos: slotPos, optionPos: optionPos})
                    this.actionId++
                    this.archival.answerdata = ReportManager.getInstance().getAnswerData()
                    this.archival.level = ReportManager.getInstance().getLevel()
                    this.archival.rightNum = ReportManager.getInstance().getRightNum()
                    this.archival.totalNum = ReportManager.getInstance().getTotalNum()
                    GameMsg.getInstance().dataArchival(this.actionId ,this.archival)
                }
                this.actionEnd(i, slotPos, optionPos)
            })
            node.on(cc.Node.EventType.TOUCH_CANCEL, (e)=>{
                if(this.touchTarget != e.target) {
                    return
                }
                let slotPos = this.slotNode.convertToNodeSpaceAR(e.currentTouch._point)
                let optionPos = this.optionNode.convertToNodeSpaceAR(e.currentTouch._point)
                this.touchTarget = null
                if(!this.isAction) {
                    GameMsg.getInstance().actionSynchro({type: 3, nodeIndex: i, soltPos: slotPos, optionPos: optionPos})
                    this.actionId++
                    this.archival.answerdata = ReportManager.getInstance().getAnswerData()
                    this.archival.level = ReportManager.getInstance().getLevel()
                    this.archival.rightNum = ReportManager.getInstance().getRightNum()
                    this.archival.totalNum = ReportManager.getInstance().getTotalNum()
                    GameMsg.getInstance().dataArchival(this.actionId ,this.archival)
                }
                this.actionEnd(i, slotPos, optionPos)
            }) 
        }   
    }

    removeListenerOnOptions(optionsArr: cc.Node[]) {
        for(let i = 0; i < optionsArr.length; ++i) {
            let node = optionsArr[i]
            node.off(cc.Node.EventType.TOUCH_START)
            node.off(cc.Node.EventType.TOUCH_MOVE)
            node.off(cc.Node.EventType.TOUCH_END)
            node.off(cc.Node.EventType.TOUCH_CANCEL)
        }
    }

    startRight(optionIndex: number):boolean {
        if(optionIndex == this.rightNum) {
            return true
        }else {
            return false
        }   
    }

    EndRight(optionIndex: number, slotIndex: number) {
        if(optionIndex == slotIndex) {
            return true
        }else {
            return false
        }
    }

    success() {
        UIHelp.showOverTip(2,'', '', null, null, '闯关成功')
    }

    playAudio(level: number, rightNum: number) {
        console.log('--------------mei you jin qu', this.isPoint, rightNum)
        if(this.isPoint || rightNum > 3) {
            return
        }
        console.log('-----------level', level)
        console.log('-----------rightNum', rightNum)
        //点击人物算作游戏开始
        this.gameResult = AnswerResult.AnswerHalf
        if (!ReportManager.getInstance().isStart()) {
            ReportManager.getInstance().levelStart(false)
        }
        ReportManager.getInstance().touchStart()
        ReportManager.getInstance().answerHalf()
        ReportManager.getInstance().setAnswerNum(1)

        this.isPoint = true
        this.mask.active = true
        if(level == 1) {
            if(rightNum == 0) {
                AudioManager.getInstance().playSound('小黄鸭在池塘的里边', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 1) {
                AudioManager.getInstance().playSound('足球在滑梯的下面', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 2) {
                AudioManager.getInstance().playSound('小男孩在右边的跷跷板上', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 3) {
                AudioManager.getInstance().playSound('小女孩在左边的秋千上', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }
        }else if(level == 2) {
            if(rightNum == 0) {
                AudioManager.getInstance().playSound('电话在台灯的右边', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 1) {
                AudioManager.getInstance().playSound('皮球在左侧桌子的下面', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 2) {
                AudioManager.getInstance().playSound('书的上面是时钟', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 3) {
                AudioManager.getInstance().playSound('枕头的左边是小熊', false, 1, null, ()=>{
                    this.isPoint = false
                    this.mask.active = false
                })
            }
        }
    }

    onDestroy() {

    }

    onShow() {
    }

    setPanel() {

    }

    private onInit() {
        this.actionId = 0
        this.archival.answerdata = null
        this.archival.rightNum = null
        this.archival.totalNum = null
        this.isOver = false
        ReportManager.getInstance().answerReset()
        UIManager.getInstance().closeUI(OverTips)
        this.mask.active = true
      
    }

    private onRecovery(data: any) {
       
        this.isOver = false
        let answerdata = data.answerdata
        let level = data.level
        let rightNum = data.rightNum
        let totalNum = data.totalNum
        ReportManager.getInstance().setLevel(level)
        ReportManager.getInstance().setAnswerData(answerdata)
        ReportManager.getInstance().setRightNum(rightNum)
        ReportManager.getInstance().setTotalNum(totalNum)
       
    }

    audioCallback() {
        this.gameResult = AnswerResult.AnswerHalf
        if (!ReportManager.getInstance().isStart()) {
            ReportManager.getInstance().levelStart(false)
        }
        ReportManager.getInstance().touchStart()
        ReportManager.getInstance().answerHalf()
        ReportManager.getInstance().setAnswerNum(1)
        //GameMsg.getInstance().actionSynchro([-1, -1])
        this.mask.active = true
        if(this.isAudio) {
            return
        }
        this.isAudio = true
        let spine = this.laba.getChildByName('spine').getComponent(sp.Skeleton)
        spine.setAnimation(0, 'click', false)
        spine.setCompleteListener(trackEntry=>{
            if(trackEntry.animation.name == 'click') {
                spine.setAnimation(0, 'speak', true)
            }
        })
        AudioManager.getInstance().stopAll()
        AudioManager.getInstance().playSound('听语音把物品放到合适的位置', false, 1, null, () => {
            this.mask.active = false
            this.isAudio = false
            spine.setAnimation(0, 'null', true)
        })
    }

    addSDKEventListener() {
        //GameMsg.getInstance().addEvent(GameMsgType.ACTION_SYNC_RECEIVE, this.onSDKMsgActionReceived.bind(this));
        GameMsg.getInstance().addEvent(GameMsgType.DISABLED, this.onSDKMsgDisabledReceived.bind(this));
        //GameMsg.getInstance().addEvent(GameMsgType.DATA_RECOVERY, this.onSDKMsgRecoveryReceived.bind(this));
        GameMsg.getInstance().addEvent(GameMsgType.STOP, this.onSDKMsgStopReceived.bind(this));
        GameMsg.getInstance().addEvent(GameMsgType.INIT, this.onSDKMsgInitReceived.bind(this));
    }

     //动作同步消息监听
     onSDKMsgActionReceived(data: any) {
        this.isAction = true
        data = eval(data).action
        if (data.type == 1) {
            let pos = data.pos
            let node = data.nodeIndex
            this.actionStart(node, pos)
        }else if(data.type == 2) {
            let pos = data.pos
            let node = data.nodeIndex
            let slotPos = data.slotPos
            this.actionMove(node, pos, slotPos)
        }else if(data.type == 3) {
            let node = data.nodeIndex
            let slotPos = data.slotPos
            let optionPos = data.optionPos
            this.actionEnd(node, slotPos, optionPos)
        }else if(data.type == 4) {
            
        }else if(data.type == 5) {
            
        }else if(data.type == 6) {
            
        }else if(data.type == 7) {
            
        }
    }
    //禁用消息监听
    onSDKMsgDisabledReceived() {
        //交互游戏暂不处理此消息
    }
    //数据恢复消息监听
    onSDKMsgRecoveryReceived(data: any) {
        data = eval(data)
        this.onRecovery(data.data);
    }
    //游戏结束消息监听
    onSDKMsgStopReceived() {
        if (!this.isOver) {
            if (!ReportManager.getInstance().isStart()) {
                ReportManager.getInstance().addLevel()
            }
            ReportManager.getInstance().gameOver(this.gameResult)
            //新课堂上报
            GameMsg.getInstance().gameOver(ReportManager.getInstance().getAnswerData());
        }

        GameMsg.getInstance().finished();
    }
    //初始化消息监听
    onSDKMsgInitReceived() {
        this.onInit();
    }

    getNet() {
        NetWork.getInstance().httpRequest(NetWork.GET_QUESTION + "?courseware_id=" + NetWork.coursewareId, "GET", "application/json;charset=utf-8", function (err, response) {
            console.log("消息返回" + response);
            if (!err) {
                if (Array.isArray(response.data)) {
                    // callback()
                    UIManager.getInstance().openUI(ErrorPanel, 1000, () => {
                        (UIManager.getInstance().getUI(ErrorPanel) as ErrorPanel).setPanel(
                            "CoursewareKey错误,请联系客服！",
                            "", "", "确定");
                    });
                    return;
                }
                let content = JSON.parse(response.data.courseware_content);
                if (content != null) {
                    if (content.CoursewareKey == ConstValue.CoursewareKey) {
                        // cc.log("拉取到数据：")
                        // cc.log(content);
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
        }.bind(this), null);
    }
}
