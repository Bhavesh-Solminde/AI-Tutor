import { createLogger } from "../config/logger";

const log = createLogger("pipeline:youtubeSearch");

export interface YouTubeVideo {
  title: string;
  videoId: string;
  channelName: string;
  thumbnail: string;
  url: string;
}

/**
 * Searches YouTube for educational videos on a given topic.
 * Uses the YouTube Data API v3 (free tier: 10,000 units/day).
 * Falls back to Tavily web search if API key is not configured.
 */
export async function searchYouTubeVideos(
  topicName: string,
  maxResults: number = 3
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (apiKey) {
    try {
      // Use YouTube Data API v3
      const query = encodeURIComponent(`${topicName} tutorial explanation`);
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=${maxResults}&relevanceLanguage=en&videoCategoryId=27&key=${apiKey}`;

      const response = await fetch(url);
      const data = (await response.json()) as any;

      if (data.items) {
        return data.items.map((item: any) => ({
          title: item.snippet.title,
          videoId: item.id.videoId,
          channelName: item.snippet.channelTitle,
          thumbnail: item.snippet.thumbnails.medium.url,
          url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        }));
      }
    } catch (err: any) {
      log.warn("YouTube Data API search failed, trying fallback", { error: err.message });
    }
  }

  // Fallback: Use Tavily to search for YouTube videos
  try {
    const { TavilySearch } = await import("@langchain/tavily");
    // Ensure we pass the api key if needed, or rely on environment TAVILY_API_KEY
    const search = new TavilySearch({ maxResults: maxResults });
    const results = await search.invoke({
      query: `site:youtube.com ${topicName} tutorial explanation`,
    });
    // Parse Tavily results to extract YouTube URLs
    let parsed: any;
    if (typeof results === "string") {
      try {
        parsed = JSON.parse(results);
      } catch {
        // Tavily might return string summary or JSON string.
        // Let's fallback to parsing using regex or extract URLs if parsing fails.
        parsed = { results: [] };
      }
    } else {
      parsed = results;
    }

    const items = parsed.results || [];
    return items
      .filter((r: any) => r.url?.includes("youtube.com/watch"))
      .slice(0, maxResults)
      .map((r: any) => {
        let vId = "";
        try {
          vId = new URL(r.url).searchParams.get("v") || "";
        } catch {
          // Ignore URL parsing errors
        }
        return {
          title: r.title || topicName,
          videoId: vId,
          channelName: "",
          thumbnail: vId ? `https://img.youtube.com/vi/${vId}/mqdefault.jpg` : "",
          url: r.url,
        };
      });
  } catch (err: any) {
    log.warn("YouTube fallback search failed", { error: err.message });
    return [];
  }
}
