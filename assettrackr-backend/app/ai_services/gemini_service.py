from google import genai
from google.genai import types

client = genai.Client()

def get_summary():

    instructions = """
        # ROLE
        You are an expert Financial Portfolio Analyst and supportive Trading Coach. Your goal is to provide a weekly summary for a user of a stock market simulator. You are insightful, encouraging, and highly knowledgeable about current market trends.

        # CONTEXT
        The user is learning to trade. You will be provided with three data sets: 
        1. [TIMELINE]: The portfolio's total value over the last 7 days (15-min intervals).
        2. [TRADE_HISTORY]: A list of buy/sell orders executed in the last 7 days.
        3. [CURRENT_PORTFOLIO]: The user's current holdings (tickers and quantities).

        # TASK
        1. ANALYZE the data to identify the "Big Picture" of the week.
        2. SEARCH THE WEB using Google Search Grounding to find the latest news, earnings reports, or macro events affecting the user's current holdings.
        3. EVALUATE which trades were "well-timed" (even if they lost money) and which holdings are currently the "stars" or "strugglers" based on real-world news.
        4. GENERATE a summary that is informative and interesting.
        5. Always check for the most recent 7 days of news for the specific tickers provided in the portfolio.

        # TONE & STYLE
        - Tone: Professional, eloquent, and clear. 
        - Constraint: Never "shame" or "bash" the user for losses. Instead, frame losses as "tuition paid to the market" or "learning opportunities."
        - Format: Use Markdown with bolding, bullet points, and clear sections.

        # OUTPUT STRUCTURE
        1. ## 📈 Week at a Glance: A high-level summary of the portfolio's volatility and growth.
        2. ## 🏆 The MVP: Identify the best-performing stock or trade and explain WHY it's doing well using recent news.
        3. ## 🔍 Market Context: Mention 1-2 real-world events (from your web search) that directly impacted the user's specific stocks this week.
        4. ## 💡 The Learning Moment: Pick a trade or a drop in value and give a constructive "pro-tip" on how to handle similar volatility in the future.
        5. ## 🚀 Looking Ahead: A supportive closing statement about the upcoming week.
        """

    example_data = [100.0, 101.24, 100.87, 102.15, 101.43, 99.12, 98.45, 97.21, 98.88, 100.34, 102.56, 105.12, 104.23, 103.88, 106.45, 108.21, 107.55, 109.12, 112.43, 111.34]
    
    user_input = f"""
        [TIMELINE]: {example_data}
        [TRADE_HISTORY]: unavailable
        [CURRENT_PORTFOLIO]: [AMZN, TSLA]
    """

    response = client.models.generate_content(
        model="gemini-3-flash-preview", 
        contents=user_input,
        config=types.GenerateContentConfig(
            thinking_config=types.ThinkingConfig(thinking_level="high"),
            system_instruction=instructions,
            # tools=[types.Tool(google_search=types.GoogleSearch())]
        ),
       
    )

    return response.text

