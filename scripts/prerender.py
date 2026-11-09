#!/usr/bin/env python3
"""Write the English text from assets/i18n/en.json into index.html.

Without this the page text only exists after JavaScript runs. js/i18n.js still
replaces it when a visitor picks another language.

Run after changing en.json:  python3 scripts/prerender.py
Check only, change nothing:  python3 scripts/prerender.py --check

Keys in SKIP stay out of the HTML (the email is added by JavaScript only).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGE = ROOT / "index.html"
SKIP = {"about.email"}
OPEN_TAG = re.compile(r'<([a-zA-Z0-9]+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>')


def lookup(dictionary, key):
    value = dictionary
    for part in key.split("."):
        value = value[part]
    return value


def close_position(html, tag, start):
    """Return where the closing tag matching an element opened before start begins."""
    pattern = re.compile(rf"<(/?){tag}\b[^>]*>", re.IGNORECASE)
    depth = 1
    for match in pattern.finditer(html, start):
        if match.group(0).endswith("/>"):
            continue
        depth += -1 if match.group(1) else 1
        if depth == 0:
            return match.start()
    raise ValueError(f"no closing </{tag}> after position {start}")


def render(html, dictionary):
    output, position = [], 0
    while True:
        match = OPEN_TAG.search(html, position)
        if match is None:
            output.append(html[position:])
            return "".join(output)
        tag, key = match.groups()
        end = close_position(html, tag, match.end())
        text = "" if key in SKIP else lookup(dictionary, key)
        output.append(html[position:match.end()])
        output.append(text)
        position = end


def main():
    dictionary = json.loads((ROOT / "assets/i18n/en.json").read_text(encoding="utf-8"))
    current = PAGE.read_text(encoding="utf-8")
    rendered = render(current, dictionary)
    if "--check" in sys.argv:
        if rendered != current:
            sys.exit("index.html is out of date: run python3 scripts/prerender.py")
        print("index.html is up to date")
        return
    PAGE.write_text(rendered, encoding="utf-8")
    print("index.html updated" if rendered != current else "index.html already up to date")


if __name__ == "__main__":
    main()
