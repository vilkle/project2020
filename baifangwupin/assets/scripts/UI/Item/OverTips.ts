import { BaseUI } from "../BaseUI";
import { Tools } from "../../UIComm/Tools";
import { UIManager } from "../../Manager/UIManager";
import { AudioManager } from "../../Manager/AudioManager";


export enum Type_Tile {
    ZuoDaJieShu,
    ChuangGuanChengGong,
    TiaoZhanJieShu,
    TiaoZhanChengGong,
    ChuangGuanJieShu
}

export const DefalutTitle = ["作答结束", "闯关成功", "挑战结束", "挑战成功", "闯关结束"];

let FontMap = {
    "作": "img_zuo",
    "答": "img_da",
    "结": "img_jie",
    "束": "img_shu",
    "成": "img_cheng",
    "功": "img_gong",
    "挑": "img_tiao",
    "战": "img_zhan",
    "闯": "img_chuang",
    "关": "img_guan",
};


const { ccclass, property } = cc._decorator;
@ccclass
export class OverTips extends BaseUI {

    protected static className = "OverTips";

    @property(cc.Label)
    private label_tip: cc.Label = null;

    @property(sp.Skeleton)
    private spine_false: sp.Skeleton = null;
    @property(sp.Skeleton)
    private spine_true: sp.Skeleton = null;
    @property(sp.Skeleton)
    private spine_complete: sp.Skeleton = null;
    @property(cc.Node)
    private node_close: cc.Node = null;
    @property(cc.Node)
    private button: cc.Node = null
    private btnCallback = null
    private callback = null;
    private endInAnimation: boolean = false;
    private img_titles: cc.Node[] = [];
    private bones: any[] = [];
    private id: number = null

    constructor() {
        super();
    }

    onLoad() {
        cc.loader.loadRes("images/OverTips/word", cc.SpriteAtlas, function (err, atlas) { });
    }

    start() {
        //this.node_close.on(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    }

    onDisable() {
        //this.node_close.off(cc.Node.EventType.TOUCH_END, this.onClickClose, this);
    }

    onDestroy() {
        if(this.id) {
            clearTimeout(this.id)
        }
       
    }

    /**
     设置显示内容
     @param {number} type          0: 错误  1：答对了  2：闯关成功(一直显示不会关闭)
     @param {string} str           提示内容
     @param {Function} callback    回调函数
     @param {string} endTitle      end动效提示文字
     */
    init(type: number, str: string = "", btnStr: string, btnCallback: Function, callback: Function, endTitle?: string): void {
        this.callback = callback;
        this.spine_false.node.active = type == 0;
        this.spine_true.node.active = type == 1;
        this.spine_complete.node.active = type == 2;
        this.label_tip.string = str;
        this.label_tip.node.active = true;
        if(btnStr != '') {
            this.button.active = true
            this.button.getChildByName('Background').getChildByName('Label').getComponent(cc.Label).string = btnStr
        }else {
            this.button.active = false
        }

        if(btnCallback) {
            this.btnCallback = btnCallback
            // this.id = setTimeout(() => {
            //     UIManager.getInstance().closeUI(OverTips)
            //     btnCallback()
            //     clearTimeout(this.id)
            //     this.id = null
            // }, 9000)
        }
        switch (type) {
            case 0:
                Tools.playSpine(this.spine_false, "false", false, this.delayClose.bind(this));
                AudioManager.getInstance().playSound("sfx_genneg", false, 1);
                break;
            case 1:
                Tools.playSpine(this.spine_true, "true", false, this.delayClose.bind(this));
                AudioManager.getInstance().playSound("sfx_genpos", false, 1);
                break;
            case 2:
                this.spine_complete.node.active = false;
                if (!endTitle) endTitle = DefalutTitle[0];
                if (endTitle.length != 4) return;
                this.bones = [];
                this.bones.push(this.spine_complete.findBone("paipai"));
                this.bones.push(this.spine_complete.findBone("xiaoU"));
                this.bones.push(this.spine_complete.findBone("mimiya"));
                this.bones.push(this.spine_complete.findBone("doudou"));
                for (let index = 0; index < 4; index++) {
                    this.createTitleImage(endTitle[index]);
                }
                break;
        }
        let endPos = this.label_tip.node.position;
        let framePos_1 = cc.v2(endPos.x, endPos.y - 72.8);
        let framePos_2 = cc.v2(endPos.x, endPos.y + 12);
        let framePos_3 = cc.v2(endPos.x, endPos.y - 8);
        let framePos_4 = cc.v2(endPos.x, endPos.y + 7.3);
        this.label_tip.node.position = framePos_1;
        this.label_tip.node.runAction(cc.sequence(cc.moveTo(0.08, framePos_2), cc.moveTo(0.08, framePos_3), cc.moveTo(0.08, framePos_4), cc.moveTo(0.06, endPos)));
    }

    delayClose(): void {
        //this.scheduleOnce(function () {  }.bind(this), 0);
    }

    buttonCallback() {
        AudioManager.getInstance().stopAll()
        AudioManager.getInstance().playSound("sfx_buttn", false, 1)
        this.btnCallback()
        UIManager.getInstance().closeUI(OverTips)
    }

    onClickClose(event?, customEventData?): void {
        if (event) AudioManager.getInstance().playSound("sfx_buttn", false, 1);
        if (this.callback) this.callback();
        UIManager.getInstance().closeUI(OverTips);
    }

    createTitleImage(titleName: string) {
        cc.loader.loadRes("images/OverTips/word", cc.SpriteAtlas, function (err, atlas) {
            if (err) {
                console.log(err.message || err);
                return;
            }
            let spriteFrame = atlas.getSpriteFrame(FontMap[titleName]);
            let imageNode = new cc.Node();
            let image = imageNode.addComponent(cc.Sprite);
            image.spriteFrame = spriteFrame;
            imageNode.parent = this.node;
            imageNode.active = false;
            this.img_titles.push(imageNode);
            if (this.img_titles.length == 4) {
                this.endInAnimation = true;
                this.spine_complete.node.active = true;
                Tools.playSpine(this.spine_complete, "in", false, () => {
                    Tools.playSpine(this.spine_complete, "stand", true);
                    this.endInAnimation = false;
                });
                AudioManager.getInstance().playSound("sfx_geupgrd", false, 1);
                //AudioManager.getInstance().playSound('“你真棒！等等还没做完的同学吧~', false)
            }
        }.bind(this));
    }

    update() {
        if (!this.endInAnimation) return;
        for (let index = 0; index < this.img_titles.length; index++) {
            this.img_titles[index].active = true;
            this.img_titles[index].position = cc.v2(this.bones[index].worldX - 139, this.bones[index].worldY - 135);
        }
    }
}
