/**
 * サブトルノイズエフェクト管理
 * 画像全体にわずかな揺らぎを加えて質感を向上させる効果
 */

import { effectParameters } from '../config/effectParameters.js';

/**
 * サブトルノイズエフェクトの状態を管理するクラス
 */
export class SubtleNoiseManager {
  /**
   * @param {Object} shaderPass カスタムシェーダーのShaderPassインスタンス
   */
  constructor(shaderPass) {
    this.shaderPass = shaderPass;

    // 基本の振幅（通常時の値）
    this.baseAmplitude = effectParameters.subtleNoise.baseAmplitude;

    // 現在の強調効果のタイムアウトID
    this.timeoutId = null;
  }

  /**
   * サブトルノイズエフェクトを更新（フレームごとに呼び出す）
   */
  update() {
    const config = effectParameters.subtleNoise;

    // 確率的に一時的な強調を発動
    if (Math.random() < config.enhanceProbability) {
      this.enhance();
    }
  }

  /**
   * 一時的にノイズを強調
   */
  enhance() {
    const config = effectParameters.subtleNoise;

    // 既存のタイムアウトをクリア（連続強調を防ぐ）
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    // 振幅を一時的に増加
    const originalValue = this.shaderPass.uniforms.smallAmplitude.value;
    this.shaderPass.uniforms.smallAmplitude.value = originalValue * config.enhancedMultiplier;

    // ランダムな時間後に元に戻す
    const durationMs = Math.floor(
      config.enhanceMinDuration + Math.random() * (config.enhanceMaxDuration - config.enhanceMinDuration)
    );

    this.timeoutId = setTimeout(() => {
      this.shaderPass.uniforms.smallAmplitude.value = originalValue;
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
