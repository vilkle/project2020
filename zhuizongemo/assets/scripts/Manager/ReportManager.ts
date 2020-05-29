/*
 * @Author: 马超
 * @Date: 2020-02-27 19:59:56
 * @LastEditTime: 2020-05-07 18:19:46
 * @Description: 上报数据管理类
 * @FilePath: \xunzhaogao\assets\scripts\Manager\ReportManager.ts
 */
import {AnswerResult} from "../Data/ConstValue";
import GameMsg from "../Data/GameMsg"
export class ReportManager
{
    private static instance: ReportManager = null;

    public static getInstance(): ReportManager
    {
        if(this.instance == null)
        {
            this.instance = new ReportManager();
        }
        return this.instance;
    }
    private time1: number = 0
    private time2: number = 0
    private degreeNum: number = 0
    private standardNum: number = 0//标准正确作答次数
    private rightNum: number = 0 //正确作答次数
    private totalNum: number = 0//作答总次数
    private level: number = 0 //当前关卡排位
    private levelNum: number = 0 //总的关卡数
    private percentage: number = 0 //完成程度
    private answerdata = { //上报数据结构
        type : 'txt',
        index: 1,
        result: [

        ],
        gameOver: null
    }

/**
 * @description: 添加上报数据关卡信息
 * @param {number} num 关卡数目
 */
    addResult(num: number) {
        this.levelNum = num
        for(let i = 0; i < num; ++i) {
            this.answerdata.result.push({
                id: i + 1,
                question_info: '',
                answer_res: AnswerResult.NoAnswer,
                answer_num: 0,
                answer_time: 0

            })
        }
    }

    setQuestionInfo(index: number, str: string) {
        this.answerdata.result[index].question_info = str
    }

/**
 * @description: 关卡开始数据更新
 * @param {boolean} isBreak 游戏过程中是否中断重连
 */
    levelStart(isBreak: boolean) {  
        if(this.answerdata.result.length == 0) {
            console.warn('There is no data in answerdata, please push result in answerdata first.')
            return
        }
        this.level ++ 
        this.degreeNum = this.level - 1
        this.answerdata.result[this.level - 1].answer_res = AnswerResult.NoAnswer
        if(isBreak) {
            this.answerdata.result[this.level - 1].answer_num += 0
            let time: number = this.answerdata.result[this.level - 1].answer_time
            this.time1 = time * 1000
            this.answerdata.result[this.level - 1].answer_time = time
        }else {
            this.answerdata.result[this.level - 1].answer_num += 0
            this.answerdata.result[this.level - 1].answer_time = 0
            this.time1 = 0
            this.time2 = 0
        }
       
        this.time1 = new Date().getTime()
        console.log('---', this.time1)
    }

/**
* @description: 关卡结束数据更新
* @param {AnswerResult} result 关卡完成情况
*/    
    levelEnd(result: AnswerResult) {
        if(this.answerdata.result.length == 0) {
            console.warn('There is no data in answerdata, please push result in answerdata first.')
            return
        }
        this.time2 = new Date().getTime()
        console.log('===', this.time2)
        console.log('-=-=-=time', (this.time2 - this.time1)/1000)
        this.answerdata.result[this.level - 1].answer_res = result
        this.answerdata.result[this.level - 1].answer_num += 0
        //this.answerdata.result[this.level - 1].answer_time = (this.coastTimes/100).toString() + 's'
        this.answerdata.result[this.level - 1].answer_time = Math.round((this.time2 - this.time1)/1000)
        this.answerdata.gameOver = null
        this.time1 = 0
        this.time2 = 0
    }

/**
* @description: 游戏结束数据更新
*  @param {AnswerResult} result 关卡完成情况
*/
    gameOver(result: AnswerResult) {
        if(this.answerdata.result.length == 0) {
            console.warn('There is no data in answerdata, please push result in answerdata first.')
            return
        }
        if(this.isStart()) {
            this.levelEnd(result)
        }
        this.answerdata.gameOver = {
            percentage: 0,
            answer_all_state: AnswerResult.NoAnswer,
            answer_all_time: 0,
            complete_degree: 0
        }
        let percentage: number = 0
        let progress: string = ''
        if(this.rightNum < 1 ) {
            percentage = 0
        }else {
            //percentage = parseFloat((this.rightNum / this.totalNum * 100).toFixed(2)) 
            percentage = Math.round((this.rightNum / this.totalNum * 100))
            console.log('---------rightNum', this.rightNum)
            console.log('---------totalNum', this.totalNum)
            //percentage = 100
        }
        progress = (this.rightNum / this.standardNum * 100).toFixed(2)
        this.answerdata.gameOver.percentage = percentage
        if(parseFloat(progress) == 0.00) {
            if(this.answerdata.result[0].answer_res == AnswerResult.NoAnswer) {
                this.answerdata.gameOver.answer_all_state = AnswerResult.NoAnswer
            }else if(this.answerdata.result[0].answer_res == AnswerResult.AnswerHalf) {
                this.answerdata.gameOver.answer_all_state = AnswerResult.AnswerHalf
            }
        }else if(parseFloat(progress) == 100.00) {
            this.answerdata.gameOver.answer_all_state = AnswerResult.AnswerRight
        }else {
            this.answerdata.gameOver.answer_all_state = AnswerResult.AnswerHalf
        }
        let time = 0
        for (const key in this.answerdata.result) {
            let timeStr = this.answerdata.result[key].answer_time
            time += timeStr
        }
        // this.answerdata.gameOver.answer_all_time = `${time.toFixed(2)}s`
        // this.answerdata.gameOver.complete_degree = `${this.degreeNum}\/${this.levelNum}`
        this.answerdata.gameOver.answer_all_time = Math.round(time)
        this.answerdata.gameOver.complete_degree = Math.round(this.degreeNum/this.levelNum*100)
        console.log('answerdata-----', this.answerdata)
    }

    updateTime() {
        if(this.time1 != 0) {
            this.time2 = new Date().getTime()
            this.answerdata.result[this.level - 1].answer_time = Math.round((this.time2 - this.time1) / 1000)
        }
    }

    answerReset() {
        this.answerdata =  { 
            type : 'text',
            index: 1,
            result: [
    
            ],
            gameOver: null
        }
        this.addResult(this.levelNum)
        this.level = 0
        this.percentage = 0
        this.degreeNum = 0
        this.rightNum = 0
        this.totalNum = 0
        this.time1 = 0
        this.time2 = 0
    }

    initAnswer() {
        this.answerdata =  { 
            type : 'text',
            index: 1,
            result: [
    
            ],
            gameOver: null
        }
        this.level = 0
        this.percentage = 0
        this.degreeNum = 0
        this.rightNum = 0
        this.totalNum = 0
        this.time1 = 0
        this.time2 = 0
    }

    setPercentage(num : number) {
        this.percentage = num
    }

    isStart(): any {
        if(this.time1 != 0) {
            return true
        }else {
            return false
        }
    }

    addLevel() {
        this.level ++
    }

    setLevel(num: number) {
        this.level = num
    }


    touchStart() {
        this.degreeNum = this.level
    }

    setTime() {
        this.time2 = new Date().getTime()
        this.answerdata.result[this.level - 1].answer_time = Math.round((this.time2 - this.time1) / 1000)
    }

    setAnswerNum(num: number) {
        this.answerdata.result[this.level - 1].answer_num = num
    }

    addAnswerNum() {
        this.answerdata.result[this.level - 1].answer_num ++
    }

    logAnswerdata() {
        console.log('answerdata-------:', this.answerdata)
    }

    touchHalf() {
        this.answerdata.result[this.level - 1].answer_res = AnswerResult.AnswerHalf
    }

    answerHalf() {
        this.time2 = new Date().getTime()
        this.rightNum++
        this.totalNum++
        this.answerdata.result[this.level - 1].answer_res = AnswerResult.AnswerHalf
        this.answerdata.result[this.level - 1].answer_time = Math.round((this.time2 - this.time1) / 1000)
        GameMsg.getInstance().answerSyncSend(this.answerdata)
    }
    answerRight() {
        this.time2 = new Date().getTime()
        this.rightNum++
        this.totalNum++
        this.answerdata.result[this.level - 1].answer_res = AnswerResult.AnswerRight
        this.answerdata.result[this.level - 1].answer_time = Math.round((this.time2 - this.time1) / 1000)
        GameMsg.getInstance().answerSyncSend(this.answerdata)
    }

    answerWrong() {
        this.time2 = new Date().getTime()
        this.totalNum++
        this.answerdata.result[this.level - 1].answer_res = AnswerResult.AnswerError
        this.answerdata.result[this.level - 1].answer_time = Math.round((this.time2 - this.time1) / 1000)
        GameMsg.getInstance().answerSyncSend(this.answerdata)
    }
    getAnswerData(): any {
        this.time2 = new Date().getTime()
        if(this.time1 != 0) {
            this.answerdata.result[this.level - 1].answer_time = Math.round((this.time2 - this.time1) / 1000)
        }
        return this.answerdata
    }

    setAnswerData(data: any) {
        this.answerdata = data
    }

    getLevel(): number {
        return this.level
    }

    getRightNum(): number {
        return this.rightNum
    }

    setRightNum(num: number) {
        this.rightNum = num
    }

    getTotalNum(): number {
        return this.totalNum
    }

    setTotalNum(num: number) {
        this.totalNum = num
    }

    getStandardNum(): number {
        return this.standardNum
    }

    setStandardNum(num: number) {
        this.standardNum = num
    }

    clearInterval() {
        this.time1 = 0
        this.time2 = 0
    }

}