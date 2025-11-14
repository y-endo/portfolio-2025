/**
 * アニメーションループ
 * 各エフェクトを更新してレンダリングを実行
 */

/**
 * アニメーションループを開始
 * @param {Object} context アニメーションに必要なすべてのオブジェクト
 */
export function startAnimationLoop(context) {
  const {
    composer,
    cyberpunkPass,
    stripeManager,
    glitchEffectManager,
    rgbShiftManager,
    bigJitterManager,
    subtleNoiseManager,
  } = context;

  // 前フレームの時刻（秒）
  let previousTime = 0;

  /**
   * アニメーションフレーム処理
   * @param {number} time 経過時間（ミリ秒、requestAnimationFrameから渡される）
   */
  function animate(time) {
    // 次のフレームをリクエスト（60FPS で繰り返し呼び出される）
    requestAnimationFrame(animate);

    // ミリ秒を秒に変換
    const currentTime = (time || 0) * 0.001;

    // 前フレームからの経過時間（デルタタイム）を計算
    const deltaTime = previousTime > 0 ? currentTime - previousTime : 0.016; // 初回は約60FPSと仮定
    previousTime = currentTime;

    // ===== シェーダーの時間パラメータを更新 =====
    cyberpunkPass.uniforms.time.value = currentTime;
    cyberpunkPass.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);

    // ===== 各エフェクトを更新 =====
    // それぞれのマネージャーが内部状態を更新し、必要に応じてシェーダーパラメータを変更
    bigJitterManager.update();
    subtleNoiseManager.update();
    glitchEffectManager.update(deltaTime);
    rgbShiftManager.update(currentTime, deltaTime);

    // ===== ストライプの更新 =====
    // 既存のストライプを更新（寿命管理、減衰など）
    stripeManager.update(deltaTime);

    // 新しいストライプを確率的に生成
    stripeManager.trySpawn(deltaTime);

    // ストライプの状態をシェーダーに反映
    const activeStripeCount = Math.min(stripeManager.getActiveCount(), stripeManager.maxStripes);
    cyberpunkPass.uniforms.stripeCount.value = activeStripeCount;
    cyberpunkPass.uniforms.stripes.value.set(stripeManager.centers);
    cyberpunkPass.uniforms.stripeOffsets.value.set(stripeManager.offsets);
    cyberpunkPass.uniforms.stripeWidths.value.set(stripeManager.widths);

    // ===== 最終レンダリング =====
    // すべてのポストプロセッシングエフェクトを適用して画面に描画
    composer.render();
  }

  // アニメーションループを開始
  animate(0);
}
