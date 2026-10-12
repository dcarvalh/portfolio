#!/usr/bin/env python3
"""Point links that have a fallback at the first candidate that is live.

Reads .github/link-fallbacks.toml (see the comments there). Run from the
repository root. When a file is changed, writes changed=true and a summary
of the swaps to $GITHUB_OUTPUT for the workflow to commit.
"""
import http.client
import os
import time
import tomllib
import urllib.request

CONFIG = ".github/link-fallbacks.toml"
USER_AGENT = "Mozilla/5.0 (compatible; portfolio-link-check)"
# Same retry policy as lychee.toml.
ATTEMPTS = 3
RETRY_WAIT = 5


def is_live(url, expect):
    for attempt in range(ATTEMPTS):
        if attempt:
            time.sleep(RETRY_WAIT)
        try:
            request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(request, timeout=20) as response:
                body = response.read().decode("utf-8", "replace")
        except (OSError, http.client.HTTPException) as error:
            print(f"  {url}: {error}")
            continue
        if expect.lower() in body.lower():
            return True
        print(f"  {url}: loads, but doesn't contain {expect!r}")
        return False
    return False


def main():
    with open(CONFIG, "rb") as f:
        links = tomllib.load(f)["link"]

    swaps = []
    for link in links:
        path = link["file"]
        candidates = link["candidates"]
        with open(path, encoding="utf-8") as f:
            text = f.read()

        # Match the quoted attribute value so one URL can't match inside another.
        present = [c["url"] for c in candidates if f'"{c["url"]}"' in text]
        if len(present) != 1:
            print(f"::warning file={path}::{CONFIG}: expected one of these links in "
                  f"{path}, found {len(present)}: {[c['url'] for c in candidates]}")
            continue
        current = present[0]

        print(f"{path}: checking fallbacks for {current}")
        live = next((c["url"] for c in candidates if is_live(c["url"], c["expect"])), None)
        if live is None:
            print("  none of the candidates are live, leaving it for lychee to report")
        elif live == current:
            print("  current link is the first live candidate")
        else:
            with open(path, "w", encoding="utf-8") as f:
                f.write(text.replace(f'"{current}"', f'"{live}"'))
            swaps.append(f"{path}: {current} -> {live}")
            print(f"  switched to {live}")

    output = os.environ.get("GITHUB_OUTPUT")
    if output:
        with open(output, "a", encoding="utf-8") as f:
            f.write(f"changed={'true' if swaps else 'false'}\n")
            f.write("summary<<EOF\n" + "\n".join(swaps) + "\nEOF\n")


if __name__ == "__main__":
    main()
