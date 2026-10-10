import { useEffect } from "react";
import { setupPreviewHostBridge } from "../lib/preview-host-bridge";

export function PreviewHostBridge() {
  useEffect(() => {
    return setupPreviewHostBridge();
  }, []);
  return null;
}
