/**
 * ビッグジッターエフェクト管理
 * 画面全体が一瞬大きく揺れる効果を制御
 */

import { effectParameters } from '../config/effectParameters.js';

/**
 * ビッグジッターエフェクトの状態を管理するクラス
 */
export class BigJitterManager {
  /**
   * @param {Object} shaderPass カスタムシェーダーのShaderPassインスタンス
   */
  constructor(shaderPass) {
    this.shaderPass = shaderPass;

    // 現在の効果のタイムアウトID
    this.timeoutId = null;
  }

  /**
   * ビッグジッターエフェクトを更新（フレームごとに呼び出す）
   */
  update() {
    const config = effectParameters.bigJitter;

    // 確率的に効果を発動
    if (Math.random() < config.probability) {
      this.trigger();
    }
  }

  /**
   * ビッグジッター効果を発動
   */
  trigger() {
    const config = effectParameters.bigJitter;

    // 既存のタイムアウトをクリア（連続発動を防ぐ）
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    // 効果を有効化
    this.shaderPass.uniforms.bigActive.value = 1.0;

    // 一定時間後に効果を無効化
    const durationMs = Math.max(10, Math.floor(config.duration * 1000));
    this.timeoutId = setTimeout(() => {
      this.shaderPass.uniforms.bigActive.value = 0.0;
      this.timeoutId = null;
    }, durationMs);
  }

  /**
   * クリーンアップ（インスタンス破棄時に呼び出す）
   */
  dispose() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
