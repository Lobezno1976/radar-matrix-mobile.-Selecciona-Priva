#!/usr/bin/env python3
"""Fetch public LaLiga odds snapshot without exposing the API key."""
import json, os, pathlib, urllib.parse, urllib.request
from datetime import datetime, timezone
key=os.environ.get("ODDS_API_KEY","")
if not key:
    raise SystemExit("ODDS_API_KEY secret missing; no snapshot published")
base="https://api.the-odds-api.com/v4/sports/soccer_spain_la_liga/odds/"
params=urllib.parse.urlencode({"apiKey":key,"regions":"eu","markets":"h2h,totals","oddsFormat":"decimal"})
request=urllib.request.Request(base+"?"+params,headers={"User-Agent":"RADAR-Matrix/1.0"})
try:
    with urllib.request.urlopen(request,timeout=25) as response:
        raw=json.load(response)
        remaining=response.headers.get("x-requests-remaining")
except Exception as exc:
    # Do not leak request URL containing secret
    raise SystemExit("The Odds API request failed; check account, coverage and quota") from None
if not isinstance(raw,list):
    raise SystemExit("Unexpected response; no snapshot published")
events=[]
for event in raw:
    books=[]
    for book in event.get("bookmakers",[]):
        markets=[]
        for market in book.get("markets",[]):
            markets.append({"key":market.get("key"),"last_update":market.get("last_update"),"outcomes":[{"name":o.get("name"),"point":o.get("point"),"price":o.get("price")} for o in market.get("outcomes",[])]})
        books.append({"key":book.get("key"),"title":book.get("title"),"last_update":book.get("last_update"),"markets":markets})
    events.append({"id":event.get("id"),"home_team":event.get("home_team"),"away_team":event.get("away_team"),"commence_time":event.get("commence_time"),"bookmakers":books})
out={"source":"The Odds API","sport":"soccer_spain_la_liga","retrieved_at":datetime.now(timezone.utc).isoformat(),"requests_remaining":remaining,"events":events,"joint_prices_available":False,"note":"Individual market odds only. No inferred combined prices."}
path=pathlib.Path("data/odds_snapshot.json")
path.parent.mkdir(parents=True,exist_ok=True)
path.write_text(json.dumps(out,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
print("Fetched",len(events),"events; remaining quota:",remaining)
