import BoundingBoxHelp from "./BoundingBoxHelp";

/**
 * Author: kouyaqi
 * Email: kouyaqi@100tal.com
 */

const {ccclass, property} = cc._decorator;

/**
 * BoundingBoxHelp 的使用例子
 */
@ccclass
class BoundingboxDemo extends cc.Component {

    @property(BoundingBoxHelp)
    private bbh:BoundingBoxHelp = null

    @property(cc.Graphics)
    private grs:cc.Graphics = null

    update(dt){
        this.grs.clear()

        //把边界框绘制出来
        let postions = this.bbh.getBoundingBoxWorldPositions('boundingBox')
        this.polygon(this.grs, postions)
        this.grs.stroke()
    }

    /**
     * 绘制多边形路径，至少3条边
     * @param poss 
     */
    private polygon(graphics:cc.Graphics, poss:cc.Vec2[]){
        if(poss.length < 3) return
        graphics.moveTo(poss[0].x, poss[0].y)
        for(let i = 1; i < poss.length; i++){
            graphics.lineTo(poss[i].x, poss[i].y)
        }
        graphics.lineTo(poss[0].x, poss[0].y)
    }
}
