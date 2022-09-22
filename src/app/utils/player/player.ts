import { throwError } from '../exception/exception'

declare let window: any;

let source: any = null;
let playTime: number = 0;       // 相对时间，记录暂停位置
let playStamp: number = 0;      // 开始或暂停后开始的时间戳(绝对)
let context: any = null;
let analyser: any = null;

let audioData: any = null;
// let hasInit: boolean = false;           // 是否已经初始化了
let isPaused: boolean = false;
let totalTime: number = 0;
let endplayFn: any = function() {};

/**
 * 初始化
 */
function init(): void {
    context = new (window.AudioContext || window.webkitAudioContext)();
    analyser = context.createAnalyser();
    analyser.fftSize = 2048;                   // 表示存储频域的大小
}

/**
 * play
 * @returns {Promise<{}>}
 */
function playAudio(): Promise<{}> {
    isPaused = false;

    return context.decodeAudioData(audioData.slice(0), buffer => {
        source = context.createBufferSource();

        source.onended = () => {
            if (!isPaused) {  
                totalTime = context.currentTime - playStamp + playTime;
                endplayFn();
            }

        }


        source.buffer = buffer;
        source.connect(analyser);
        analyser.connect(context.destination);
        source.start(0, playTime);

        playStamp = context.currentTime;
    }, function(e) {
        throwError(e);
    });
}

function destroySource() {
    if (source) {
        source.stop();
        source = null;
    }
}

export default class Player {
    /**
     * play record
     * @static
     * @param {ArrayBuffer} arraybuffer
     * @memberof Player
     */
    static play(arraybuffer): Promise<{}> {
        if (!context) {
            init();
        }
        this.stopPlay();
        audioData = arraybuffer;
        totalTime = 0;

        return playAudio();
    }

    /**
     * 暂停播放录音
     * @memberof Player
     */
    static pausePlay(): void {
        destroySource();
        playTime += context.currentTime - playStamp;
        isPaused = true;
    }

    static resumePlay(): Promise<{}> {
        return playAudio();
    }

    /**
     * 停止播放
     * @memberof Player
     */
    static stopPlay() {
        playTime = 0;
        audioData = null;

        destroySource();
    }

    static destroyPlay() {
        this.stopPlay();
    }

    static getAnalyseData() {
        let dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(dataArray);

        return dataArray;
    }

    static addPlayEnd(fn: any = function() {}) {
        endplayFn = fn;
    }

    // 获取已经播放的时长
    static getPlayTime(): number {
        let pTime = isPaused ? playTime : context.currentTime - playStamp + playTime;

        return totalTime || pTime;
    }
}
