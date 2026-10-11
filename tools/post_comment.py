#!/usr/bin/env python3
import sys
import os
import urllib.request
import json

ISSUE_ID = "040ec6bb-781e-4c28-ab89-606103b4f128"

def post_comment(body):
    api_key = os.environ.get("LINEAR_API_KEY")
    if not api_key:
        print("Error: LINEAR_API_KEY not found in environment.")
        sys.exit(1)

    query = """
    mutation CreateComment($input: CommentCreateInput!) {
      commentCreate(input: $input) {
        success
        comment {
          id
          createdAt
        }
      }
    }
    """
    
    variables = {
        "input": {
            "issueId": ISSUE_ID,
            "body": body
        }
    }

    req = urllib.request.Request(
        "https://api.linear.app/graphql",
        data=json.dumps({"query": query, "variables": variables}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": api_key
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            if "errors" in res:
                print("GraphQL Errors:", json.dumps(res["errors"], indent=2))
                sys.exit(1)
            data = res.get("data", {}).get("commentCreate", {})
            if data.get("success"):
                print(f"Successfully posted comment. Comment ID: {data['comment']['id']}")
            else:
                print("Failed to post comment:", res)
                sys.exit(1)
    except Exception as e:
        print("HTTP Error:", e)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: post_comment.py <comment_body_or_file_path>")
        sys.exit(1)
    
    arg = sys.argv[1]
    if os.path.exists(arg):
        with open(arg, "r") as f:
            body = f.read()
    else:
        body = arg
        
    post_comment(body)
