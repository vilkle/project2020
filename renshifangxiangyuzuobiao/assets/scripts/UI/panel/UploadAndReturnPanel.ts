/*
 * @Author: 马超
 * @Date: 2020-02-29 14:55:20
 * @LastEditTime: 2020-03-01 12:51:42
 * @Description: 游戏脚本
 * @FilePath: \wucaibinfenbang\assets\scripts\UI\panel\UploadAndReturnPanel.ts
 */
import { BaseUI } from "../BaseUI";
import { UIManager } from "../../Manager/UIManager";
import GamePanel from "./GamePanel";
import SubmissionPanel from "./SubmissionPanel";
import {ListenerManager} from "../../Manager/ListenerManager";
import {ListenerType} from "../../Data/ListenerType";
import { DaAnData } from "../../Data/DaAnData";
import { UIHelp } from "../../Utils/UIHelp";
import { OverTips } from "../Item/OverTips";
import { AudioManager } from "../../Manager/AudioManager";
import { ReportManager } from "../../Manager/ReportManager";
const { ccclass, property } = cc._decorator;

@ccclass
export default class UploadAndReturnPanel extends BaseUI {

    protected static className = "UploadAndReturnPanel";

    start() {

    }

    onFanHui() {
        ListenerManager.getInstance().trigger(ListenerType.OnEditStateSwitching, {state: 0}); 
        UIManager.getInstance().closeUI(GamePanel);
        UIManager.getInstance().closeUI(UploadAndReturnPanel);
        UIManager.getInstance().closeUI(OverTips);
        UIManager.getInstance().closeUI(SubmissionPanel)
        DaAnData.getInstance().submitEnable = false
        AudioManager.getInstance().stopAll()
        ReportManager.getInstance().initAnswer()
    }

    onTiJiao() {
        if(DaAnData.getInstance().submitEnable) {
            UIManager.getInstance().openUI(SubmissionPanel, 211);
        }else {
            UIHelp.showTip('请通关后进行保存。');
        }  
    }
}
