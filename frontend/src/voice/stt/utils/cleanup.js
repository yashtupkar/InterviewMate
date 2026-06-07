export function cleanupEventListeners(obj, eventNames) {
  if (!obj) return;
  for (const event of eventNames) {
    try {
      obj[`on${event}`] = null;
    } catch (e) {
      console.warn('[STT:Cleanup] Failed to remove event listener:', event, e);
    }
  }
}

export function stopMediaStream(stream) {
  if (!stream) return;
  try {
    stream.getTracks().forEach(track => {
      track.enabled = false;
      track.stop();
    });
  } catch (e) {
    console.warn('[STT:Cleanup] Failed to stop media stream:', e);
  }
}

export function closeWebSocket(ws) {
  if (!ws) return;
  try {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  } catch (e) {
    console.warn('[STT:Cleanup] Failed to close WebSocket:', e);
  }
}
