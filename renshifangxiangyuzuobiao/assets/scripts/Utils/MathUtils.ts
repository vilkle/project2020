export class MathUtils {

    private static instance: MathUtils;

    static getInstance() {
        if (this.instance == null) {
            this.instance = new MathUtils();
        }
        return this.instance;
    }

    constructor() {

    }

    /**
     弧度制转换为角度值
     @param radian 弧度制
     @returns {number}
     */
    public getAngle(radian: number): number {
        return 180 * radian / Math.PI;
    }

	/**
     角度值转换为弧度制
     @param angle
     */
    public getRadian(angle: number): number {
        return angle / 180 * Math.PI;
    }

	/**
     获取两点间弧度
     @param p1X
     @param p1Y
     @param p2X
     @param p2Y
     @returns {number}
     */
    public getRadian2(p1X: number, p1Y: number, p2X: number, p2Y: number): number {
        var xdis: number = p2X - p1X;
        var ydis: number = p2Y - p1Y;
        return Math.atan2(ydis, xdis);
    }

	/**
     获取两点间距离
     @param p1
     @param p1
     * @returns {number}
     */
    public getDistance(p1: cc.Vec2, p2: cc.Vec2): number {
        var disX: number = p2.x - p1.x;
        var disY: number = p2.y - p1.y;
        var disQ: number = disX * disX + disY * disY;
        return Math.sqrt(disQ);
    }

	/**
     获取一个区间的随机数
     @param $from 最小值
     @param $end 最大值
     @returns {number}
     */
    public limit($from: number, $end: number): number {
        $from = Math.min($from, $end);
        $end = Math.max($from, $end);
        var range: number = $end - $from;
        return $from + Math.random() * range;
    }

    /**
     获取一个区间的随机数(帧数)
     @param $from 最小值
     @param $end 最大值
     @returns {number}
     */
    public limitInteger($from: number, $end: number): number {
        return Math.round(this.limit($from, $end));
    }

    /**
     在一个数组中随机获取一个元素
     @param arr 数组
     @returns {any} 随机出来的结果
     */
    public randomArray(arr: Array<any>): any {
        var index: number = Math.floor(Math.random() * arr.length);
        return arr[index];
    }

    /**
     点到直线的垂点
     */
    public SagPoint(x, y, sp, ep): cc.Vec2 {
        var se: number = (sp.x - ep.x) * (sp.x - ep.x) + (sp.y - ep.y) * (sp.y - ep.y);//线段两点距离平方
        var p: number = ((x - sp.x) * (ep.x - sp.x) + (y - sp.y) * (ep.y - sp.y));//向量点乘=|a|*|b|*cosA
        var r: number = p / se; //r即点到线段的投影长度与线段长度比
        var outx: number = sp.x + r * (ep.x - sp.x);//垂足x
        var outy: number = sp.y + r * (ep.y - sp.y);//垂足y
        var point = new cc.Vec2(outx, outy);
        return point;
    }

    /**
     求延长线上的某点，第一象限
     */
    public extendedLinePoint(p1: cc.Vec2, p2: cc.Vec2, dis: number): cc.Vec2 {
        var lab = 0;
        var x: number;
        var y: number;
        // lab = Math.sqrt(Math.abs((p2.x - p1.x) * (p2.x - p1.x)) + Math.abs((p2.y - p1.y) * (p2.y - p1.y)));
        lab = this.getDistance(p1, p2);
        if (p2.x > p1.x && p2.y > p1.y) {
            x = dis / lab * Math.abs(p1.x - p2.x) + p2.x;
            y = dis / lab * Math.abs(p1.y - p2.y) + p2.y;
        }
        else if (p2.x < p1.x && p2.y > p1.y) {
            x = -dis / lab * Math.abs(p1.x - p2.x) + p2.x;
            y = dis / lab * Math.abs(p1.y - p2.y) + p2.y;
        }
        else if (p2.x < p1.x && p2.y < p1.y) {
            x = -dis / lab * Math.abs(p1.x - p2.x) + p2.x;
            y = -dis / lab * Math.abs(p1.y - p2.y) + p2.y;
        }
        else if (p2.x > p1.x && p2.y < p1.y) {
            x = dis / lab * Math.abs(p1.x - p2.x) + p2.x;
            y = -dis / lab * Math.abs(p1.y - p2.y) + p2.y;
        }
        var p = new cc.Vec2(x, y);
        return p;
    }

    /**
     获得两点的角度 1~4象限
     @param {cc.Vec2} p1
     @param {cc.Vec2} p2 
     */
    public getTwoPointsRadian1(p1: cc.Vec2, p2: cc.Vec2): number {
        var x = Math.abs(p1.x - p2.x);
        var y = Math.abs(p1.y - p2.y);
        var z = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        var cos = y / z;
        var radina = Math.acos(cos);//用反三角函数求弧度
        var angle = Math.floor(180 / (Math.PI / radina));//将弧度转换成角度

        if (p2.x > p1.x && p2.y < p1.y) {//鼠标在第四象限
            angle = 180 - angle;
        }

        if (p2.x == p1.x && p2.y > p1.y) {//鼠标在y轴负方向上
            angle = 180;
        }

        if (p2.x > p1.x && p2.y == p1.y) {//鼠标在x轴正方向上
            angle = 90;
        }

        if (p2.x < p1.x && p2.y < p1.y) {//鼠标在第三象限
            angle = 180 + angle;
        }

        if (p2.x < p1.x && p2.y == p1.y) {//鼠标在x轴负方向
            angle = 270;
        }

        if (p2.x < p1.x && p2.y > p1.y) {//鼠标在第二象限
            angle = 360 - angle;
        }
        return angle;
    }

    /**
     获得两点的角度  无论正反旋转
     @param {cc.Vec2} p1
     @param {cc.Vec2} p2 
     */
    public getTwoPointsRadian2(p1: cc.Vec2, p2: cc.Vec2): number {
        let o = p1.x - p2.x;
        let a = p1.y - p2.y;
        let r = Math.atan2(a, o) * -180 / Math.PI - 90;
        return r;
    }

    /**
     取两条直线的交点
     @param p1          // 直线1点1
     @param p2          // 直线1点2
     @param p3          // 直线2点1
     @param p4          // 直线2点2
     */
    public fingCrossPoint(p1: cc.Vec2, p2: cc.Vec2, p3: cc.Vec2, p4: cc.Vec2): cc.Vec2 {
        var a1 = p2.y - p1.y;
        var b1 = p1.x - p2.x;
        var c1 = p1.x * p2.y - p2.x * p1.y;
        var a2 = p4.y - p3.y;
        var b2 = p3.x - p4.x;
        var c2 = p3.x * p4.y - p4.x * p3.y;
        var det = a1 * b2 - a2 * b1;
        if (det == 0) {
            return null;
        }
        var x = (c1 * b2 - c2 * b1) / det;
        var y = (a1 * c2 - a2 * c1) / det;
        var p: cc.Vec2 = new cc.Vec2(Math.floor(x), Math.floor(y));
        return p;
    }

    /**
     * 用于浮点数相加  解决浮点数相加不准确问题
     * @param arg1 
     * @param arg2 
     */
    public accAdd(arg1:number, arg2:number) {
        var r1=0, r2=0, m=0, c=0;
        try {
            r1 = arg1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        c = Math.abs(r1 - r2);
        m = Math.pow(10, Math.max(r1, r2));
        if (c > 0) {
            var cm = Math.pow(10, c);
            if (r1 > r2) {
                arg1 = Number(arg1.toString().replace(".", ""));
                arg2 = Number(arg2.toString().replace(".", "")) * cm;
            } else {
                arg1 = Number(arg1.toString().replace(".", "")) * cm;
                arg2 = Number(arg2.toString().replace(".", ""));
            }
        } else {
            arg1 = Number(arg1.toString().replace(".", ""));
            arg2 = Number(arg2.toString().replace(".", ""));
        }
        return (arg1 + arg2) / m;
    }

    /**
     * 浮点数相减
     * @param arg1 
     * @param arg2 
     */
    public accSub(arg1:number, arg2:number) {
        var r1=0, r2=0, m=0, n=0;
        try {
            r1 = arg1.toString().split(".")[1].length;
        } catch (e) {
            r1 = 0;
        }
        try {
            r2 = arg2.toString().split(".")[1].length;
        } catch (e) {
            r2 = 0;
        }
        m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
        n = (r1 >= r2) ? r1 : r2;
        return ((arg1 * m - arg2 * m) / m).toFixed(n);
    }

    /**
     * 浮点数相乘
     * @param arg1 
     * @param arg2 
     */
    public accMul(arg1:number, arg2:number) {
        var m = 0,
            s1 = arg1.toString(),
            s2 = arg2.toString();
        try {
            m += s1.split(".")[1].length;
        } catch (e) { }
        try {
            m += s2.split(".")[1].length;
        } catch (e) { }
        return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
    }


    /**
     * 浮点数相除
     * @param arg1 
     * @param arg2 
     */
    public accDiv(arg1:number, arg2:number) {
        var t1 = 0,
            t2 = 0,
            r1=0, r2=0;
        try {
            t1 = arg1.toString().split(".")[1].length;
        } catch (e) { }
        try {
            t2 = arg2.toString().split(".")[1].length;
        } catch (e) { }
        r1 = Number(arg1.toString().replace(".", ""));
        r2 = Number(arg2.toString().replace(".", ""));
        return (r1 / r2) * Math.pow(10, t2 - t1);
    }

}