/**
 * Author: kouyaqi
 * Email: kouyaqi@100tal.com
 */

const {ccclass, property} = cc._decorator;

/**
 * 处理sp.Skeleton的边界框的方法；
 * 将此脚本挂载到含有spine资源的节点；
 * 资源顶点越多，贴合越好，性能越低。
 * */
@ccclass
export default class BoundingBoxHelp extends cc.Component {

    private skeleton:sp.Skeleton = null

    /**插槽的顶点数据 */
    private vertices:number[] = []

    /**转换得到的坐标 */
    private positions:cc.Vec2[] = []

    private getSkeleton(){
        if(this.skeleton == null){
            this.skeleton = this.node.getComponent(sp.Skeleton)
        }
        return this.skeleton
    }

    /**
     * 获取插槽所绑定的边界框的世界坐标
     * @param slotName 插槽名称
     */
    public getBoundingBoxWorldPositions(slotName:string):cc.Vec2[]{
        let skeleton = this.getSkeleton()
        if(skeleton == null){
            console.warn('没有Spine资源！');
            return this.positions
        }

        let boundingBoxSlot = skeleton.findSlot(slotName)
        if(!boundingBoxSlot){
            console.warn(`没有找到插槽： ${slotName}`);
            return this.positions
        }

        let attachment = boundingBoxSlot.attachment
        /** http://zh.esotericsoftware.com/spine-api-reference#BoundingBoxAttachment
         * Transforms the attachment's local vertices to world coordinates. If the slot has attachmentVertices, they are used to deform the vertices.
         *   See World transforms in the Spine Runtimes Guide.
         */
        attachment.computeWorldVertices(boundingBoxSlot, 0, attachment.worldVerticesLength, this.vertices, 0, 2)
        
        for(let i = 0; i < this.vertices.length; i+=2){
            if(!this.positions[i/2]){
                this.positions[i/2] = cc.Vec2.ZERO
            }
            this.positions[i/2].x = this.vertices[i]
            this.positions[i/2].y = this.vertices[i + 1]
        }

        //此时的世界坐标是Spine内部的世界坐标，需要转换为Cocos里的世界坐标
        for(let i = 0; i < this.positions.length; i++){
            this.positions[i] = this.node.convertToWorldSpaceAR(this.positions[i])
        }

        return this.positions
    }


    /**
     * 获取插槽所绑定的边界框相对于节点的坐标
     * @param slotName 插槽名称
     * @param node 相对节点
     */
    public getBoundingBoxRelativePositions(slotName:string, node:cc.Node):cc.Vec2[]{
        let positions = this.getBoundingBoxWorldPositions(slotName)
        for(let i = 0; i < positions.length; i++){
            positions[i] = node.convertToNodeSpaceAR(positions[i])
        }
        return positions
    }

}
