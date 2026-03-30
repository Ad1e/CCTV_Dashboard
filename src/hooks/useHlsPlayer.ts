import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

type CameraStatus = "online" | "offline" | "connecting";

interface UseHlsPlayerOptions {
  /** -1 = ABR auto (use for grid), 0 = highest quality (use for modal) */
  startLevel?: number;
  lowLatency?: boolean;
}

interface UseHlsPlayerReturn {
  status: CameraStatus;
  currentLevel: number;
}

export function useHlsPlayer(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  streamUrl: string | undefined,
  options: UseHlsPlayerOptions = {}
): UseHlsPlayerReturn {
  const { startLevel = -1, lowLatency = false } = options;
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<CameraStatus>(
    streamUrl ? "connecting" : "offline"
  );
  const [currentLevel, setCurrentLevel] = useState<number>(-1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) {
      setStatus("offline");
      return;
    }

    setStatus("connecting");

    // Safari supports HLS natively — no hls.js needed
    if (!Hls.isSupported()) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        video.addEventListener("loadedmetadata", () => setStatus("online"), { once: true });
        video.addEventListener("error", () => setStatus("offline"), { once: true });
      } else {
        setStatus("offline");
      }
      return;
    }

    // Destroy previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hls = new Hls({
      startLevel,
      lowLatencyMode: lowLatency,
      maxBufferLength: lowLatency ? 10 : 30,
      maxMaxBufferLength: lowLatency ? 20 : 60,
      enableWorker: true,
    });

    hlsRef.current = hls;

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setStatus("online");
      video.play().catch(() => {
        // Autoplay blocked — muted should always allow it
      });
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
      setCurrentLevel(data.level);
    });

    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            setStatus("offline");
            hls.startLoad(); // try to recover
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            setStatus("connecting");
            hls.recoverMediaError();
            break;
          default:
            setStatus("offline");
            hls.destroy();
            break;
        }
      }
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;
    };
  }, [streamUrl, startLevel, lowLatency]); // eslint-disable-line react-hooks/exhaustive-deps

  return { status, currentLevel };
}
