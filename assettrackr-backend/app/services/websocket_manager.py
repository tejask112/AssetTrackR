# manage the websockets

# model:
#
#                                                            /---WS---> client 1
#   Finnhub <----WS----> AssetTrackR websocket_manager.py  <----WS----> client 2
#                                                            \---WS---> client 3
#

# when client connects to websocket_manager:
#   are we already connected to finnhub?
#       yes -> pass
#       no -> set up a websocket connection with finhubb
#   subscribe the symbol/ticker to the websocket request to finhubb
#   receive the latest price for all the subscribed symbol/tickers
#   go through each one, and send the latest price back to the client who requested it