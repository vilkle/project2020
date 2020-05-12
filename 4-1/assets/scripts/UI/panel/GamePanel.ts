import { BaseUI } from "../BaseUI";
import { NetWork } from "../../Http/NetWork";
import {ConstValue} from "../../Data/ConstValue"
import { UIManager } from "../../Manager/UIManager";
import UploadAndReturnPanel from "./UploadAndReturnPanel";
import {AudioManager} from "../../Manager/AudioManager"
import DataReporting from "../../Data/DataReporting";
import {UIHelp} from "../../Utils/UIHelp";
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
    private runAudioId : number = 0;
    private judge : boolean = true;
    private isEnd : number = 0;
    private eventvalue = {
        isResult: 1,
        isLevel: 0,
        levelData: [
            {
                subject: null,
                answer: null,
                result: 4
            }
        ],
        result: 4
    }

    _textureIdMapRenderTexture = {}
    isBreak : boolean = true;
    isBreak1 : boolean = true;
    isOver : boolean = false;
    isOver1 : boolean = false;

    start() {
        this.bg.on(cc.Node.EventType.TOUCH_START, (e)=>{
            if(this.isEnd != 1) {
                this.isEnd = 2;
                this.eventvalue.result = 2;
                this.eventvalue.levelData[0].result = 2;
            }
        });

        DataReporting.getInstance().addEvent('end_game', this.onEndGame.bind(this));
        if(ConstValue.IS_TEACHER) {
            UIManager.getInstance().openUI(UploadAndReturnPanel);
        }else {
            
        }
        AudioManager.getInstance().playSound('bgm_wk401');
        this.yige.opacity = 255;
        this.yige.getComponent(sp.Skeleton).setAnimation(0, 'tiao', false);
        this.yige.getComponent(sp.Skeleton).setCompleteListener(trackEntry=>{
            if(trackEntry.animation.name == 'tiao') {
                AudioManager.getInstance().playSound('帮我找到出口吧', false);
            }
        });
        this.addListenerOnRound1();
        this.initBackground();
    }

    onEndGame() {
        //如果已经上报过数据 则不再上报数据
        if (DataReporting.isRepeatReport && this.eventvalue.result != 1) {
            DataReporting.getInstance().dispatchEvent('addLog', {
                eventType: 'clickSubmit',
                eventValue: JSON.stringify(this.eventvalue)
            });
            DataReporting.isRepeatReport = false;
        }
        //eventValue  0为未答题   1为答对了    2为答错了或未完成
        DataReporting.getInstance().dispatchEvent('end_finished', { eventType: 'activity', eventValue: this.isEnd });
    }

    initBackground() {
        this.cloud1.runAction(cc.repeatForever(cc.sequence(cc.moveBy(30, cc.v2(400, 0)), cc.moveBy(30, cc.v2(-400, 0)))));
        this.cloud2.runAction(cc.repeatForever(cc.sequence(cc.moveBy(30, cc.v2(300, 0)), cc.moveBy(30, cc.v2(-300, 0)))));
    }

    addListenerOnRound1() {
        this.bg.on(cc.Node.EventType.TOUCH_START, function(e) {
            if(this.isEnd != 1) {
                this.isEnd = 2;
                this.eventvalue.result = 2;
                this.eventvalue.levelData[0].result = 2;
            }
            if(this.start1.getBoundingBox().contains(this.node.convertToNodeSpaceAR(e.currentTouch._point))) {
                this.isBreak = false;
            }else if(this.start2.getBoundingBox().contains(this.node.convertToNodeSpaceAR(e.currentTouch._point))) {
                this.isBreak1 = false;
            }
            if(this.yige.getBoundingBox().contains(this.bg.convertToNodeSpaceAR(e.currentTouch._point))) {
                if(!this.start2.getBoundingBox().contains(this.node.convertToNodeSpaceAR(e.currentTouch._point))) {
                    if(!this.isOver1) {
                        AudioManager.getInstance().stopAll();
                        AudioManager.getInstance().playSound('帮我找到出口吧', false);
                        cc.log('bangwozhaodaochukouba');
                    }
                }
            }
        }.bind(this), this, true);
        this.bg.on(cc.Node.EventType.TOUCH_MOVE, function(e) {
            let posInBg = this.node.convertToNodeSpaceAR(e.currentTouch._point);
            //round1
            let posInNode = this.round1.node.convertToNodeSpaceAR(e.currentTouch._point);
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
                console.log(data)
                if (data[3] <= 0) {
                    if(!this.isOver) {
                        if(!this.isOver1) {
                            if(!this.isBreak) {
                                this.isBreak = true;
                                AudioManager.getInstance().stopAll();
                                this.runAudioId = 0;
                                this.judge = true;
                                this.yige.setPosition(cc.v2(28, -132));
                                this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
                                //this.yige.opacity = 0;
                                //AudioManager.getInstance().playSound('阿欧', false);
                                this.mask._graphics.clear();
                            }
                        }
                    }
                }
                else {
                    if(!this.isBreak) {
                        this.commonFunc(e, this.mask);
                        
                        if(this.isOver1 == false) {
                            if(this.judge) {
                                AudioManager.getInstance().playSound('sfx_run',true,1,(id)=>{this.runAudioId = id; cc.log('id is ', this.runAudioId)}, null);
                                this.yige.getComponent(sp.Skeleton).addAnimation(0, 'pao', true);
                                this.judge = false;
                            }
                            this.yige.setPosition(posInBg);
                        }
                        if(this.end1.getBoundingBox().contains(this.node.convertToNodeSpaceAR(e.currentTouch._point))) {
                            this.isEnd = 2;
                            this.eventvalue.result = 2;
                            AudioManager.getInstance().stopAll();
                            AudioManager.getInstance().playSound('不是这条路', false);
                            this.yige.setPosition(cc.v2(28, -132));
                            this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
                            this.isOver = true;
                        }
                    }
                }
            }
            //round2
            let posInNode1 = this.round2.node.convertToNodeSpaceAR(e.currentTouch._point);
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
                            this.yige.setPosition(cc.v2(28, -132));
                            this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
                            //this.yige.opacity = 0;
                            //AudioManager.getInstance().playSound('阿欧', false);
                            this.mask1._graphics.clear();
                        }
                    }
                }
                else {
                    if(!this.isBreak1) {
                        this.commonFunc(e,this.mask1);
                        if(!this.isOver1) {
                            if(this.judge) {
                                AudioManager.getInstance().playSound('sfx_run',true,1,function(id){this.runAudioId = id; cc.log('id is ', this.runAudioId)}.bind(this), null);
                                this.yige.getComponent(sp.Skeleton).setAnimation(0, 'pao', true);
                                this.judge = false;
                            }
                            this.yige.setPosition(posInBg);
                        }
                        if(this.end2.getBoundingBox().contains(this.node.convertToNodeSpaceAR(e.currentTouch._point))&& !this.isOver1) {
                            this.isOver1 = true;
                            AudioManager.getInstance().stopAudio(this.runAudioId);
                            this.runAudioId = 0;
                            AudioManager.getInstance().playSound('sfx_winnerrun', false,1,(id)=>{},()=>{AudioManager.getInstance().playSound('谢谢你帮我找到出口',false, 1,(id)=>{},()=>{this.success();});});
                            this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', false);
                            this.eventvalue.result = 1;
                            this.isEnd = 1;
                            this.eventvalue.levelData[0].result = 1;
                            cc.log('----eventvalue', this.eventvalue);
                            DataReporting.getInstance().dispatchEvent('addLog', {
                                eventType: 'clickSubmit',
                                eventValue: JSON.stringify(this.eventvalue)
                            });
                        }
                    }
            }
        }
        }.bind(this), this, true);

        this.bg.on(cc.Node.EventType.TOUCH_END, function(e) {
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
                this.yige.setPosition(cc.v2(28, -132));
                this.yige.getComponent(sp.Skeleton).setAnimation(0, 'daiji', true);
                //this.yige.opacity = 0;
            }
           
        }.bind(this), this, true);
        this.round1.node.on(cc.Node.EventType.TOUCH_CANCEL, function(e) {
            
        }.bind(this));

    }

    commonFunc (event, mask){
        var point = event.touch.getLocation();
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
        UIHelp.showOverTips(2,'闯关成功，棒棒的', function(){
            AudioManager.getInstance().playSound('闯关成功，棒棒的', false);
        }.bind(this), function(){}.bind(this));
    }

    onDestroy() {

    }

    onShow() {
    }

    setPanel() {

    }

    getNet() {
        NetWork.getInstance().httpRequest(NetWork.GET_QUESTION + "?courseware_id=" + NetWork.courseware_id, "GET", "application/json;charset=utf-8", function (err, response) {
            if (!err) {
                let response_data = response;
                if (Array.isArray(response_data.data)) {
                    return;
                }
                let content = JSON.parse(response_data.data.courseware_content);
                if (content != null) {
                    this.setPanel();
                }
            } else {
                this.setPanel();
            }
        }.bind(this), null);
    }
}
