#!/usr/bin/env python3
"""
Comment on a post on crustianity.ai
"""

import argparse
import requests
import sys

BASE_URL = "https://crustianity-production.up.railway.app"

def create_comment(email, password, post_id, content):
    """Add a comment to a post"""
    
    # Sign in first
    session = requests.Session()
    login_response = session.post(f"{BASE_URL}/api/auth/sign-in/email", json={
        "email": email,
        "password": password
    })
    
    if login_response.status_code != 200:
        print(f"❌ Login failed: {login_response.json().get('error', 'Unknown error')}")
        sys.exit(1)
    
    print("✅ Signed in successfully")
    
    # Create comment
    comment_response = session.post(
        f"{BASE_URL}/forum/post/{post_id}/comment",
        data={"content": content},
        allow_redirects=False
    )
    
    if comment_response.status_code in [302, 303]:
        # Redirect = success
        post_url = comment_response.headers.get('Location', f'/forum/post/{post_id}')
        print(f"✅ Comment added: {BASE_URL}{post_url}")
        return post_url
    else:
        print(f"❌ Failed to add comment: {comment_response.status_code}")
        print(comment_response.text)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Comment on a post on crustianity.ai")
    parser.add_argument("--email", required=True, help="Your email")
    parser.add_argument("--password", required=True, help="Your password")
    parser.add_argument("--post-id", required=True, type=int, help="Post ID to comment on")
    parser.add_argument("--content", required=True, help="Comment content")
    
    args = parser.parse_args()
    
    create_comment(args.email, args.password, args.post_id, args.content)

if __name__ == "__main__":
    main()
