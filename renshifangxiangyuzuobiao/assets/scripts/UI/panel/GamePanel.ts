import { BaseUI } from "../BaseUI";
import { NetWork } from "../../Http/NetWork";
import DataReporting from "../../Data/DataReporting";
import {ConstValue} from "../../Data/ConstValue"
import { DaAnData } from "../../Data/DaAnData";
import {UIHelp} from "../../Utils/UIHelp";
import { UIManager } from "../../Manager/UIManager";
import UploadAndReturnPanel from "./UploadAndReturnPanel";
import { AudioManager } from "../../Manager/AudioManager";
import { ListenerManager } from "../../Manager/ListenerManager";
import { ListenerType } from "../../Data/ListenerType";
import ErrorPanel from "./ErrorPanel";
import {ReportManager}from "../../Manager/ReportManager";
import GameMsg from "../../Data/GameMsg";
import { GameMsgType } from "../../Data/GameMsgType";
import { AnswerResult } from "../../Data/ConstValue";
import {OverTips} from "../Item/OverTips";
const { ccclass, property } = cc._decorator;

@ccclass
export default class GamePanel extends BaseUI {

    protected static className = "GamePanel";
    @property(cc.Node)
    private fruitNode : cc.Node = null;
    @property(cc.Node)
    private vegetableNode : cc.Node = null;
    @property(cc.Node)
    private directionNode : cc.Node = null;
    @property(cc.Node)
    private touchSprite : cc.Node = null;
    @property(cc.Node)
    private duckNode : cc.Node = null;
    @property(cc.Node)
    private touchSpine : cc.Node = null;
    @property(cc.Node)
    private fruitBubble: cc.Node = null;
    @property(cc.Node)
    private vegetableBubble: cc.Node = null;
    @property(cc.Node)
    private fruitHand: cc.Node = null;
    @property(cc.Node)
    private vegetableHand: cc.Node = null;
    private title: cc.Node = null
    private titleLabel: cc.Label = null
    private shadowArr: cc.Node[] = null
    private bg : cc.Node = null;
    private touchNode : cc.Node = null;
    private parentNode : cc.Node = null;
    private tuopanNode : cc.Node = null;
    private gridNode : cc.Node = null;
    private types : number = 0;
    private head: string = '';
    private answerArr : number[] = [];
    private answerArr1 : number[] = [];
    private answerArr2 : number[] = [];
    private touchTarget : any = null;
    private touchRight : boolean = false;
    private overNum : number = 0;
    private rightNum : number = 0;
    private gameResult: AnswerResult = AnswerResult.NoAnswer
    private actionId: number = 0
    private isAction: boolean = false
    private isOver : boolean = false;
    private isBreak: boolean = false
    private audioIdArr: number[] = [];
    private finishing: boolean = false;
    private erroring: boolean = false;
    private timeoutId: number = null
    private standardNum: number = 8
    private archival = {
        answerType: null,
        rightArr: [],
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
         ReportManager.getInstance().addResult(1)
         ReportManager.getInstance().setQuestionInfo(0, '一起动手，挑战下面的关卡吧！')
         cc.loader.loadRes("font/FangZhengCuYuan", cc.TTFFont, null)
    }

    start() {
        if(ConstValue.IS_TEACHER) {
            UIManager.getInstance().openUI(UploadAndReturnPanel, 212);
            this.types = DaAnData.getInstance().types;
            this.head = DaAnData.getInstance().head;
            this.initGame();
        }else {
            this.getNet();
        }
    }

    onDestroy() {
        clearTimeout(this.timeoutId)
    }

    initGame() {
        if(this.types == 1) {
            this.fruitNode.active = true;
            this.parentNode = this.fruitNode;
            this.touchNode = this.touchSprite;
            this.answerArr = [1,3,5,2,8,7,6,4,0];
            this.standardNum = 8
        }else if(this.types == 2) {
            this.vegetableNode.active = true;
            this.parentNode = this.vegetableNode;
            this.touchNode = this.touchSprite;
            this.answerArr = [1,3,5,8,2,7,4,0,6];
            this.answerArr1 = [1,3,7,8,2,4,5,0,6];
            this.answerArr2 = [1,3,7,8,2,5,4,0,6];
            this.standardNum = 9
        }else if(this.types == 3) {
            this.directionNode.active = true;
            this.parentNode = this.directionNode;
            this.touchNode = this.touchSpine;
            this.answerArr = [6,6,1,5,6,4,6,6,2,0,6,6,6,6,3,6];
            this.standardNum = 6
        }
        ReportManager.getInstance().setStandardNum(this.standardNum)
        if(this.parentNode) {
            if(this.types == 1) {
                this.shadowArr = this.parentNode.getChildByName('shadowNode').children
                this.gridNode = this.parentNode.getChildByName('carNode').getChildByName('gridNode');
                this.tuopanNode = this.parentNode.getChildByName('tuopanNode');
                this.initFruit();
            }else if(this.types == 2) {
                this.shadowArr = this.parentNode.getChildByName('shadowNode').children
                this.gridNode = this.parentNode.getChildByName('carNode').getChildByName('gridNode');
                this.tuopanNode = this.parentNode.getChildByName('tuopanNode');
                this.initVegetable();
            }else if(this.types == 3) {
                this.gridNode = this.parentNode.getChildByName('leftNode').getChildByName('gridNode');
                this.tuopanNode = this.parentNode.getChildByName('rightNode').getChildByName('tuopanNode');
                this.initDirection();
            }
            this.bg = this.parentNode.getChildByName('bg');
            this.bg.on(cc.Node.EventType.TOUCH_START, (e)=>{
                if(this.rightNum == 0) {
                    if(this.types == 1) {
                        if(this.fruitHand.active) {
                            this.cueAudio(this.rightNum)
                            this.fruitHand.active = false
                        }
                    }else if(this.types == 2) {
                        if(this.vegetableHand.active) {
                            this.cueAudio(this.rightNum)
                            this.vegetableHand.active = false
                        }
                    }
                }
            });
        }
        this.addListenerOnItem();
    }

    bubbleStart(rihgtNum: number) {
        if(this.types == 1) {
            this.fruitBubble.scale = 0.98
            this.fruitHand.active = false
        }else if(this.types == 2) {
            this.vegetableBubble.scale = 0.9
            this.vegetableHand.active = false
        }
        this.cueAudio(this.rightNum)
    }

    bubbleEnd() {
        if(this.types == 1) {
            this.fruitBubble.scale = 1
        }else if(this.types == 2) {
            this.vegetableBubble.scale = 1
        }
    }

    initFruit() {
        this.title = this.parentNode.getChildByName('carNode').getChildByName('title')
        this.titleLabel = this.title.getChildByName('label').getComponent(cc.Label)
        if(this.head.length <= 15) {
            this.titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        }
        this.titleLabel.string = this.head
        AudioManager.getInstance().playSound('sfx_kpbopn', false);
        let car = this.fruitNode.getChildByName('carNode');
        for(let i = 0; i < this.tuopanNode.children.length; i++) {
            this.tuopanNode.children[i].scale = 0;
        }
        car.setPosition(cc.v2(-1250, -51));
        car.runAction(cc.moveBy(0.8, cc.v2(1250, 0)));
        let bubble = this.fruitNode.getChildByName('bubbleNode');
        bubble.setRotation(80,0,0,0);
        bubble.scale = 0;
        AudioManager.getInstance().playSound('sfx_1stfrt', false);
        for(let i = 0; i < this.answerArr.length; i++) {
            let seq = cc.sequence(cc.scaleTo(0.56, 1.2,1.2), cc.scaleTo(0.12, 0.8, 0.8), cc.scaleTo(0.12, 1.1,1.1), cc.scaleTo(0.12, 0.9, 0.9), cc.scaleTo(0.24, 1, 1), cc.callFunc(()=>{this.bubbleAction(this.rightNum)}));
            let seq1 = cc.sequence(cc.scaleTo(0.56, 1.2,1.2), cc.scaleTo(0.12, 0.8, 0.8), cc.scaleTo(0.12, 1.1,1.1), cc.scaleTo(0.12, 0.9, 0.9), cc.scaleTo(0.24, 1, 1));
            if(this.answerArr[i] != 8) {
                setTimeout(() => {
                    if(i == this.answerArr.length-1) {
                        this.tuopanNode.children[this.answerArr[i]].runAction(seq);
                    }else {
                        this.tuopanNode.children[this.answerArr[i]].runAction(seq1);
                    }
                }, 40* i);
            }
        }
        this.fruitHand.active = false
        this.fruitHand.scale = 0
        this.fruitBubble.on(cc.Node.EventType.TOUCH_START, (e)=>{
            // if(!this.isAction) {
            //     GameMsg.getInstance().actionSynchro({type: 5, rightNum: this.rightNum})
            // }
           this.bubbleStart(this.rightNum)
        })
        this.fruitBubble.on(cc.Node.EventType.TOUCH_END, (e)=>{
            // if(!this.isAction) {
            //     GameMsg.getInstance().actionSynchro({type: 6})
            // }
            this.bubbleEnd()
        })
       
        if(ConstValue.IS_TEACHER == true) {
            ListenerManager.getInstance().trigger(ListenerType.CloseLoading)
            ListenerManager.getInstance().trigger(ListenerType.OpenGame)
        }else {
            ListenerManager.getInstance().trigger(ListenerType.CloseSceneLoading)
        }
    }

    initVegetable() {
        this.title = this.parentNode.getChildByName('carNode').getChildByName('title')
        this.titleLabel = this.title.getChildByName('label').getComponent(cc.Label)
        if(this.head.length <= 15) {
            this.titleLabel.horizontalAlign = cc.Label.HorizontalAlign.CENTER
        }
        this.titleLabel.string = this.head
        AudioManager.getInstance().playSound('sfx_kpbopn', false);
        let car = this.vegetableNode.getChildByName('carNode');
        for(let i = 0; i < this.tuopanNode.children.length; i++) {
            this.tuopanNode.children[i].scale = 0;
        }
        car.setPosition(cc.v2(-1250, -51));
        car.runAction(cc.moveBy(0.8, cc.v2(1250, 0)));
        let bubble = this.vegetableNode.getChildByName('bubbleNode');
        bubble.setRotation(80,0,0,0);
        bubble.scale = 0;  
        AudioManager.getInstance().playSound('sfx_1stfrt', false);                          
        for(let i = 0; i < this.answerArr.length; i++) {
            let seq = cc.sequence(cc.scaleTo(0.56, 1.2,1.2), cc.scaleTo(0.12, 0.8, 0.8), cc.scaleTo(0.12, 1.1,1.1), cc.scaleTo(0.12, 0.9, 0.9), cc.scaleTo(0.24, 1, 1), cc.callFunc(()=>{this.bubbleAction(this.rightNum)}));
            let seq1 = cc.sequence(cc.scaleTo(0.56, 1.2,1.2), cc.scaleTo(0.12, 0.8, 0.8), cc.scaleTo(0.12, 1.1,1.1), cc.scaleTo(0.12, 0.9, 0.9), cc.scaleTo(0.24, 1, 1));
            if(this.types == 1) {
                if(this.answerArr[i] != 8) {
                    setTimeout(() => {
                        if(i == this.answerArr.length-1) {
                            this.tuopanNode.children[this.answerArr[i]].runAction(seq);
                        }else {
                            this.tuopanNode.children[this.answerArr[i]].runAction(seq1);
                        }
                    }, 40* i);
                }
            }else if(this.types == 2) {
                setTimeout(() => {
                    if(i == this.answerArr.length-1) {
                        this.tuopanNode.children[this.answerArr[i]].runAction(seq);
                    }else {
                        this.tuopanNode.children[this.answerArr[i]].runAction(seq1);
                    }
                }, 40* i);
            }           
        }
        this.vegetableHand.active = false
        this.vegetableHand.scale = 0
        this.vegetableBubble.on(cc.Node.EventType.TOUCH_START, (e)=>{
            // if(!this.isAction) {
            //     GameMsg.getInstance().actionSynchro({type: 5, rightNum: this.rightNum})
            // }
            this.bubbleStart(this.rightNum)
        })
        this.vegetableBubble.on(cc.Node.EventType.TOUCH_END, (e)=>{
            // if(!this.isAction) {
            //     GameMsg.getInstance().actionSynchro({type: 6})
            // }
            this.bubbleEnd()
        })
        if(ConstValue.IS_TEACHER == true) {
            ListenerManager.getInstance().trigger(ListenerType.CloseLoading)
            ListenerManager.getInstance().trigger(ListenerType.OpenGame)
        }else {
            ListenerManager.getInstance().trigger(ListenerType.CloseSceneLoading)
        }
    }

    initDirection() {
        this.title = this.parentNode.getChildByName('title')
        this.titleLabel = this.title.getChildByName('label').getComponent(cc.Label)
        this.titleLabel.string = this.head
        // this.timeoutId = setTimeout(() => {
        //     let len = this.titleLabel.node.width
        //     this.title.width = len + 140
        //     clearTimeout(this.timeoutId)
        // }, 1);
        let left = this.directionNode.getChildByName('leftNode');
        let right = this.directionNode.getChildByName('rightNode');
        left.opacity = 100;
        right.opacity = 0;
        left.setPosition(cc.v2(-1500, 0));
        right.setPosition(cc.v2(1500, 0));
        this.scheduleOnce(()=>{
            let len = this.titleLabel.node.width
            console.log('-------len', len)
            this.title.width = len + 140
            if(ConstValue.IS_TEACHER == true) {
                ListenerManager.getInstance().trigger(ListenerType.CloseLoading)
                ListenerManager.getInstance().trigger(ListenerType.OpenGame)
            }else {
                ListenerManager.getInstance().trigger(ListenerType.CloseSceneLoading)
            }
            AudioManager.getInstance().playSound('sfx_txopn2',false);
            let spaw1 = cc.spawn(cc.moveBy(1.9, cc.v2(0,12)), cc.rotateBy(1.9, -5));
            let spaw2 = cc.spawn(cc.moveBy(2.4, cc.v2(0,-12)), cc.rotateBy(2.4, 5));
            let seq = cc.sequence(spaw1, spaw2);
            let loop = cc.repeatForever(seq);
            this.duckNode.runAction(loop);
            let seq1 = cc.sequence(cc.spawn(cc.moveBy(1.5, cc.v2(-1500, 0)), cc.fadeIn(1.5)), cc.callFunc(()=>{}));
            left.runAction(cc.spawn(cc.moveBy(1.5, cc.v2(1500, 0)), cc.fadeIn(1.5)));
            right.runAction(seq1);
        }, 0.2)
    }


    touchEnable(index:number):boolean {
        if(this.types == 1) {
            if(this.rightNum == 0 && index == 3) {
                return true;
            }else if(this.rightNum == 1 && index == 5) {
                return true;
            }else if(this.rightNum == 2 && index == 1) {
                return true;
            }else if(this.rightNum == 3 && index == 2) {
                return true;
            }else if(this.rightNum == 4 && index == 6) {
                return true;
            }else if(this.rightNum == 5 && index == 4) {
                return true;
            }else if(this.rightNum == 6 && index == 0) {
                return true;
            }else if(this.rightNum == 7 && index == 7) {
                return true;
            }else {
                return false;
            }
        }else if(this.types == 2) {
            if(this.rightNum == 0 && index == 2) {
                return true;
            }else if(this.rightNum == 1 && index == 8) {
                return true;
            }else if(this.rightNum == 2 && index == 0) {
                return true;
            }else if(this.rightNum == 3 && index == 6) {
                return true;
            }else if(this.rightNum == 4&& index == 7) {
                return true;
            }else if(this.rightNum == 5&& index == 3) {
                return true;
            }else if(this.rightNum == 6&& index == 1) {
                return true;
            }else if(this.rightNum == 7&& index == 4) {
                return true;
            }else if(this.rightNum == 8&& index == 5) {
                return true;
            }else {
                return false;
            }
        }else if(this.types == 3) {
            return true;
        }
    }

    errAudio(oriIndex?: number, finishCallback?:Function) {
        for(let i = 0; i < this.audioIdArr.length; i++) {
            AudioManager.getInstance().stopAudio(this.audioIdArr[i])
        }
        this.audioIdArr = []
        if(this.types == 1) {
            if(this.rightNum == 0) {
                this.erroring = true
                AudioManager.getInstance().playSound('橘子没有在香蕉的上方哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 1) {
                this.erroring = true
                AudioManager.getInstance().playSound('梨没有在香蕉的右上方哦，重新放一下吧~', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 2) {
                this.erroring = true
                AudioManager.getInstance().playSound('橘子没有在草莓的后面哦，重新放一下吧~', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 3) {
                this.erroring = true
                AudioManager.getInstance().playSound('桃子没有在香蕉的左面哦，重新放一下吧~', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 4) {
                this.erroring = true
                AudioManager.getInstance().playSound('桃子没有在苹果的上面哦，重新放一下吧~', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 5) {
                this.erroring = true
                AudioManager.getInstance().playSound('桃子没有在西瓜的左上方哦，重新放一下吧~', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 6) {
                this.erroring = true
                AudioManager.getInstance().playSound('葡萄和梨相邻啦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 7) {
                //AudioManager.getInstance().playSound('桃子不是在香蕉的左面哦，重新放一下吧！', false);
            }
        }else if(this.types == 2) {
            if(this.rightNum == 0) {
                this.erroring = true
                AudioManager.getInstance().playSound('土豆没有在最中央的位置哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 1) {
                this.erroring = true
                AudioManager.getInstance().playSound('黄瓜没有在土豆的左面哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 2) {
                this.erroring = true
                AudioManager.getInstance().playSound('西红柿没有在黄瓜的右下方哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 3) {
                this.erroring = true
                AudioManager.getInstance().playSound('西兰花没有在西红柿的右面哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 4) {
                this.erroring = true
                AudioManager.getInstance().playSound('西兰花没有在南瓜的下面哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 5) {
                this.erroring = true
                AudioManager.getInstance().playSound('菠菜没有在土豆的上方哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 6) {
                this.erroring = true
                AudioManager.getInstance().playSound('菠菜没有在白菜的右面哦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 7) {
                this.erroring = true
                AudioManager.getInstance().playSound('大蒜和菠菜相邻啦，重新放一下吧！', false, 1, (id)=>{this.audioIdArr.push(id)}, finishCallback);
            }else if(this.rightNum == 8) {}
        }else if(this.types == 3) {
            if(oriIndex == 0) {
                AudioManager.getInstance().playSound('这不是我的家，我的家在B3哟', false, 1, (id)=>{this.audioIdArr.push(id)})
            }else if(oriIndex == 1) {
                AudioManager.getInstance().playSound('这不是我的家，我的家在C1哟', false, 1, (id)=>{this.audioIdArr.push(id)}) 
            }else if(oriIndex == 2) {
                AudioManager.getInstance().playSound('这不是我的家，我的家在A3哟', false, 1, (id)=>{this.audioIdArr.push(id)}) 
            }else if(oriIndex == 3) {
                AudioManager.getInstance().playSound('这不是我的家，我的家在C4哟', false, 1, (id)=>{this.audioIdArr.push(id)}) 
            }else if(oriIndex == 4) {
                AudioManager.getInstance().playSound('这不是我的家，我的家在B2哟', false, 1, (id)=>{this.audioIdArr.push(id)}) 
            }else if(oriIndex == 5) {
                AudioManager.getInstance().playSound('这不是我的家，我的家在D1哟', false, 1, (id)=>{this.audioIdArr.push(id)}) 
            }
        }
    }

    cueAudio(rightNum: number) {
        for(let i = 0; i < this.audioIdArr.length; i++) {
            AudioManager.getInstance().stopAudio(this.audioIdArr[i])
        }
        this.audioIdArr = []
        if(this.erroring) {
            return
        }
        if(this.types == 1) {
            this.fruitHand.active = false
            switch(rightNum) {
                case 0:
                    AudioManager.getInstance().playSound('橘子在香蕉的上方', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 1:
                    AudioManager.getInstance().playSound('梨在香蕉的右上方',false,1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 2:
                    AudioManager.getInstance().playSound('橘子在草莓的后面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 3:
                    AudioManager.getInstance().playSound('桃子在香蕉的左面，苹果的上面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 4:
                    AudioManager.getInstance().playSound('桃子在香蕉的左面，苹果的上面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 5:
                    AudioManager.getInstance().playSound('桃子在西瓜的左上方', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 6:
                    AudioManager.getInstance().playSound('葡萄和梨不相邻', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 7:
                    AudioManager.getInstance().playSound('最后一个水果放在哪里呢？', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                default:
                    return;
                    break;
            }
        }else if(this.types == 2) {
            this.vegetableHand.active = false
            switch(rightNum) {
                case 0:
                    AudioManager.getInstance().playSound('土豆在最中央的位置', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 1:
                    AudioManager.getInstance().playSound('黄瓜在土豆的左面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 2:
                    AudioManager.getInstance().playSound('西红柿在黄瓜的右下方', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 3:
                    AudioManager.getInstance().playSound('西兰花在西红柿的右面，南瓜的下面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 4:
                    AudioManager.getInstance().playSound('西兰花在西红柿的右面，南瓜的下面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;    
                case 5:
                    AudioManager.getInstance().playSound('菠菜在土豆的上方，白菜的右面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 6:
                    AudioManager.getInstance().playSound('菠菜在土豆的上方，白菜的右面', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;    
                case 7:
                    AudioManager.getInstance().playSound('大蒜和菠菜不相邻', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                case 8:
                    AudioManager.getInstance().playSound('最后一个蔬菜放在哪里呢？', false, 1, (id)=>{this.audioIdArr.push(id)}, ()=>{});
                    break;
                default:
                    return;
                    break;
            }
        }
    }

    bubbleAction(rightNum :number) {
        let bubble = this.parentNode.getChildByName('bubbleNode');
        var str = '';
        if(this.types == 1) {
            switch(rightNum) {
                case 0:
                    str = '橘子在香蕉上方';
                    break;
                case 1:
                    str = '梨在香蕉的右上方';
                    break;
                case 2:
                    str = '橘子在草莓的后面';
                    break;
                case 3:
                    str = '桃子在香蕉的左面，苹果的上面';
                    break;
                case 4:
                    str = '桃子在香蕉的左面，苹果的上面';
                    break;
                case 5:
                    str = '桃子在西瓜的左上方';
                    break;
                case 6:
                    str = '葡萄和梨不相邻';
                    break;
                case 7:
                    str = '最后一个水果放在哪里呢？';
                    break;
                default:
                    return;
                    break;
            }
        }else if(this.types == 2) {
            switch(rightNum) {
                case 0:
                    str = '土豆在最中央的位置';
                    break;
                case 1:
                    str = '黄瓜在土豆的左面';
                    break;
                case 2:
                    str = '西红柿在黄瓜的右下方';
                    break;
                case 3:
                    str = '西兰花在西红柿的右面，南瓜的下面';
                    break;
                case 4:
                    str = '西兰花在西红柿的右面，南瓜的下面';
                    break;    
                case 5:
                    str = '菠菜在土豆的上方，白菜的右面';
                    break;
                case 6:
                    str = '菠菜在土豆的上方，白菜的右面';
                    break;    
                case 7:
                    str = '大蒜和菠菜不相邻';
                    break;
                case 8:
                    str = '最后一个蔬菜放在哪里呢？';
                    break;
                default:
                    return;
                    break;
            }
        }
        let func0 = cc.callFunc(()=>{
            bubble.getChildByName('label').getComponent(cc.Label).string = str;
        })
        let func1 = cc.callFunc(()=>{
            bubble.scale = 0;
            bubble.setRotation(80,0,0,0);
            bubble.getChildByName('label').getComponent(cc.Label).string = str;
        })
        bubble.scale = 1;
        bubble.setRotation(0,0,0,0);
        let spaw1 = cc.spawn(cc.rotateTo(0.16, -13), cc.scaleTo(0.16, 1.2, 1.2));
        let spaw2 = cc.spawn(cc.rotateTo(0.12, 6), cc.scaleTo(0.12, 0.9, 0.9));
        let spaw3 = cc.spawn(cc.rotateTo(0.12, -6), cc.scaleTo(0.12, 1.1, 1.1));
        let spaw4 = cc.spawn(cc.rotateTo(0.28, 0), cc.scaleTo(0.12, 1, 1));
        let spaw0 = cc.spawn(cc.rotateTo(0.28, 80), cc.scaleTo(0.28, 0, 0));
        let seq = cc.sequence(spaw0, func0, spaw1, spaw2, spaw3, spaw4);
        let seq1 = cc.sequence(func1, spaw1, spaw2, spaw3, spaw4, cc.callFunc(()=>{
            if(this.types == 1) {
                this.fruitHand.active = true
                this.fruitHand.runAction(cc.scaleTo(0.2, 1,1))
            }else if(this.types == 2) {
                this.vegetableHand.active = true
                this.vegetableHand.runAction(cc.scaleTo(0.2, 1,1))
            }
        }))
        bubble.stopAllActions();
        if(this.rightNum == 0) {
            bubble.runAction(seq1)
        }else {
            bubble.runAction(seq);
        }
    }

    touchStart(index: number, pos: cc.Vec2) {
        let node = this.tuopanNode.children[index]
        node.opacity = 0
        this.touchNode.active = true;
        this.touchNode.zIndex = 100;
        this.touchNode.setPosition(pos);
        this.touchNode.scale = node.scale - 0.1;
        if(this.types == 3) {
            this.touchNode.getComponent(sp.Skeleton).skeletonData = node.getComponent(sp.Skeleton).skeletonData;
            this.touchNode.getComponent(sp.Skeleton).setAnimation(0, 'drag', true);
        }else {
            AudioManager.getInstance().playSound('sfx_ctchfrt', false);
            this.shadowArr[index].active = false
            this.touchNode.children[0].getComponent(cc.Sprite).spriteFrame = node.getComponent(cc.Sprite).spriteFrame;
            this.touchNode.getComponent(cc.Sprite).spriteFrame = node.children[0].getComponent(cc.Sprite).spriteFrame;
        }
        if(this.rightNum == 0) {
            if(this.types == 1) {
                if(this.fruitHand.active) {
                    this.cueAudio(this.rightNum)
                    this.fruitHand.active = false
                }
            }else if(this.types == 2) {
                if(this.vegetableHand.active) {
                    this.cueAudio(this.rightNum)
                    this.vegetableHand.active = false
                }
            }
        }
    }

    touchMove(index: number , pos: cc.Vec2, gridPos: cc.Vec2) {
        this.touchNode.setPosition(pos);
        let last:number = -1
        for(let j = 0; j < this.gridNode.children.length; j++) {
            if(this.gridNode.children[j].getBoundingBox().contains(gridPos)) {
                if(!this.gridNode.children[j].getChildByName('sprite').active) {
                    last = j
                    if(this.types == 3) {
                        if(index == this.answerArr[j]) {
                            this.gridNode.children[j].getChildByName('white').active = true;
                        }else {
                            this.gridNode.children[j].getChildByName('white').active = true;
                        }
                    }else {
                        this.gridNode.children[j].getChildByName('box').active = true;
                    }
                    this.overNum++;
                }
                for(let k = 0; k < this.gridNode.children.length; k ++) {
                    if(k != j) {
                        if(this.types == 3) {
                            this.gridNode.children[k].getChildByName('red').active = false;
                            this.gridNode.children[k].getChildByName('white').active = false;
                        }else { 
                            if(this.gridNode.children[k].getChildByName('box').active) {
                                this.gridNode.children[k].getChildByName('box').active = false;
                            }
                        }
                    }
                }
            }
        }
        if(this.overNum == 0) {
            for(let k = 0; k < this.gridNode.children.length; k++) {
                if(this.types == 3) {
                    this.gridNode.children[k].getChildByName('red').active = false;
                    this.gridNode.children[k].getChildByName('white').active = false;
                }else {
                    this.gridNode.children[k].getChildByName('box').active = false;
                }
            }
        }else {
            this.overNum = 0;
        }  
    }

    touchEnd(index: number) {
        if(this.types != 3) {
            this.shadowArr[index].active = true
        }
        this.touchNode.active = false;
        this.tuopanNode.children[index].opacity = 255;
    }

    touchCancel(i: number, gridPos: cc.Vec2) {
        let node = this.tuopanNode.children[i]
        let index = null
        for(let j = 0; j < this.gridNode.children.length; j++) {
            if(this.gridNode.children[j].getBoundingBox().contains(gridPos)) {
                index = j
                let rightIndex = 0
                let spriteActive = this.gridNode.children[j].getChildByName('sprite').active
                if(i == this.answerArr[j]&&!spriteActive) {
                    rightIndex = 1
                }else if(i == this.answerArr1[j]&&!spriteActive) {
                    rightIndex = 2
                }else if(i == this.answerArr2[j]&&!spriteActive) {
                    rightIndex = 3
                }
                if(rightIndex) {
                    // this.eventvalue.levelData[0].subject[j] = i;
                    // this.eventvalue.levelData[0].result = 2
                    // this.eventvalue.result = 2
                    // this.isOver = 2
                    this.gridNode.children[j].getChildByName('sprite').active = true;
                    if(!this.isAction) {
                        if(rightIndex == 1) {
                            this.archival.answerType = 0
                        }else if(rightIndex ==2) {
                            this.archival.answerType = 1
                        }else if(rightIndex ==3) {
                            this.archival.answerType = 2
                        }
                        GameMsg.getInstance().actionSynchro({type: 3, index: i})
                        this.actionId++
                        this.archival.rightArr[this.archival.rightArr.length] = i
                        this.archival.answerdata = ReportManager.getInstance().getAnswerData()
                        this.archival.level = ReportManager.getInstance().getLevel()
                        this.archival.rightNum = ReportManager.getInstance().getRightNum()
                        this.archival.totalNum = ReportManager.getInstance().getTotalNum()
                        GameMsg.getInstance().dataArchival(this.actionId ,this.archival)
                    }
                    ReportManager.getInstance().answerRight()
                    this.touchRight = true;
                    this.rightNum++;
                    if(this.types != 3) {
                        this.bubbleAction(this.rightNum);
                        this.cueAudio(this.rightNum)
                        this.gridNode.children[j].getChildByName('sprite').getComponent(cc.Sprite).spriteFrame = this.touchNode.children[0].getComponent(cc.Sprite).spriteFrame 
                        AudioManager.getInstance().playSound('sfx_putfrt', false);
                    }else {
                        AudioManager.getInstance().playSound('sfx_kdmtched', false);
                        this.gridNode.children[j].getChildByName('sprite').getComponent(sp.Skeleton).skeletonData = this.touchNode.getComponent(sp.Skeleton).skeletonData
                        this.gridNode.children[j].getChildByName('sprite').getComponent(sp.Skeleton).setAnimation(0, 'idle', true)
                    }
                    this.isRight();
                }
            }
        }
        if(!this.touchRight) {
            ReportManager.getInstance().answerWrong()
            if(this.types == 3) {
                AudioManager.getInstance().playSound('sfx_kdclck', false);
                if(this.gridNode.children[index]) {
                    this.errAudio(i)
                    this.gridNode.children[index].getChildByName('sprite').active = true
                    this.gridNode.children[index].getChildByName('sprite').getComponent(sp.Skeleton).skeletonData = this.touchNode.getComponent(sp.Skeleton).skeletonData
                    this.gridNode.children[index].getChildByName('sprite').getComponent(sp.Skeleton).setAnimation(0, 'idle', true)
                    let func = cc.callFunc(()=>{
                        node.opacity = 255;
                        this.gridNode.children[index].getChildByName('sprite').active = false
                        if(node.getComponent(sp.Skeleton).findAnimation('cry')) {
                            node.getComponent(sp.Skeleton).setAnimation(0, 'cry', false);
                            node.getComponent(sp.Skeleton).setCompleteListener(trackEntry=>{
                                if(trackEntry.animation.name == 'cry') {
                                    node.getComponent(sp.Skeleton).setAnimation(0, 'idle', true);
                                }
                            });
                        }else {
                            node.getComponent(sp.Skeleton).setAnimation(0, 'false', false);
                            node.getComponent(sp.Skeleton).setCompleteListener(trackEntry=>{
                                if(trackEntry.animation.name == 'false') {
                                    node.getComponent(sp.Skeleton).setAnimation(0, 'idle', true);
                                }
                            });
                        }
                    })
                    this.gridNode.children[index].getChildByName('sprite').runAction(cc.sequence(cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)),func));
                }else{
                    node.getComponent(sp.Skeleton).setAnimation(0, 'drag_end', false)
                    node.getComponent(sp.Skeleton).setCompleteListener(trackEntry=>{
                        if(trackEntry.animation.name == 'drag_end') {
                            node.getComponent(sp.Skeleton).setAnimation(0, 'idle', true);
                        }
                    });
                    node.opacity = 255;
                }
            }else {
                AudioManager.getInstance().playSound('sfx_erro', false);
                if(this.gridNode.children[index]) {
                    let sprite = this.gridNode.children[index].getChildByName('sprite')
                    if(!sprite.active) {
                        this.gridNode.children[index].getChildByName('err').active = true; 
                        this.gridNode.children[index].getChildByName('err').getComponent(cc.Sprite).spriteFrame = this.touchNode.children[0].getComponent(cc.Sprite).spriteFrame
                        this.finishing = true
                        let func = cc.callFunc(()=>{
                            this.erroring = false
                            this.finishing = false
                            this.gridNode.children[index].getChildByName('err').active = false;
                            node.opacity = 255;
                            this.shadowArr[i].active = true
                        })
                        this.gridNode.children[index].getChildByName('err').runAction(cc.sequence(cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)),func));
                        this.errAudio(i, ()=>{})   
                    }else {
                        this.shadowArr[i].active = true
                        node.opacity = 255;
                    }
                }else{
                    this.shadowArr[i].active = true
                    node.opacity = 255;
                }
            }  
        }
        
        for(let i = 0; i < this.gridNode.children.length; i ++) {
            if(this.types == 3) {
                if(this.gridNode.children[i].getChildByName('red').active) {
                    this.gridNode.children[i].getChildByName('red').active = false;
                }
                if(this.gridNode.children[i].getChildByName('white').active) {
                    this.gridNode.children[i].getChildByName('white').active = false;
                }
            }else {
                if(this.gridNode.children[i].getChildByName('box').active) {
                    this.gridNode.children[i].getChildByName('box').active = false;
                }
            }
        }
        this.touchRight = false;
        this.touchNode.active = false;
    }

    addListenerOnItem() {
        for(let i = 0; i < this.tuopanNode.children.length; i++) {
            this.tuopanNode.children[i].on(cc.Node.EventType.TOUCH_START, (e)=>{
                if(this.touchTarget||this.tuopanNode.children[i].opacity == 0) {
                    return;
                }
                if(!this.touchEnable(i)) {
                    this.tuopanNode.children[i].runAction(cc.sequence(cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0)), cc.moveBy(0.05, cc.v2(20,0)),cc.moveBy(0.05, cc.v2(-20,0))));
                    return;
                }
                this.touchTarget = e.target;
                var point = this.node.convertToNodeSpaceAR(e.currentTouch._point);
                this.gameResult = AnswerResult.AnswerHalf
                if(!ReportManager.getInstance().isStart()) {
                    ReportManager.getInstance().levelStart(this.isBreak)
                }
                ReportManager.getInstance().touchStart()
                ReportManager.getInstance().setAnswerNum(1)
                // if(!this.isAction) {
                //     GameMsg.getInstance().actionSynchro({type: 1, pos: point, index: i})
                // }
                this.touchStart(i, point)
            })
            this.tuopanNode.children[i].on(cc.Node.EventType.TOUCH_MOVE, (e)=>{
                if(this.touchTarget != e.target) {
                    return;
                }
                let point = this.node.convertToNodeSpaceAR(e.currentTouch._point);
                let gridPos = this.gridNode.convertToNodeSpaceAR(e.currentTouch._point)
                // if(!this.isAction) {
                //     GameMsg.getInstance().actionSynchro({type:2, pos: point, index: i, gridPos: gridPos})
                // }
                this.touchMove(i, point, gridPos)
            });
            this.tuopanNode.children[i].on(cc.Node.EventType.TOUCH_END, (e)=>{
                if(this.touchTarget != e.target) {
                    return;
                }
                this.touchTarget = null;
                this.touchEnd(i)
            });

            this.tuopanNode.children[i].on(cc.Node.EventType.TOUCH_CANCEL, (e)=>{
                if(this.touchTarget != e.target) {
                    return;
                }
                this.touchTarget = null;
                let gridPos = this.gridNode.convertToNodeSpaceAR(e.currentTouch._point)
                this.touchCancel(i, gridPos)
            });
        }
    }

  

    isRight() {
        if(this.types == 1) {
            if(this.rightNum == 8) {
                this.isOver = true
                ReportManager.getInstance().gameOver(AnswerResult.AnswerRight)
                if(!this.isAction) {
                    GameMsg.getInstance().gameOver(ReportManager.getInstance().getAnswerData())
                }
                
                DaAnData.getInstance().submitEnable = true;
                UIHelp.showOverTip(2,'你真棒！等等还没做完的同学吧～','', null, null, '挑战成功');
            }
        }else if(this.types == 2) {
            if(this.rightNum == 9) {
                this.isOver = true
                ReportManager.getInstance().gameOver(AnswerResult.AnswerRight)
                if(!this.isAction) {
                    GameMsg.getInstance().gameOver(ReportManager.getInstance().getAnswerData())
                }
                
                DaAnData.getInstance().submitEnable = true;
                UIHelp.showOverTip(2,'你真棒！等等还没做完的同学吧～','', null, null, '挑战成功');
            }
        }else if(this.types == 3) {
            if(this.rightNum == 6) {
                this.isOver = true
                ReportManager.getInstance().gameOver(AnswerResult.AnswerRight)
                if(!this.isAction) {
                    GameMsg.getInstance().gameOver(ReportManager.getInstance().getAnswerData())
                }
               
                DaAnData.getInstance().submitEnable = true;
                UIHelp.showOverTip(2,'你真棒！等等还没做完的同学吧～','', null, null, '挑战成功');
            }
        }
    
    }

    reset() {
        if(this.types == 1 || this.types == 2) {
            let tuopanArr = this.tuopanNode.children
            let gridArr = this.gridNode.children
            for(let i = 0; i < tuopanArr.length; ++i) {
                tuopanArr[i].active = true
                tuopanArr[i].opacity = 255
                tuopanArr[i].children[0].active = false
            }
            for(let i = 0; i < this.shadowArr.length; ++i) {
                this.shadowArr[i].active = true
            }
            for(let i = 0; i < gridArr.length; ++i) {
                gridArr[i].getChildByName('box').active = false
                gridArr[i].getChildByName('err').active = false
                if(this.types == 1 && i == 4) {
                    gridArr[i].getChildByName('sprite').active = true
                    continue
                }
                gridArr[i].getChildByName('sprite').active = false
            }
        }else if(this.types == 3) {
            let gridArr = this.gridNode.children
            let tuopanArr = this.tuopanNode.children
            for(let i = 0; i < gridArr.length; ++i) {
                gridArr[i].getChildByName('red').active = false
                gridArr[i].getChildByName('white').active = false
                gridArr[i].getChildByName('sprite').active = false
            }
            for(let i = 0; i < tuopanArr.length; ++i) {
                tuopanArr[i].active = true
                tuopanArr[i].opacity = 255
            }
        }
    }

    private onInit() {
        this.actionId = 0
        this.archival.answerdata = null
        this.archival.rightNum = null
        this.archival.totalNum = null
        this.isOver = false
        ReportManager.getInstance().answerReset()
        UIManager.getInstance().closeUI(OverTips)
        this.reset()
        this.bubbleAction(0)
    }

    private onRecovery(data: any) {
        this.isOver = false
        let answerType = data.answerType
        let rightArr = data.rightArr
        let answerdata = data.answerdata
        let level = data.level
        let rightNum = data.rightNum
        let totalNum = data.totalNum
        ReportManager.getInstance().setLevel(level)
        ReportManager.getInstance().setAnswerData(answerdata)
        ReportManager.getInstance().setRightNum(rightNum)
        ReportManager.getInstance().setTotalNum(totalNum)
        this.reset()
        let tuopanArr = this.tuopanNode.children
        let gridArr = this.gridNode.children
        if(this.types == 1 || this.types == 2) {
            this.bubbleAction(rightArr.length)
            for(let i = 0; i < rightArr.length; ++i) {
                tuopanArr[rightArr[i]].opacity = 0
                let arr: number[] = []
                if(answerType == 1) {
                    arr = this.answerArr
                }else if(answerType == 2) {
                    arr = this.answerArr1
                }else if(answerType == 3) {
                    arr = this.answerArr2
                }
                for(let n = 0; n < arr.length; ++n) {
                    if(arr[n] == rightArr[i]) {
                        let spd = gridArr[n].getChildByName('sprite')
                        spd.active = true
                    }
                }
            }
        }else if(this.types == 3) {
            for(let i = 0; i < rightArr.length; ++i) {
                tuopanArr[rightArr[i]].opacity = 0
                for(let n = 0; n <this.answerArr.length; ++i) {
                    if(this.answerArr[n] == rightArr[i]) {
                        let spd = gridArr[n].getChildByName('sprite')
                        spd.active = true
                        spd.getComponent(sp.Skeleton).setAnimation(0, 'idle', false)
                    }
                }   
            }
        }
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
            let index = data.index
            this.touchStart(index, pos)
        }else if(data.type == 2) {
            let pos = data.pos
            let index = data.index
            let gridPos = data.gridPos
            this.touchMove(index, pos, gridPos)
        }else if(data.type == 3) {
            let index = data.index
            this.touchEnd(index)
        }else if(data.type == 4) {
            let index = data.index
            let gridPos = data.gridPos
            this.touchCancel(index,gridPos)
        }else if(data.type == 5) {
            let rightNum = data.rightNum
            this.bubbleStart(rightNum)
        }else if(data.type == 6) {
            this.bubbleEnd()
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
                        if(content.types) {
                            this.types = content.types;
                        }else {
                            console.log('getNet中返回types的值为空');
                        }
                        if(content.head) {
                            this.head = content.head;
                        }else {
                            console.log('getNet中返回head的值为空');
                        }
                        this.initGame();
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
