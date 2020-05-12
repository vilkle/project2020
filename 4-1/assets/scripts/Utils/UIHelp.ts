import { UIManager } from "../Manager/UIManager";
import { TipUI } from "../UI/panel/TipUI";
import { OverTips } from "../UI/Item/OverTips";
import { AffirmTips } from "../UI/Item/AffirmTips";
export class UIHelp
{
    public static showTip(message: string)
    {
        let tipUI = UIManager.getInstance().getUI(TipUI) as TipUI;
        if(!tipUI)
        {
            UIManager.getInstance().openUI(TipUI, null, 201, ()=>{
                UIHelp.showTip(message);
            });
        }
        else
        {
            tipUI.showTip(message);
        }
    }

    public static showOverTips(type:number,str:string, finishCallback?:any,closeCallback?:any)
    {
        let overTips = UIManager.getInstance().getUI(OverTips) as OverTips;
        if(!overTips)
        {
            UIManager.getInstance().openUI(OverTips, null, 200, ()=>{
                UIHelp.showOverTips(type,str,finishCallback, closeCallback);
            });
        }
        else
        {
           overTips.init(type, str, finishCallback, closeCallback);
        }
    }
    public static showAffirmTips(type: number, des: string, btnCloselDes?: string, btnOkDes?: string, callbackClose ?: any,callbackOk ?: any)
    {
        let affirmTips = UIManager.getInstance().getUI(AffirmTips) as AffirmTips;
        if(!affirmTips)
        {
            UIManager.getInstance().openUI(AffirmTips, null,200, ()=>{
                UIHelp.showAffirmTips(type,des,btnCloselDes,btnOkDes,callbackClose,callbackOk);
            });
        }
        else
        {
            affirmTips.init(type,des,callbackOk);
        }
    }

    
}

