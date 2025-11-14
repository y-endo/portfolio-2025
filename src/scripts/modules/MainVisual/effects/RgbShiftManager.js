/**
 * RGBカラーシフトエフェクト管理
 * 各色チャンネル（赤・緑・青）を個別にずらすことで
 * デジタルグリッチのような色収差効果を演出
 */

import { effectParameters } from '../config/effectParameters.js';

/**
 * RGBシフトエフェクトの状態を管理するクラス
 */
export class RgbShiftManager {
  /**
   * @param {Object} shaderPass カスタムシェーダーのShaderPassインスタンス
   */
  constructor(shaderPass) {
    this.shaderPass = shaderPass;

    // パルス強度（0.0-1.0）
    // 発動時に1.0になり、時間で減衰していく
    this.pulseIntensity = 0.0;

    // 最後に発動した時刻（秒）
    this.lastTriggerTime = 0;
  }

  /**
   * RGBシフトエフェクトを更新（フレームごとに呼び出す）
   * @param {number} currentTime 現在の経過時間（秒）
   * @param {number} deltaTime 前フレームからの経過時間（秒）
   */
  update(currentTime, deltaTime) {
    const config = effectParameters.rgbShift;

    // ===== 1. 確率的な発動 =====
    // triggerRate（1秒あたりの発生回数）から発動タイミングを決定
    const timeSinceLastTrigger = currentTime - this.lastTriggerTime;
    const minimumInterval = 1.0 / Math.max(0.0001, config.triggerRate);

    // 最小間隔が経過していて、かつ確率判定を通過したら発動
    if (timeSinceLastTrigger >= minimumInterval && Math.random() < 0.7) {
      this.trigger();
    }

    // ===== 2. パルス強度の減衰 =====
    if (this.pulseIntensity > 0) {
      this.pulseIntensity = Math.max(0, this.pulseIntensity - config.residualDecay * deltaTime);
    }

    // ===== 3. シェーダーに強度を反映 =====
    this.shaderPass.uniforms.rgbPulse.value = this.pulseIntensity;
  }

  /**
   * RGBシフトを発動
   */
  trigger() {
    const config = effectParameters.rgbShift;

    // 発動時刻を記録
    this.lastTriggerTime = performance.now() * 0.001; // ミリ秒→秒

    // ===== 各チャンネルのずれ量を決定 =====
    // ランダムな振幅を生成
    const amplitude = config.minAmplitude + Math.random() * (config.maxAmplitude - config.minAmplitude);

    // 各チャンネルをランダムな方向（左 or 右）にずらす
    // 係数を変えることで、各チャンネルのずれ幅に差をつける
    const redShift = (Math.random() < 0.5 ? -1 : 1) * amplitude;
    const greenShift = (Math.random() < 0.5 ? -1 : 1) * amplitude * 0.9;
    const blueShift = (Math.random() < 0.5 ? -1 : 1) * amplitude * 0.8;

    // シェーダーに各チャンネルのずれ量を設定
    this.shaderPass.uniforms.rgbShiftRed.value = redShift;
    this.shaderPass.uniforms.rgbShiftGreen.value = greenShift;
    this.shaderPass.uniforms.rgbShiftBlue.value = blueShift;

    // パルス強度を最大に設定（これから減衰していく）
    this.pulseIntensity = 1.0;
  }
}
