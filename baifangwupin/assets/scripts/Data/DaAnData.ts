/*
 * @Author: 马超
 * @Date: 2020-02-29 14:55:19
 * @LastEditTime: 2020-03-01 12:52:36
 * @Description: 游戏脚本
 * @FilePath: \wucaibinfenbang\assets\scripts\Data\DaAnData.ts
 */
export class DaAnData {
    private static instance: DaAnData;
    public types = 0;//水果1 蔬菜2 方向3
    public submitEnable = false;
   
    static getInstance() {
        if (this.instance == null) {
            this.instance = new DaAnData();
        }
        return this.instance;
    }
}