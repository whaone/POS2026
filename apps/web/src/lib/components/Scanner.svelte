<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ scan: string }>();

  let videoEl: HTMLVideoElement;
  let stream: MediaStream | null = null;
  let scanning = false;
  let manualCode = '';
  let error = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let detector: Record<string, any> | null = null;
  let useFallback = false;
  let animFrame: number;

  const hasNativeDetector = typeof globalThis !== 'undefined' && 'BarcodeDetector' in globalThis;

  onMount(async () => {
    if (hasNativeDetector) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detector = new (globalThis as Record<string, any>).BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'qr_code', 'upc_a', 'upc_e'],
        });
      } catch {
        useFallback = true;
      }
    } else {
      useFallback = true;
    }

    if (useFallback) {
      try {
        const mod = await import('@zxing/browser');
        const { BrowserMultiFormatReader } = mod;
        detector = new BrowserMultiFormatReader();
      } catch {
        error = 'Barcode scanner not available';
      }
    }
  });

  onDestroy(() => {
    stopCamera();
  });

  export async function startCamera() {
    error = '';
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoEl) {
        videoEl.srcObject = stream;
        await videoEl.play();
        scanning = true;
        scanLoop();
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      error = e.message || 'Camera access denied';
    }
  }

  function stopCamera() {
    scanning = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
  }

  async function scanLoop() {
    if (!scanning || !videoEl || !detector) return;

    try {
      if (hasNativeDetector && !useFallback) {
        const results = await detector.detect(videoEl);
        if (results.length > 0) {
          onDetected(results[0].rawValue);
          return;
        }
      } else if (useFallback && detector) {
        const result = detector.decodeFromVideoElement(videoEl);
        if (result && result.getText()) {
          onDetected(result.getText());
          return;
        }
      }
    } catch {
      // ignore decode errors
    }

    if (scanning) {
      animFrame = requestAnimationFrame(() => scanLoop());
    }
  }

  function onDetected(code: string) {
    stopCamera();
    dispatch('scan', code);
  }

  function submitManual() {
    if (manualCode.trim()) {
      dispatch('scan', manualCode.trim());
      manualCode = '';
    }
  }
</script>

<div class="scanner-container">
  {#if error}
    <p class="text-red-500 text-sm mb-2">{error}</p>
  {/if}

  <div class="video-wrapper">
    <video bind:this={videoEl} playsinline muted class="w-full rounded-lg"></video>
  </div>

  <div class="controls mt-3 flex gap-2">
    {#if !scanning}
      <button
        on:click={startCamera}
        class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Start Scanner
      </button>
    {:else}
      <button
        on:click={stopCamera}
        class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
      >
        Stop
      </button>
    {/if}
  </div>

  <div class="manual-input mt-4">
    <!-- svelte-ignore a11y_label_has_associated_control -->
    <label class="block text-sm font-medium text-gray-700 mb-1">Manual Input</label>
    <div class="flex gap-2">
      <input
        type="text"
        bind:value={manualCode}
        placeholder="Enter barcode..."
        class="flex-1 border border-gray-300 rounded-lg px-3 py-2"
        on:keydown={(e) => e.key === 'Enter' && submitManual()}
      />
      <button
        on:click={submitManual}
        class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
      >
        Submit
      </button>
    </div>
  </div>
</div>

<style>
  .video-wrapper {
    position: relative;
    overflow: hidden;
    border-radius: 0.5rem;
    background: #000;
    aspect-ratio: 16 / 9;
  }
  .video-wrapper video {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
</style>
