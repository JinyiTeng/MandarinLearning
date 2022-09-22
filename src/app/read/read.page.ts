import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { AppPage } from 'e2e/src/app.po';
import Recorder from 'js-audio-recorder';
import { AppNet } from '../app.net';
import { PageBase } from '../app.page';
import { AppStore } from '../app.store';
import Player from '../utils/player/player';
import { encodeWAV } from '../utils/transform/transform';

let recorder = null;
let playTimer = null;
let oCanvas = null;
let ctx = null;
let drawRecordId = null;
let pCanvas = null;
let pCtx = null;
let drawPlayId = null;

@Component({
  selector: 'app-read',
  templateUrl: './read.page.html',
  styleUrls: ['./read.page.scss'],
})
export class ReadPage extends PageBase implements OnInit {
  state = {
    sampleBit: 16,
    sampleRate: 16000,
    numChannel: 1,
    compiling: false,
    isRecording: false, // 是否正在录音
    duration: 0,
    fileSize: 0,
    vol: 0,
  };

  constructor(
    protected appStore: AppStore,
    protected navCtrl: NavController,
    public route: ActivatedRoute
  ) {
    super(appStore, navCtrl, route);
  }


  ngOnInit() {
    this.componentDidMount();
  }

  json(v) {
    return JSON.stringify(v, null, ' ');
  }

  setState(v: any) { }

  changeSampleRate(e, params) {
    this.setState({
      sampleRate: params.value,
    });
  }
  changeSampleBit(e, params) {
    this.setState({
      sampleBit: params.value,
    });
  }
  changeNumChannel(e, params) {
    this.setState({
      numChannel: params.value,
    });
  }
  changeCompile(e, { checked }) {
    this.setState({
      compiling: checked,
    });
  }

  collectData() {
    return {
      sampleBits: this.state.sampleBit,
      sampleRate: this.state.sampleRate,
      numChannels: this.state.numChannel,
      compiling: this.state.compiling, // 是否开启边录音边转化（后期改用web worker）
    };
  }

  modifyOption() {
    if (recorder) {
      const config = this.collectData();

      recorder.setOption(config);

      recorder = null;
    }
  }
  // 录音开启
  startRecord() {
    this.clearPlay();

    const config = this.collectData();

    if (!recorder) {
      recorder = new Recorder(config);

      recorder.onprocess = function (duration) {
        // this.setState({
        //     duration: duration.toFixed(5),
        // });
        // 推荐使用 onprogress
      };

      recorder.onprogress = (params: any) => {
        // console.log(recorder.duration);
        // console.log(recorder.fileSize);

        this.setState({
          duration: params.duration.toFixed(5),
          fileSize: params.fileSize,
          vol: params.vol.toFixed(2),
        });
        // 此处控制数据的收集频率
        if (config.compiling) {
          console.log('音频总数据：', params.data);
        }
      };

      recorder.onplay = () => {
        console.log('%c回调监听，开始播放音频', 'color: #2196f3');
      };
      recorder.onpauseplay = () => {
        console.log('%c回调监听，暂停播放音频', 'color: #2196f3');
      };
      recorder.onresumeplay = () => {
        console.log('%c回调监听，恢复播放音频', 'color: #2196f3');
      };
      recorder.onstopplay = () => {
        console.log('%c回调监听，停止播放音频', 'color: #2196f3');
      };
      recorder.onplayend = () => {
        console.log('%c回调监听，音频已经完成播放', 'color: #2196f3');
        // 播放结束后，停止绘制canavs
        this.stopDrawPlay();
      };

      // 定时获取录音的数据并播放
      config.compiling &&
        (playTimer = setInterval(() => {
          if (!recorder) {
            return;
          }

          let newData = recorder.getNextData();
          if (!newData.length) {
            return;
          }
          let byteLength = newData[0].byteLength;
          let buffer = new ArrayBuffer(newData.length * byteLength);
          let dataView = new DataView(buffer);

          // 数据合并
          for (let i = 0, iLen = newData.length; i < iLen; ++i) {
            for (let j = 0, jLen = newData[i].byteLength; j < jLen; ++j) {
              dataView.setInt8(i * byteLength + j, newData[i].getInt8(j));
            }
          }

          // 将录音数据转成WAV格式，并播放
          let a = encodeWAV(
            dataView,
            config.sampleRate,
            config.sampleRate,
            config.numChannels,
            config.sampleBits
          );
          let blob: any = new Blob([a], { type: 'audio/wav' });

          blob.arrayBuffer().then((arraybuffer) => {
            Player.play(arraybuffer);
          });
        }, 3000));
    } else {
      recorder.stop();
    }

    recorder.start().then(
      () => {
        console.log('开始录音');
      },
      (error) => {
        console.log(`异常了,${error.name}:${error.message}`);
      }
    );
    // 开始绘制canvas
    this.drawRecord();
  }

  // 开始绘制canvas
  drawRecord() {
    // 用requestAnimationFrame稳定60fps绘制
    drawRecordId = requestAnimationFrame(() => {
      this.drawRecord();
    });

    // 实时获取音频大小数据
    let dataArray = recorder.getRecordAnalyseData(),
      bufferLength = dataArray.length;

    // 填充背景色
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, oCanvas.width, oCanvas.height);

    // 设定波形绘制颜色
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';

    ctx.beginPath();

    var sliceWidth = (oCanvas.width * 1.0) / bufferLength, // 一个点占多少位置，共有bufferLength个点要绘制
      x = 0; // 绘制点的x轴位置

    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = (v * oCanvas.height) / 2;

      if (i === 0) {
        // 第一个点
        ctx.moveTo(x, y);
      } else {
        // 剩余的点
        ctx.lineTo(x, y);
      }
      // 依次平移，绘制所有点
      x += sliceWidth;
    }

    ctx.lineTo(oCanvas.width, oCanvas.height / 2);
    ctx.stroke();
  }

  drawPlay() {
    // 用requestAnimationFrame稳定60fps绘制
    drawPlayId = requestAnimationFrame(() => {
      this.drawPlay();
    });

    // 实时获取音频大小数据
    let dataArray = recorder.getPlayAnalyseData(),
      bufferLength = dataArray.length;

    // 填充背景色
    pCtx.fillStyle = 'rgb(200, 200, 200)';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);

    // 设定波形绘制颜色
    pCtx.lineWidth = 2;
    pCtx.strokeStyle = 'rgb(0, 0, 0)';

    pCtx.beginPath();

    var sliceWidth = (pCanvas.width * 1.0) / bufferLength, // 一个点占多少位置，共有bufferLength个点要绘制
      x = 0; // 绘制点的x轴位置

    for (var i = 0; i < bufferLength; i++) {
      var v = dataArray[i] / 128.0;
      var y = (v * pCanvas.height) / 2;

      if (i === 0) {
        // 第一个点
        pCtx.moveTo(x, y);
      } else {
        // 剩余的点
        pCtx.lineTo(x, y);
      }
      // 依次平移，绘制所有点
      x += sliceWidth;
    }

    pCtx.lineTo(pCanvas.width, pCanvas.height / 2);
    pCtx.stroke();
  }
  // 暂停
  pauseRecord() {
    if (recorder) {
      recorder.pause();
      console.log('暂停录音');
      drawRecordId && cancelAnimationFrame(drawRecordId);
      drawRecordId = null;
    }
  }
  resumeRecord() {
    recorder && recorder.resume();
    console.log('恢复录音');
    this.drawRecord();
  }
  //录音停止
  endRecord() {
    recorder && recorder.stop();
    console.log('结束录音');
    drawRecordId && cancelAnimationFrame(drawRecordId);
    drawRecordId = null;
  }
  // 播放录音
  playRecord() {
    recorder && recorder.play();
    drawRecordId && cancelAnimationFrame(drawRecordId);
    drawRecordId = null;
    console.log('播放录音');
    recorder && this.drawPlay();
    // setInterval(() => {
    //     recorder.getPlayTime()
    // }, 500)
  }
  pausePlay() {
    this.stopDrawPlay();
    recorder && recorder.pausePlay();
    console.log('暂停播放');
  }
  resumePlay() {
    recorder && recorder.resumePlay();
    console.log('恢复播放');
    this.drawPlay();
  }
  clearPlay() {
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
    if (drawRecordId) {
      cancelAnimationFrame(drawRecordId);
      drawRecordId = null;
    }
    this.stopDrawPlay();
  }
  stopDrawPlay = () => {
    drawPlayId && cancelAnimationFrame(drawPlayId);
    drawPlayId = null;
  };
  stopPlay() {
    this.clearPlay();
    recorder && recorder.stopPlay();
    console.log('停止播放');
    this.stopDrawPlay();
  }
  destroyRecord() {
    this.clearPlay();
    if (recorder) {
      recorder.destroy().then(() => {
        console.log('销毁实例');
        recorder = null;
        drawRecordId && cancelAnimationFrame(drawRecordId);
        this.stopDrawPlay();
      });
    }
  }
  downloadPCM() {
    if (recorder) {
      console.log('pcm: ', recorder.getPCMBlob());
      recorder.downloadPCM();
    }
  }
  downloadWAV() {
    if (recorder) {
      console.log('wav: ', recorder.getWAVBlob());
      recorder.downloadWAV();
    }
  }

  uploadAudio(e: any) {
    e.target.files[0].arrayBuffer().then((arraybuffer) => {
      Player.play(arraybuffer);
    });
  }

  componentDidMount() {
    oCanvas = document.getElementById('canvas');
    ctx = oCanvas.getContext('2d');
    pCanvas = document.getElementById('playChart');
    pCtx = pCanvas.getContext('2d');
  }
  files = '';
  async bbb() {
    let wavBlob = recorder.getWAVBlob()
    console.log(wavBlob);
    let renameFile = new File([wavBlob], '文件名.wav', { type: 'audio/wav' })
    const formData = new FormData();
    formData.append('file', renameFile);
    console.log(renameFile);
    console.log(formData);
    const res = await AppNet.upload('/api/user/user/upload', formData);
    console.log(res);
    if (!res || res.code !== 'success') {
      this.toast(res.message)
    }
    this.files  = res.data.uuid;
  }
}
