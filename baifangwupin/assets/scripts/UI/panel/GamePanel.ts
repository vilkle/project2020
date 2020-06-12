import { BaseUI } from "../BaseUI";
import { NetWork } from "../../Http/NetWork";
import {ConstValue} from "../../Data/ConstValue";
import { UIManager } from "../../Manager/UIManager";
import UploadAndReturnPanel from "./UploadAndReturnPanel";
import {AudioManager} from "../../Manager/AudioManager";
import {UIHelp} from "../../Utils/UIHelp";
import ErrorPanel from "./ErrorPanel";
import GameMsg from "../../Data/GameMsg";
import { GameMsgType } from "../../Data/GameMsgType";
import { Tools } from "../../UIComm/Tools";
import {ReportManager}from "../../Manager/ReportManager";
import { AnswerResult } from "../../Data/ConstValue";
import {OverTips} from "../Item/OverTips";
import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GamePanel extends BaseUI {

    protected static className = "GamePanel";
    @property(cc.Node) private roundNode1 : cc.Node = null;
    @property(cc.Node) private roundNode2 : cc.Node = null;
    @property(cc.Node) private mask : cc.Node = null;
    @property(cc.Node) private bg : cc.Node = null;
    @property(cc.Sprite) private titleSp: cc.Sprite = null
    @property(sp.Skeleton) private erge: sp.Skeleton = null
    @property(sp.Skeleton) private wave: sp.Skeleton = null
    @property(cc.Node) private progress: cc.Node = null
    @property(cc.Node) private title: cc.Node = null
    @property(cc.Node) private laba: cc.Node = null
    @property(cc.Node) private touchNode: cc.Node = null
    @property(cc.SpriteFrame) private q1: cc.SpriteFrame = null
    @property(cc.SpriteFrame) private q2: cc.SpriteFrame = null
    @property(cc.SpriteFrame) private q3: cc.SpriteFrame = null
    @property(cc.SpriteFrame) private q4: cc.SpriteFrame = null
    @property(cc.SpriteFrame) private q5: cc.SpriteFrame = null
    @property(cc.SpriteFrame) private q6: cc.SpriteFrame = null
    @property(cc.SpriteFrame) private q7: cc.SpriteFrame = null
    @property(cc.SpriteFrame) private q8: cc.SpriteFrame = null
    @property(cc.Node) private bubble: cc.Node = null
    private level: number = null
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
            ListenerManager.getInstance().trigger(ListenerType.CloseLoading)
            UIManager.getInstance().openUI(UploadAndReturnPanel, 212)
        }else {
            this.getNet()
        }
        this.title.on(cc.Node.EventType.TOUCH_START, this.audioCallback, this)
        this.laba.on(cc.Node.EventType.TOUCH_START, this.audioCallback, this)
        this.erge.node.on(cc.Node.EventType.TOUCH_START, ()=>{
            this.playAudio(this.level, this.rightNum)
        })
        this.bubble.on(cc.Node.EventType.TOUCH_START, ()=>{
            this.playAudio(this.level, this.rightNum)
        })
    }

    start() {
        this.erge.setAnimation(0, 'gulu_idle', true)
        AudioManager.getInstance().playSound('bgm', true)
        AudioManager.getInstance().playSound('ruchang', false)
        this.round1()   
    }

    round1() {
        this.level = 1
        this.rightNum = 0
        this.bubble.getComponent(cc.Sprite).spriteFrame = this.q1
        this.updateBubble()
        this.roundNode1.active = true
        this.roundNode2.active = false
        this.progress.getChildByName('p1').active = true
        this.progress.getChildByName('p2').active = false
        this.progress.getChildByName('p3').active = false
        this.slotNode = this.roundNode1.getChildByName('slots')
        this.optionNode = this.roundNode1.getChildByName('options')
        this.optionsArr = this.optionNode.children
        this.addListenerOnOptions(this.optionsArr)
        this.slotsArr = this.slotNode.children
        this.mask.active = true
        this.title.setScale(0,0)
        this.title.runAction(cc.scaleTo(0.3, 1, 1))
        let spine = this.laba.getChildByName('spine').getComponent(sp.Skeleton)
        spine.setAnimation(0, 'click', false)
        spine.setCompleteListener(trackEntry=>{
            if(trackEntry.animation.name == 'click') {
                spine.setAnimation(0, 'speak', true)
            }
        })
        AudioManager.getInstance().playSound('听语音把物品放到合适的位置', false, 1, null, ()=>{
            spine.setAnimation(0, 'null', false)
            this.wave.node.active = true
            this.wave.setAnimation(0, 'animation', true)
            AudioManager.getInstance().playSound('小黄鸭在池塘的里边', false, 1, null, ()=>{
                this.wave.node.active = false
                this.mask.active = false

            })  
        })
    }

    round2() {
        this.level = 2
        this.rightNum = 0
        this.bubble.getComponent(cc.Sprite).spriteFrame = this.q4
        this.roundNode1.active = false
        this.roundNode2.active = true
        this.progress.getChildByName('p1').active = false
        this.progress.getChildByName('p2').active = true
        this.progress.getChildByName('p3').active = false
        this.slotNode = this.roundNode2.getChildByName('slots')
        this.optionNode = this.roundNode2.getChildByName('options')
        this.optionsArr = this.optionNode.children
        this.addListenerOnOptions(this.optionsArr)
        this.slotsArr = this.slotNode.children
        this.mask.active = true
        this.title.setScale(0,0)
        this.title.runAction(cc.scaleTo(0.3, 1, 1))
        let spine = this.laba.getChildByName('spine').getComponent(sp.Skeleton)
        spine.setAnimation(0, 'click', false)
        spine.setCompleteListener(trackEntry=>{
            if(trackEntry.animation.name == 'click') {
                spine.setAnimation(0, 'speak', true)
            }
        })
        AudioManager.getInstance().playSound('听语音把物品放到合适的位置', false, 1, null, ()=>{
            spine.setAnimation(0, 'null', false)
            this.wave.node.active = true
            this.wave.setAnimation(0, 'animation', true)
            AudioManager.getInstance().playSound('电话在台灯的右边', false, 1, null, ()=>{
                this.wave.node.active = false
                this.mask.active = false
            })  
        })
    }

    actionStart(nodeIndex: number, pos: cc.Vec2) {
        AudioManager.getInstance().playSound('click', false)
        let node = this.optionsArr[nodeIndex]
        if(!this.startRight(nodeIndex)) {
            // let wrong = node.getChildByName('wrong')
            // wrong.active = true
            // let fi = cc.fadeIn(0.3)
            // let fo = cc.fadeOut(0.3)
            // wrong.stopAllActions()
            // wrong.runAction(cc.sequence(fi, fo, fi, fo, fi, fo, cc.callFunc(()=>{wrong.active = false})))
            this.touchTarget = null
            return
        }
        node.opacity = 0
        this.touchNode.active = true
        this.touchNode.setPosition(pos)
        this.touchNode.getChildByName('sp').getComponent(cc.Sprite).spriteFrame = node.getChildByName('sp').getComponent(cc.Sprite).spriteFrame
        this.touchNode.getChildByName('box').getComponent(cc.Sprite).spriteFrame = node.getChildByName('right').getComponent(cc.Sprite).spriteFrame
        this.touchNode.getChildByName('wrong').getComponent(cc.Sprite).spriteFrame = node.getChildByName('wrong').getComponent(cc.Sprite).spriteFrame
        this.touchNode.getChildByName('wrong').active = false
    }

    actionMove(nodeIndex: number, pos: cc.Vec2, slotPos: cc.Vec2) {
        this.touchNode.setPosition(pos)
        if(!this.touchNode.active) {
            return
        }
        for(let n = 0; n < this.slotsArr.length; ++n) {
            let slot = this.slotsArr[n]
            if(slot.getBoundingBox().contains(slotPos) && !slot.getChildByName('sp').active) {
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
                    this.gameResult = AnswerResult.AnswerRight
                    this.rightNum++
                    let level = ReportManager.getInstance().getLevel()
                    this.mask.active = true
                    this.erge.setAnimation(0, 'gulu_correct', false)
                    this.erge.setCompleteListener(trackEntry=>{
                        if(trackEntry.animation.name == 'gulu_correct') {
                            this.erge.setAnimation(0, 'gulu_idle', true)
                        }
                    })
                    AudioManager.getInstance().playSound('lanxingka',false)
                    AudioManager.getInstance().playSound('right0', false)
                    this.playAction(level, this.rightNum, ()=>{
                        this.updateBubble()
                        this.playAudio(level, this.rightNum)
                    })
                    // slot.getChildByName('box').active = false
                    // slot.getChildByName('sp').active = true
                    for(let m = 0; m < this.slotsArr.length; ++m) {
                        this.slotsArr[m].getChildByName('box').active = false
                    }
                    this.touchNode.active = false
                    if(this.rightNum == 4) {
                        ReportManager.getInstance().answerRight()
                        let level = ReportManager.getInstance().getLevel()
                        if(level == 1) {
                            ReportManager.getInstance().levelEnd(AnswerResult.AnswerRight)
                            let id = setTimeout(() => {
                                this.round2()
                                clearTimeout(id)
                                let index = this.timeoutArr.indexOf(id)
                                this.timeoutArr.splice(index, 1)
                            }, 4000);
                            this.timeoutArr[this.timeoutArr.length] = id
                        }else if(level == 2) {
                            this.progress.getChildByName('p1').active = false
                            this.progress.getChildByName('p2').active = false
                            this.progress.getChildByName('p3').active = true
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
                    }else{
                        ReportManager.getInstance().answerHalf()
                    }
                    return
                }
            }
        }
        let node = this.optionsArr[nodeIndex]
        if(!node.getBoundingBox().contains(optionPos) && this.touchNode.active) {
            this.erge.setAnimation(0, 'gulu_false', false)
            this.erge.setCompleteListener(trackEntry=>{
                if(trackEntry.animation.name == 'gulu_false') {
                    this.erge.setAnimation(0, 'gulu_idle', true)
                }
            })
            let wrong = this.touchNode.getChildByName('wrong')
            let pos = node.position
            wrong.active = true
            let shake1 = cc.moveBy(0.05, cc.v2(30, 0))
            let shake2 = cc.moveBy(0.05, cc.v2(-30, 0))
            let back = cc.moveTo(0.2, pos)
            let fun = cc.callFunc(()=>{
                node.opacity = 255
                this.touchNode.active = false
            })
            let seq = cc.sequence(shake1, shake2, shake1, shake2, shake1, shake2, back, fun)
            this.mask.active = true
            AudioManager.getInstance().playSound('不是这里', false, 1, null, ()=>{
                this.playAudio(this.level, this.rightNum)
            })
            AudioManager.getInstance().playSound('wrong0', false)
            this.touchNode.stopAllActions()
            this.touchNode.runAction(seq)
            this.gameResult = AnswerResult.AnswerError
            ReportManager.getInstance().answerWrong()
        }else {
            let pos = node.position
            let back = cc.moveTo(0.2, pos)
            let fun = cc.callFunc(()=>{
                this.touchNode.active = false
                node.opacity = 255
            })
            let seq = cc.sequence(back, fun)
            this.touchNode.stopAllActions()
            this.touchNode.runAction(seq)
        }
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
                //this.gameResult = AnswerResult.NoAnswer
                if(!ReportManager.getInstance().isStart()) {
                    ReportManager.getInstance().levelStart(this.isBreak)
                }
                ReportManager.getInstance().touchStart()
                ReportManager.getInstance().setAnswerNum(1)
    
                // if(!this.isAction) {
                //     GameMsg.getInstance().actionSynchro({type: 1, pos: pos, nodeIndex: i})
                // }
                this.actionStart(i, pos)
            })
            node.on(cc.Node.EventType.TOUCH_MOVE, (e)=>{
                if(this.touchTarget != e.target || !this.touchNode.active) {
                    return
                }
                let pos = this.node.convertToNodeSpaceAR(e.currentTouch._point) 
                let realPos = cc.v2(pos.x - this.distance.x, pos.y - this.distance.y)
                let slotPos = this.slotNode.convertToNodeSpaceAR(e.currentTouch._point)
                // if(!this.isAction) {
                //     GameMsg.getInstance().actionSynchro({type:2, pos: pos, nodeIndex: i, soltPos: slotPos})
                // }
                this.actionMove(i, realPos, slotPos)
            })
            node.on(cc.Node.EventType.TOUCH_END, (e)=>{
                if(this.touchTarget != e.target || !this.touchNode.active) {
                    return
                }
                let slotPos = this.slotNode.convertToNodeSpaceAR(e.currentTouch._point)
                let optionPos = this.optionNode.convertToNodeSpaceAR(e.currentTouch._point)
                this.touchTarget = null
                // if(!this.isAction) {
                //     GameMsg.getInstance().actionSynchro({type: 3, nodeIndex: i, soltPos: slotPos, optionPos: optionPos})
                //     this.actionId++
                //     this.archival.answerdata = ReportManager.getInstance().getAnswerData()
                //     this.archival.level = ReportManager.getInstance().getLevel()
                //     this.archival.rightNum = ReportManager.getInstance().getRightNum()
                //     this.archival.totalNum = ReportManager.getInstance().getTotalNum()
                //     GameMsg.getInstance().dataArchival(this.actionId ,this.archival)
                // }
                this.actionEnd(i, slotPos, optionPos)
            })
            node.on(cc.Node.EventType.TOUCH_CANCEL, (e)=>{
                if(this.touchTarget != e.target) {
                    return
                }
                let slotPos = this.slotNode.convertToNodeSpaceAR(e.currentTouch._point)
                let optionPos = this.optionNode.convertToNodeSpaceAR(e.currentTouch._point)
                this.touchTarget = null
                // if(!this.isAction) {
                //     GameMsg.getInstance().actionSynchro({type: 3, nodeIndex: i, soltPos: slotPos, optionPos: optionPos})
                //     this.actionId++
                //     this.archival.answerdata = ReportManager.getInstance().getAnswerData()
                //     this.archival.level = ReportManager.getInstance().getLevel()
                //     this.archival.rightNum = ReportManager.getInstance().getRightNum()
                //     this.archival.totalNum = ReportManager.getInstance().getTotalNum()
                //     GameMsg.getInstance().dataArchival(this.actionId ,this.archival)
                // }
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

    playAction(level: number, rightNum: number, callback: any) {
        rightNum = rightNum - 1
        let slot = this.slotsArr[rightNum]
        let spd = slot.getChildByName('sp')
        let black = slot.getChildByName('black')
        let light = slot.getChildByName('light')
        spd.active = true
        light.active = true
        black.active = true
        let num = 0
        light.getComponent(sp.Skeleton).setAnimation(0, 'right', true)
        light.getComponent(sp.Skeleton).setCompleteListener(trackEntry=>{
            if(trackEntry.animation.name == 'right') {
                num++
                if(num == 2) {
                    light.active = false
                    black.active = false
                    callback()
                }
            }
        })
        let scale0 = spd.scaleX
        let scale1 = spd.scaleX - 0.2
        let scale2 = spd.scaleX + 0.1
        if(level == 1) {
            if(rightNum == 0 || rightNum == 2 || rightNum == 3) {
                spd.getComponent(sp.Skeleton).setAnimation(0, 'animation', false)
            }else {
                spd.setScale(scale1, scale1)
                spd.stopAllActions()
                spd.runAction(cc.sequence(cc.scaleTo(0.2, scale2, scale2), cc.scaleTo(0.2, scale0,scale0)))
            }
        }else {
            spd.setScale(scale1, scale1)
            spd.stopAllActions()
            spd.runAction(cc.sequence(cc.scaleTo(0.2, scale2, scale2), cc.scaleTo(0.2, scale0,scale0)))
        }
    }
          
    playAudio(level: number, rightNum: number) {
        if(this.isPoint || rightNum > 3) {
            return
        }
        //点击人物算作游戏开始
        //this.gameResult = AnswerResult.NoAnswer
        if (!ReportManager.getInstance().isStart()) {
            ReportManager.getInstance().levelStart(false)
        }
        ReportManager.getInstance().touchStart()
        ReportManager.getInstance().setAnswerNum(1)
        ReportManager.getInstance().touchHalf()
        this.isPoint = true
        this.mask.active = true
        this.wave.node.active = true
        this.wave.setAnimation(0, 'animation', true)
        if(level == 1) {
            if(rightNum == 0) {
                AudioManager.getInstance().playSound('小黄鸭在池塘的里边', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 1) {
                AudioManager.getInstance().playSound('足球在滑梯的下面', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 2) {
                AudioManager.getInstance().playSound('小男孩在右边的跷跷板上', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 3) {
                AudioManager.getInstance().playSound('小女孩在左边的秋千上', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }
        }else if(level == 2) {
            if(rightNum == 0) {
                AudioManager.getInstance().playSound('电话在台灯的右边', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 1) {
                AudioManager.getInstance().playSound('皮球在左侧桌子的下面', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 2) {
                AudioManager.getInstance().playSound('书的上面是时钟', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }else if(rightNum == 3) {
                AudioManager.getInstance().playSound('枕头的左边是小熊', false, 1, null, ()=>{
                    this.wave.node.active = false
                    this.isPoint = false
                    this.mask.active = false
                })
            }
        }
    }

    updateBubble() {
        if(this.level == 1) {
            if(this.rightNum == 0) {
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q1
            }else if(this.rightNum == 1) {
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q3
            }else if(this.rightNum == 2) {
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q5
            }else if(this.rightNum == 3){
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q7
            }
        }else if(this.level == 2) {
            if(this.rightNum == 0) {
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q4
            }else if(this.rightNum == 1) {
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q6
            }else if(this.rightNum == 2) {
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q8
            }else if(this.rightNum == 3){
                this.bubble.getComponent(cc.Sprite).spriteFrame = this.q2
            }
        }
    }

    onDestroy() {

    }

    onShow() {
    }

    setPanel() {

    }

    reset() {
        let optionArr1 = this.roundNode1.getChildByName('options').children
        let slotArr1 = this.roundNode1.getChildByName('slots').children
        let optionArr2 = this.roundNode2.getChildByName('options').children
        let slotArr2 = this.roundNode2.getChildByName('slots').children
        for(let i = 0; i < optionArr1.length; ++i) {
           optionArr1[i].getChildByName('shadow').active = true
           optionArr1[i].getChildByName('sp').active = true
           optionArr1[i].getChildByName('right').active = false
           optionArr1[i].getChildByName('wrong').active = false
        }
        for(let i = 0; i < slotArr1.length; ++i) {
            slotArr1[i].getChildByName('black').active = false
            slotArr1[i].getChildByName('box').active = false
            slotArr1[i].getChildByName('light').active = false
            slotArr1[i].getChildByName('sp').active = false
        }
        for(let i = 0; i < optionArr2.length; ++i) {
            optionArr2[i].getChildByName('shadow').active = true
            optionArr2[i].getChildByName('sp').active = true
            optionArr2[i].getChildByName('right').active = false
            optionArr2[i].getChildByName('wrong').active = false
         }
         for(let i = 0; i < slotArr2.length; ++i) {
             slotArr2[i].getChildByName('black').active = false
             slotArr2[i].getChildByName('box').active = false
             slotArr2[i].getChildByName('light').active = false
             slotArr2[i].getChildByName('sp').active = false
         }
    }

    private onInit() {
        this.actionId = 0
        this.archival.answerdata = null
        this.archival.rightNum = null
        this.archival.totalNum = null
        this.isOver = false
        this.isBreak = false
        this.isAction = false
        this.gameResult = AnswerResult.NoAnswer
        ReportManager.getInstance().answerReset()
        UIManager.getInstance().closeUI(OverTips)
        this.mask.active = true
        this.rightNum = 0
        this.reset()
        AudioManager.getInstance().stopAll()
        AudioManager.getInstance().playSound('bgm', true)
        AudioManager.getInstance().playSound('ruchang', false)
        this.round1()
    }

    private onRecovery(data: any) {
        this.isOver = false
        this.isBreak = true
        this.isAction = false
        this.gameResult = AnswerResult.NoAnswer
        let answerdata = data.answerdata
        let level = data.level
        let rightNum = data.rightNum
        let totalNum = data.totalNum
        ReportManager.getInstance().setLevel(level)
        ReportManager.getInstance().setAnswerData(answerdata)
        ReportManager.getInstance().setRightNum(rightNum)
        ReportManager.getInstance().setTotalNum(totalNum)
        this.reset()
        let num = 0
        if(rightNum <= 4) {
            num = rightNum
        }else {
            num = rightNum - 4
        }
        this.rightNum = num
        if(level == 1) {
            this.round1()
            for(let i = 0; i < num; ++i) {
                this.slotsArr[i].getChildByName('sp').active = true
                this.optionsArr[i].opacity = 0
            }
        }else if(level == 2) {
            this.round2()
            for(let i = 0; i < num; ++i) {
                this.slotsArr[i].getChildByName('sp').active = true
                this.optionsArr[i].opacity = 0
            }
        }
    }

    audioCallback() {
        //this.gameResult = AnswerResult.NoAnswer
        if (!ReportManager.getInstance().isStart()) {
            ReportManager.getInstance().levelStart(false)
        }
        ReportManager.getInstance().touchHalf()
        ReportManager.getInstance().touchStart()
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
