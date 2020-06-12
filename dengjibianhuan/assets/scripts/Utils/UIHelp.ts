/*
 * @Author: 马超
 * @Date: 2020-02-29 14:55:20
 * @LastEditTime: 2020-03-02 14:06:56
 * @Description: 游戏脚本
 * @FilePath: \wucaibinfenbang\assets\scripts\Utils\UIHelp.ts
 */
import { UIManager } from "../Manager/UIManager";
import { TipUI } from "../UI/panel/TipUI";
import { AffirmTips } from "../UI/Item/affirmTips";
import { OverTips } from "../UI/Item/OverTips";

export class UIHelp {
    /**
     * 
     * @param message tips文字内容
     * @param type tips类型  0:内容tips   1:系统tips
     */
    public static showTip(message: string) {
        let tipUI = UIManager.getInstance().getUI(TipUI) as TipUI;
        if (!tipUI) {
            UIManager.getInstance().openUI(TipUI, 212, () => {
                UIHelp.showTip(message);
            });
        }
        else {
            tipUI.showTip(message);
        }
    }

    /**
    * 结束tip
    * @param message tips文字内容
    * @param type tips类型   0: 错误  1：答对了  2：闯关成功(一直显示不会关闭)
    * @param {string} str           提示内容
    * @param {Function} callback    回调函数
    * @param {string} endTitle      end动效提示文字
    */
    public static showOverTip(type: number, str: string = "", btnStr: string, btnCallback: Function, callback: Function = null, endTitle?: string) {
        let overTips = UIManager.getInstance().getUI(OverTips) as OverTips;
        if (!overTips) {
            UIManager.getInstance().openUI(OverTips, 210, () => {
                UIHelp.showOverTip(type, str, btnStr, btnCallback, callback, endTitle);
            });
        }
        else {
            overTips.init(type, str, btnStr, btnCallback, callback, endTitle);
        }
    }

    /**
    * 二次确认框
    * @param message tips文字内容
    * @param type tips类型  0:内容tips   1:系统tips
    */
    public static AffirmTip(type: number, des: string, callback: any, btnCloselDes?: string, btnOkDes?: string) {
        let overTips = UIManager.getInstance().getUI(AffirmTips) as AffirmTips;
        if (!overTips) {
            UIManager.getInstance().openUI(AffirmTips, 210, () => {
                UIHelp.AffirmTip(type, des, callback, btnCloselDes, btnOkDes);
            });
        }
        else {
            overTips.init(type, des, callback, btnCloselDes, btnOkDes);
        }
    }


}

