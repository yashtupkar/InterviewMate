import html2canvas from "html2canvas";

/**
 * Build a shareable caption string for the report.
 */
export function buildCaption(type, score, roleOrTopic, shareUrl = "", template = "professional") {
  const label =
    score >= 75 ? "Impressive" : score >= 50 ? "Solid" : "Learning";

  const subject =
    type === "interview"
      ? `a Mock Interview${roleOrTopic ? ` for ${roleOrTopic}` : ""}`
      : `a Group Discussion${roleOrTopic ? ` on "${roleOrTopic}"` : ""}`;

  const linkStr = shareUrl ? `\n\nReport: ${shareUrl}` : "";

  const templates = {
    professional: `I just completed ${subject} on PlaceMateAI and scored ${score}/100 — ${label} performance! 🚀✨\n\nSharpening my skills one session at a time. Check it out 👇\n#PlaceMateAI #InterviewPrep #CareerGrowth${linkStr}`,
    casual: `Just crushed ${subject} on PlaceMateAI! 🔥 Scored ${score}/100 💪😎 #LevelUp${linkStr}`,
    minimal: `🎯 ${score}/100 on PlaceMateAI${roleOrTopic ? ` — ${roleOrTopic}` : ""}. ${label} performance.${linkStr}`,
  };
  return templates[template] || templates.professional;
}

/**
 * Get the public shareable URL for the report.
 */
export function getShareUrl(type, sessionId) {
  const base = window.location.origin;
  return `${base}/${type === "interview" ? "interview" : "gd"}/result/${sessionId}`;
}

/**
 * Render a DOM element to a PNG blob using html2canvas.
 */
export async function generateShareImage(cardRef) {
  if (!cardRef?.current) return null;
  const canvas = await html2canvas(cardRef.current, {
    useCORS: true,
    backgroundColor: "#0a0a0a",
    scale: 2, // 2× for retina-quality
    logging: false,
  });
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve({ blob, canvas }), "image/png");
  });
}

/**
 * Download the share image as PNG.
 */
export async function downloadShareImage(cardRef, filename = "my-score.png") {
  const result = await generateShareImage(cardRef);
  if (!result) return;
  const url = URL.createObjectURL(result.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Share to a specific platform.
 * Returns true if clipboard copy succeeded or window opened.
 */
export async function shareToPlatform(platform, caption, shareUrl, cardRef) {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedCaption = encodeURIComponent(caption);

  switch (platform) {
    case "linkedin":
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        "_blank",
        "noopener,noreferrer"
      );
      return true;

    case "facebook":
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        "_blank",
        "noopener,noreferrer"
      );
      return true;

    case "twitter":
      window.open(
        `https://twitter.com/intent/tweet?text=${encodedCaption}&url=${encodedUrl}`,
        "_blank",
        "noopener,noreferrer"
      );
      return true;

    case "whatsapp":
      window.open(
        `https://wa.me/?text=${encodedCaption}%20${encodedUrl}`,
        "_blank",
        "noopener,noreferrer"
      );
      return true;

    case "instagram": {
      // Instagram has no direct web share URL — try native share API first
      if (cardRef?.current && navigator.canShare) {
        try {
          const result = await generateShareImage(cardRef);
          if (result?.blob) {
            const file = new File([result.blob], "achievement.png", { type: "image/png" });
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: "My PlaceMateAI Score", text: caption });
              return true;
            }
          }
        } catch {
          // fall through to clipboard copy
        }
      }
      // Fallback: copy link
      await navigator.clipboard.writeText(`${caption}\n\n${shareUrl}`);
      return "copied";
    }

    case "copy":
      await navigator.clipboard.writeText(shareUrl);
      return "copied";

    default:
      return false;
  }
}
