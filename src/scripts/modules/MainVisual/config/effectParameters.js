/**
 * エフェクトパラメータ設定
 * すべての視覚効果のパラメータを一箇所で管理します
 */

export const effectParameters = {
  // ===== RGB カラーシフト効果 =====
  // RGB チャンネルを個別にずらすことでグリッチ感を演出
  rgbShift: {
    // 1秒あたりの発生頻度（低いほど間隔が長くなり、インパクトが増す）
    triggerRate: 0.45,
    // パルスの減衰速度（秒単位、高いほど素早く消える）
    residualDecay: 18.0,
    // ずれ幅の最小値（UV座標単位）
    minAmplitude: 0.006,
    // ずれ幅の最大値（UV座標単位）
    maxAmplitude: 0.012,
  },

  // ===== 大きなジッター効果 =====
  // 画面全体が一瞬大きく揺れる効果
  bigJitter: {
    // フレームごとの発生確率（0.0-1.0）
    probability: 0.014,
    // 効果の持続時間（秒）
    duration: 0.21658,
    // ずれの振幅（UV座標単位）
    amplitude: 0.02,
  },

  // ===== 微細なノイズ効果 =====
  // 画像全体にわずかな揺らぎを加える
  subtleNoise: {
    // 初期振幅（通常時）
    baseAmplitude: 0.0,
    // 強調時の振幅倍率
    enhancedMultiplier: 2.5,
    // 強調効果の発生確率（フレームごと）
    enhanceProbability: 0.006,
    // 強調効果の最小持続時間（ミリ秒）
    enhanceMinDuration: 200,
    // 強調効果の最大持続時間（ミリ秒）
    enhanceMaxDuration: 600,
  },

  // ===== 走査線エフェクト =====
  // ブラウン管テレビのような水平ラインを描画
  scanline: {
    // ラインの強度（0.0-1.0、高いほど濃い）
    intensity: 0.12,
    // ラインの密度（高いほど細かい）
    frequency: 1.5,
  },

  // ===== ビネット効果 =====
  // 画面の四隅を暗くする効果（0.0で無効、1.0で最大）
  vignette: {
    strength: 0.6,
  },

  // ===== 彩度調整 =====
  // 画像全体の色の鮮やかさ（0.0でモノクロ、1.0でそのまま）
  saturation: 1.0,

  // ===== ストライプエフェクト =====
  // 画面上にランダムに出現する横帯による歪み効果
  stripe: {
    // 新しいストライプの発生確率（フレームごと）
    spawnRate: 0.018,
    // 同時に表示される最大数
    maxCount: 3,
    // ストライプの幅（UV座標単位）
    width: 0.00725,
    // ストライプの最小寿命（秒）
    minLifetime: 0.2,
    // ストライプの最大寿命（秒）
    maxLifetime: 0.8,
    // 横方向のずれ幅の最小値
    minOffset: 0.04,
    // 横方向のずれ幅の最大値
    maxOffset: 0.22,
    // オフセットの減衰率（フレームごとに掛ける値、1.0未満）
    offsetDecay: 0.98,
    // 幅の減衰率（フレームごとに掛ける値、1.0未満）
    widthDecay: 0.97,
  },

  // ===== GlitchPass エフェクト =====
  // Three.js標準のグリッチエフェクト
  glitchPass: {
    // エフェクトを使用するか
    enabled: true,
    // 強いグリッチの発生確率（フレームごと）
    probability: 0.001,
    // 強いグリッチの持続時間（ミリ秒）
    duration: 120,
    // 再発生までの最小間隔（ミリ秒）
    minInterval: 3000,
    // 残響の減衰速度（秒単位、高いほど早く消える）
    residualDecay: 1.6,
    // goWild（最強モード）の発動確率
    goWildProbability: 0.2,
    // smallAmp への残響効果の係数
    residualSmallAmplitude: 0.0,
    // bigAmp への残響効果の係数
    residualBigAmplitude: 0.0,
  },
};

/**
 * シェーダー定数
 * GLSLシェーダーで使用する固定値
 */
export const shaderConstants = {
  // ストライプの最大配列サイズ（GLSLでは固定長配列が必要）
  maxStripes: 8,
};
