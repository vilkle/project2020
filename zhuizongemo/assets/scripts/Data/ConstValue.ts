/*
 * @Author: 马超
 * @Date: 2020-02-29 14:55:19
 * @LastEditTime: 2020-03-26 16:19:58
 * @Description: 游戏脚本
 * @FilePath: \guanchalifangti\assets\scripts\Data\ConstValue.ts
 */

export class ConstValue {
    public static readonly IS_EDITIONS = true;//是否为发布版本，用于数据上报 及 log输出控制
    public static readonly IS_TEACHER = true;//是否为教师端版本
    public static readonly CONFIG_FILE_DIR = "config/";
    public static readonly PREFAB_UI_DIR = "prefab/ui/panel/";
    public static readonly AUDIO_DIR = "audio/";
    public static readonly CoursewareKey = "zhuibudaemo_169_machao";//每个课件唯一的key 24位随机字符串 可用随机密码生成器来生成。
}

export enum AnswerResult {
    AnswerError = 'answer_error',   //答错
    AnswerRight = 'answer_right',   //答对
    AnswerHalf  = 'answer_half',    //未答完
    NoAnswer    = 'no_answer',      //未作答
}






