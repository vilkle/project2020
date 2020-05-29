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
    @property(cc.Sprite)
    private round1 : cc.Sprite = null;
    @property(cc.Sprite)
    private round2 : cc.Sprite = null;
    @property(cc.Mask)
    private mask : cc.Mask = null;
    @property(cc.Mask)
    private mask1 : cc.Mask = null;
    @property(cc.Node)
    private bg : cc.Node = null;
    @property(cc.Node)
    private start1 : cc.Node = null;
    @property(cc.Node)
    private start2 : cc.Node = null;
    @property(cc.Node)
    private end1 : cc.Node = null;
    @property(cc.Node)
    private end2 : cc.Node = null;
    @property(cc.Node)
    private yige : cc.Node = null;
    @property(cc.Node)
    private cloud1 : cc.Node = null;
    @property(cc.Node)
    private cloud2 : cc.Node = null;
    @property(cc.Node)
    private cactus1 : cc.Node = null;
    @property(cc.Node)
    private cactus2 : cc.Node = null;
    @property(cc.Node)
    private erge : cc.Node = null;
    @property(cc.Node)
    private layout : cc.Node = null;
    @property(cc.Node) 
    private title: cc.Node = null
    @property(cc.Node) 
    private laba: cc.Node = null
    private standardNum: number = 1
    private runAudioId : number = 0;
    private judge : boolean = true;
    private isEnd : boolean = false;
    private timeoutArr: number[] = []
    private gameResult: AnswerResult = AnswerResult.NoAnswer
    private isTitle: boolean = false
    private isAudio: boolean = false
    private actionId: number = 0
    private isAction: boolean = false
    private archival = {
        answerdata: null,
        rightNum: null,
        totalNum: null,
        standardNum: this.standardNum
    }

    _textureIdMapRenderTexture = {}
    isBreak : boolean = true;
    isBreak1 : boolean = true;
    isOver : boolean = false;
    isOver1 : boolean = false;

    onLoad() {
         //监听新课堂发出的消息
         this.addSDKEventListener()
         //新课堂上报
         GameMsg.getInstance().gameStart()
         //添加上报result数据
         ReportManager.getInstance().addResult(1)
         this.standardNum = 1
         ReportManager.getInstance().setStandardNum(this.standardNum)
         ReportManager.getInstance().setQuestionInfo(0, '一起动手，挑战下面的关卡吧！')
        if(ConstValue.IS_TEACHER) {
            UIManager.getInstance().openUI(UploadAndReturnPanel, 212)
        }else {
            this.getNet()
        }
        this.title.on(cc.Node.EventType.TOUCH_START, this.audioCallback, this)
        this.laba.on(cc.Node.EventType.TOUCH_START, this.audioCallback, this)
    }

    start() {
        AudioManager.getInstance().playSound('bgm_wk401');
        this.yige.opacity = 255;
        this.yige.getComponent(sp.Skeleton).setAnimation(0, 'tiao', false);
        this.yige.getComponent(sp.Skeleton).setCompleteListener(trackEntry=>{
            if(trackEntry.animation.name == 'tiao') {
                AudioManager.getInstance().playSound('帮我找到出口吧', false);
            }
        });
        this.layout.active = false
        this.addListenerOnRound1();
        this.initBackground();
    }

    initBackground() {
        this.cloud1.runAction(cc.repeatForever(cc.sequence(cc.moveBy(30, cc.v2(400, 0)), cc.moveBy(30, cc.v2(-400, 0)))));
        this.cloud2.runAction(cc.repeatForever(cc.sequence(cc.moveBy(30, cc.v2(300, 0)), cc.moveBy(30, cc.v2(-300, 0)))));
    }

    actionStart(pos: cc.Vec2) {
        if(this.start1.getBoundingBox().contains(this.node.convertToNodeSpaceAR(pos))) {
            this.isBreak = false;
        }else if(this.start2.getBoundingBox().contains(this.node.convertToNodeSpaceAR(pos))) {
            this.isBreak1 = false;
        }
        if(this.yige.getBoundingBox().contains(this.bg.convertToNodeSpaceAR(pos))) {
            if(!this.start2.getBoundingBox().contains(this.node.convertToNodeSpaceAR(pos))) {
                if(!this.isOver1) {
                    if(this.isTitle) {
                        return
                    }
                    AudioManager.getInstance().stopAll();
                    this.isTitle = true
                    AudioManager.getInstance().playSound('帮我找到出口吧', false, 1, null, ()=>{this.isTitle = false});
                }
            }
        }
    }

    actionMove(pos: cc.Vec2) {
        let posInBg = this.node.convertToNodeSpaceAR(pos);
        //round1
        let posInNode = this.round1.node.convertToNodeSpaceAR(pos);
        let spriteFrame = this.round1.spriteFrame;
        let rect = spriteFrame.getRect();
        let offset = spriteFrame.getOffset();
        if ((posInNode.x < offset.x - rect.width / 2) || (posInNode.y < offset.y - rect.height / 2)
        || (posInNode.x > (offset.x + rect.width / 2)) || (posInNode.y > (offset.y + rect.height / 2))) {
            //return false
        } else {
            let posInRect = cc.v2(posInNode.x - offset.x + rect.width / 2, posInNode.y - offset.y + rect.height / 2)

            let tex = spriteFrame.getTexture()
            var rt = this._textureIdMapRenderTexture[tex.getId()]
            if (!rt) {
                rt = new cc.RenderTexture()
                rt.initWithSize(tex.width, tex.height)
                rt.drawTextureAt(tex, 0, 0)
                this._textureIdMapRenderTexture[tex.getId()] = rt
            }

            // data就是这个texture的rgba值数组
            let data
            if (spriteFrame.isRotated())
            {
                data = rt.readPixels(null, rect.x + posInRect.y, rect.y + posInRect.x, 1, 1)
            }
            else{
                data = rt.readPixels(null, rect.x + posInRect.x, rect.y + rect.height - posInRect.y, 1, 1)
            }
            if (data[3] <= 0) {
                if(!this.isOver) {
                    if(!this.isOver1) {
                        if(!this.isBreak) {
                            this.isBreak = true;
                            AudioManager.getInstance().stopAll();
                            this.runAudioId = 0;
                            this.judge = true;
                            this.yige.setPosition(cc.v2(89, -143));
                            this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
                            //this.yige.opacity = 0;
                            //AudioManager.getInstance().playSound('阿欧', false);
                            this.mask._graphics.clear();
                            console.log('-----------------1')
                            ReportManager.getInstance().answerWrong()
                        }
                    }
                }
            }
            else {
                if(!this.isBreak) {
                    this.commonFunc(pos, this.mask);
                    
                    if(this.isOver1 == false && !this.isOver) {
                        if(this.judge) {
                            AudioManager.getInstance().playSound('sfx_run',true,1,(id)=>{this.runAudioId = id}, null);
                            this.yige.getComponent(sp.Skeleton).addAnimation(0, 'pao', true);
                            this.judge = false; 
                        }
                        this.yige.setPosition(posInBg);
                    }
                    if(this.end1.getBoundingBox().contains(this.node.convertToNodeSpaceAR(pos))) {
                        if(this.isOver) {
                            return
                        }
                        // this.isEnd = 2;
                        // this.eventvalue.result = 2;
                        AudioManager.getInstance().stopAll();
                        AudioManager.getInstance().playSound('不是这条路', false);
                        this.yige.setPosition(cc.v2(89, -143));
                        this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
                        this.isOver = true;
                        ReportManager.getInstance().answerWrong()
                        console.log('-----------3')
                    }
                }
            }
        }
        //round2
        let posInNode1 = this.round2.node.convertToNodeSpaceAR(pos);
        let spriteFrame1 = this.round2.spriteFrame;
        let rect1 = spriteFrame1.getRect();
        let offset1 = spriteFrame1.getOffset();
        
        if ((posInNode1.x < offset1.x - rect1.width / 2) || (posInNode1.y < offset1.y - rect1.height / 2)
        || (posInNode1.x > (offset1.x + rect1.width / 2)) || (posInNode1.y > (offset1.y + rect1.height / 2))) {
            //return false
        } else {
            let posInRect1 = cc.v2(posInNode1.x - offset1.x + rect1.width / 2, posInNode1.y - offset1.y + rect1.height / 2)

            let tex = spriteFrame1.getTexture()
            var rt = this._textureIdMapRenderTexture[tex.getId()]
            if (!rt) {
                rt = new cc.RenderTexture()
                rt.initWithSize(tex.width, tex.height)
                rt.drawTextureAt(tex, 0, 0)
                this._textureIdMapRenderTexture[tex.getId()] = rt
            }

            let data
            if (spriteFrame1.isRotated())
            {
                data = rt.readPixels(null, rect1.x + posInRect1.y, rect1.y + posInRect1.x, 1, 1)
            }
            else{
                data = rt.readPixels(null, rect1.x + posInRect1.x, rect1.y + rect1.height - posInRect1.y, 1, 1)
            }
            if (data[3] <= 0) {
                if(!this.isOver1) {
                    if(!this.isBreak1) {
                        this.isBreak1 = true;
                        this.runAudioId = 0;
                        AudioManager.getInstance().stopAll();
                        this.judge = true;
                        this.yige.setPosition(cc.v2(89, -143));
                        this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
                        //this.yige.opacity = 0;
                        //AudioManager.getInstance().playSound('阿欧', false);
                        this.mask1._graphics.clear();
                        ReportManager.getInstance().answerWrong()
                        console.log('------------2')
                    }
                }
            }else {
                if(!this.isBreak1) {
                    this.commonFunc(pos,this.mask1);
                    if(!this.isOver1) {
                        if(this.judge) {
                            AudioManager.getInstance().playSound('sfx_run',true,1,function(id){this.runAudioId = id}.bind(this), null);
                            this.yige.getComponent(sp.Skeleton).setAnimation(0, 'pao', true);
                            this.judge = false;
                        }
                        this.yige.setPosition(posInBg);
                    }
                    if(this.end2.getBoundingBox().contains(this.node.convertToNodeSpaceAR(pos))&& !this.isOver1) {
                        this.isOver1 = true;
                        AudioManager.getInstance().stopAudio(this.runAudioId);
                        this.runAudioId = 0;
                        AudioManager.getInstance().playSound('sfx_winnerrun', false,1,(id)=>{},()=>{AudioManager.getInstance().playSound('谢谢你帮我找到出口',false, 1,(id)=>{},()=>{this.success();});});
                        this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', false);
                        ReportManager.getInstance().answerRight()
                        ReportManager.getInstance().gameOver(AnswerResult.AnswerRight)
                        if(!this.isAction) {
                            GameMsg.getInstance().gameOver(ReportManager.getInstance().getAnswerData())
                        }
                        this.isEnd = true
                        // this.eventvalue.result = 1;
                        // this.isEnd = 1;
                        // this.eventvalue.levelData[0].result = 1;
                        // cc.log('----eventvalue', this.eventvalue);
                        // DataReporting.getInstance().dispatchEvent('addLog', {
                        //     eventType: 'clickSubmit',
                        //     eventValue: JSON.stringify(this.eventvalue)
                        // });
                    }
                }
            }
        }
    }

    actionEnd() {
        if(this.isOver == false && this.isOver1 == false) {
            this.isBreak = true;
            AudioManager.getInstance().stopAudio(this.runAudioId); 
            this.runAudioId = 0;
            this.judge = true;
            this.mask._graphics.clear();
            //this.yige.setPosition(cc.v2(95, -90));
        }
        if(this.isOver1 == false) {
            this.isBreak1 = true;
            this.judge = true;
            AudioManager.getInstance().stopAudio(this.runAudioId);
            this.runAudioId = 0;
            this.mask1._graphics.clear();
            this.yige.setPosition(cc.v2(89, -143));
            this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
            //this.yige.opacity = 0;
        }
    }

    addListenerOnRound1() {
        this.bg.on(cc.Node.EventType.TOUCH_START, function(e) {
            let pos = e.currentTouch._point
            this.gameResult = AnswerResult.AnswerHalf
            if(!ReportManager.getInstance().isStart()) {
                ReportManager.getInstance().levelStart(this.isBreak)
            }
            ReportManager.getInstance().touchStart()
            ReportManager.getInstance().setAnswerNum(1)

            if(!this.isAction) {
                GameMsg.getInstance().actionSynchro({type: 1, pos: pos})
            }
            this.actionStart(pos)
        }.bind(this), this, true);
        this.bg.on(cc.Node.EventType.TOUCH_MOVE, function(e) {
            let pos = e.currentTouch._point
            if(!this.isAction) {
                GameMsg.getInstance().actionSynchro({type:2, pos: pos})
            }
            this.actionMove(pos)
        }.bind(this), this, true);

        this.bg.on(cc.Node.EventType.TOUCH_END, function(e) {
            if(!this.isAction) {
                GameMsg.getInstance().actionSynchro({type: 3})
                this.actionId++
                this.archival.answerdata = ReportManager.getInstance().getAnswerData()
                this.archival.level = ReportManager.getInstance().getLevel()
                this.archival.rightNum = ReportManager.getInstance().getRightNum()
                this.archival.totalNum = ReportManager.getInstance().getTotalNum()
                GameMsg.getInstance().dataArchival(this.actionId ,this.archival)
            }
            this.actionEnd()
        }.bind(this), this, true);

    }

    commonFunc (pos, mask){
        var point = pos//event.touch.getLocation();
        point = this.node.convertToNodeSpaceAR(point);
        var graphics = mask._graphics;
        var color = cc.color(0, 0, 0, 255);
        //graphics.rect(point.x,point.y,200,200)
        graphics.ellipse(point.x,point.y,80, 80)
        graphics.lineWidth = 2
        graphics.fillColor = color
        graphics.fill()
    }

    success() {
        this.layout.on(cc.Node.EventType.TOUCH_START, (e)=>{
            e.stopPropagation();
        });
        UIHelp.showOverTip(2,'', '', null, null, '挑战成功')
        // UIHelp.showOverTips(2,'闯关成功，棒棒的', function(){
        //     AudioManager.getInstance().playSound('闯关成功，棒棒的', false);
        // }.bind(this), function(){}.bind(this));
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
        this.layout.active = true
        this.yige.setPosition(cc.v2(89, -143));
        this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
        this.judge = true
        this.isBreak = true
        this.isBreak1 = true
        this.isOver = false
        this.isOver1 = false
        this.isEnd = false
    }

    private onRecovery(data: any) {
        this.isBreak = true
        this.isOver = false
        let answerdata = data.answerdata
        let level = data.level
        let rightNum = data.rightNum
        let totalNum = data.totalNum
        ReportManager.getInstance().setLevel(level)
        ReportManager.getInstance().setAnswerData(answerdata)
        ReportManager.getInstance().setRightNum(rightNum)
        ReportManager.getInstance().setTotalNum(totalNum)
        this.yige.setPosition(cc.v2(89, -143));
        this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
        this.judge = true
        this.isBreak = true
        this.isBreak1 = true
        this.isOver = false
        this.isOver1 = false
        this.isEnd = false
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
        this.layout.active = true
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
        AudioManager.getInstance().playSound('帮我找到出口吧', false, 1, null, () => {
            this.layout.active = false
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
            this.actionStart(pos)
        }else if(data.type == 2) {
            let pos = data.pos
            this.actionMove(pos)
        }else if(data.type == 3) {
            this.actionEnd()
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
        if (!this.isEnd) {
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
