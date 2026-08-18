from datetime import datetime, timezone
import html

async def normalise_company_news_api_resp(news: list[dict], general_feed: bool) -> list[dict]:
    """
    Normalises company news api response from Finnhub by renaming some columns to work with db 
    schema and added some extra fields.

    Parameters:
        news: list of dictionaries where each dict is a news item the api reponded with
        general_feed: boolean variable indicating whether these news articles are for general
        feed or not.
    """
    news_normalised = []

    for item in news:
        news_dict = {
            "finnhub_id": item["id"],
            "category": item["category"],
            "headline": clean_html_tags(item["headline"]),
            "image_url": item["image"],
            "source": clean_html_tags(item["source"]),
            "summary": clean_html_tags(item["summary"]),
            "article_url": item["url"],
            "general_feed": general_feed,
            "published_at": timestamp_to_datetime(item["datetime"])
        }
        news_normalised.append(news_dict)

    return news_normalised
        

def timestamp_to_datetime(timestamp: int) -> datetime:
    """
    Converts unix timestamp into a datetime object.

    Parameters:
        timestamp: unix based timestamp
    """
    return datetime.fromtimestamp(timestamp, tz=timezone.utc)


def clean_html_tags(text: str) -> str:
    """
    Cleans a string by removing all HTML tags

    Parameters:
        text: the string to clean
    """
    return html.unescape(text)
