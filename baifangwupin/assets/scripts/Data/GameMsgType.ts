export enum GameMsgType {
    ACTION_SYNC_RECEIVE     = "action_sync_receive",    //游戏操作交互同步  //交互游戏暂不处理此消息
    DISABLED                = "disabled",               //是否可以操作游戏 0禁用 1开启 默认1  //交互游戏暂不处理此消息
    RELOAD                  = "reload",                 //重新加载游戏  //在index.html监听
    DATA_RECOVERY           = "data_recovery",          //游戏数据恢复
    STOP                    = "stop",                   //停止游戏（游戏需要返回finish）
    INIT                    = "init",                   //恢复游戏到初始化界面
    THRESHHOLD              = "threshhold"              //游戏消息频率（默认100ms/次）
}