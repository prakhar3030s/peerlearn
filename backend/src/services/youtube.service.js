// YouTube metadata service.
// Uses YouTube Data API v3 when a YOUTUBE_API_KEY is configured.
// Falls back to minimal placeholders if the API key is missing or a call fails.

function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1];
      }
      const shorts = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shorts && shorts[1]) {
        return shorts[1];
      }
    }
  } catch {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    if (match) return match[1];
  }
  return null;
}

// Convert an ISO 8601 YouTube duration (e.g. "PT4M6S", "PT1H2M3S") to a human
// readable "m:ss" or "h:mm:ss" string for display on cards.
function isoDurationToHuman(iso) {
  if (!iso || typeof iso !== "string") return "0:00";
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  const totalMinutes = hours * 60 + minutes;
  const mm = String(hours > 0 ? minutes : totalMinutes).padStart(
    hours > 0 ? 2 : 1,
    "0"
  );
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${totalMinutes}:${ss}`;
}

export async function fetchVideoMetadata(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return {
      videoId: null,
      title: "Video Explanation",
      thumbnail: null,
      duration: "0:00",
      durationISO: "PT0S",
    };
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  // If no API key is configured, return basic metadata with thumbnail but
  // without a fabricated duration. The UI will simply omit the duration pill.
  if (!apiKey) {
    return {
      videoId,
      title: `Video Explanation — ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: null,
      durationISO: null,
    };
  }

  try {
    const urlObj = new URL("https://www.googleapis.com/youtube/v3/videos");
    urlObj.searchParams.set("id", videoId);
    urlObj.searchParams.set("part", "contentDetails,snippet");
    urlObj.searchParams.set("key", apiKey);

    const response = await fetch(urlObj.toString());
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    const json = await response.json();
    const item = json.items && json.items[0];

    if (!item) {
      throw new Error("No video found for provided ID");
    }

    const iso = item.contentDetails?.duration || "PT0S";
    const human = isoDurationToHuman(iso);
    const title = item.snippet?.title || `Video Explanation — ${videoId}`;

    return {
      videoId,
      title,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: human,
      durationISO: iso,
    };
  } catch (err) {
    console.error("Failed to fetch YouTube metadata", err);
    // Graceful fallback: still return basic data so submission works.
    return {
      videoId,
      title: `Video Explanation — ${videoId}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      duration: null,
      durationISO: null,
    };
  }
}

