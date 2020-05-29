import { ConstValue } from "../Data/ConstValue";
import { GameMsgType } from "./GameMsgType";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GameMsg extends cc.Component {
    private static instance: GameMsg;
    static getInstance() {
        if (this.instance == null) {
            this.instance = new GameMsg();
        }
        return this.instance;
    }

    private action_id = 0;

    /**
     * 监听课堂端发出的事件
     * @param key 事件名字
     * @param callBack 响应函数
     */
    public addEvent(key: GameMsgType, callBack) {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].on_client_event(key, callBack);
        }
    }

    /**
     * 资源加载开始
     * @param type 课件类型
     * @param protocol_version 交互课件版本
     */
    public resLoadStart(type?, protocol_version?) {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].res_load_start('courseware_game', '1.1.8');
        }
    }

    /**
     * 资源加载中
     * @param percent 加载百分比
     */
    public resLoading(percent) {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].res_load_process(percent);
        }
    }

    /**
     * 资源加载完成
     */
    public resLoadEnd() {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].res_load_complete();
        }
    }

    /**
     * 游戏开始
     */
    public gameStart() {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].game_start();
        }
    }

    /**
     * 动作同步器
     * @param action_id 当前操作步骤，递增
     * @param actionData 当前操作数据
     */
    public actionSynchro(actionData) {
        if (ConstValue.IS_EDITIONS) {
            this.action_id++;
            window['gameMsg'].action_sync_send(this.action_id, actionData);
        }
    }

    /**
     * 游戏操作过程数据上报
     * @param answer_data 操作过程数据/全量数据
     */
    public answerSyncSend(answer_data) {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].answer_sync_send(answer_data);
        }
    }

    /**
     * 当前游戏数据，用于数据恢复备份
     *
     * @param {*} action_id 恢复数据id
     * @param {*} data 用于备份的数据
     * @memberof GameMsg
     */
    public dataArchival(action_id, data) {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].data_archival(action_id, data);
        }
    }

    /**
     * 当前游戏数据，用于数据恢复备份
     * @param action_id 恢复数据id
     * @param data 用于备份的数据
     */
    public dataRecovery(action_id, data) {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].data_archival(action_id, data);
        }
    }

    /**
     * 游戏完成时用于数据上报的全量数据
     * @param data 游戏全量数据
     */
    public gameOver(data) {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].game_over(data);
        }
    }

    /**
     * 游戏结束，收到stop消息后发送
     */
    public finished() {
        if (ConstValue.IS_EDITIONS) {
            window['gameMsg'].finished();
        }
    }

}
