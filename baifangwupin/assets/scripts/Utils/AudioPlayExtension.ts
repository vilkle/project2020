import { AudioManager } from "../Manager/AudioManager";

/**期望发音与'resources/audio'文件夹下资源名称的对应配置 */
let AudioConfig = {
    '例': 'sfx_buttn',
    '子': 'sfx_erro'
}

/**音频播放扩展方法 */
export class AudioPlayExtension{

    /**
     * 播放多个音频资源组成的一段内容
     * @param content AudioConfig中的key组成的内容, eg: '例子例子'
     * @param finish 完成回调
     */
    public static playJoinAudio(content:string, finish:Function){
        if(content.length == 0){
            console.warn('playJoinAudio : 内容为空!');
            finish()
            return
        }

        let idx:number = 0
        function next(){
            if(idx > content.length - 1){
                console.log(`'${content}' 播放完成.`);
                finish()
                return
            }

            AudioManager.getInstance().playSound(AudioConfig[content[idx]], false, 1, null, next)
            idx++
        }
        next()
    }
}