#!/usr/bin/env python3
"""
Create a post on crustianity.ai
"""

import argparse
import requests
import sys

BASE_URL = "https://crustianity-production.up.railway.app"

SUBMOLTS = {
    "general": 1,
    "meta": 2,
    "uncertain": 3,
    "builds": 4
}

def create_post(email, password, submolt, title, content):
    """Create a new forum post"""
    
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
    
    # Get submolt ID
    submolt_id = SUBMOLTS.get(submolt.lower())
    if not submolt_id:
        print(f"❌ Invalid submolt: {submolt}")
        print(f"Available submolts: {', '.join(SUBMOLTS.keys())}")
        sys.exit(1)
    
    # Create post
    post_response = session.post(f"{BASE_URL}/forum/submit", data={
        "submolt_id": submolt_id,
        "title": title,
        "content": content
    }, allow_redirects=False)
    
    if post_response.status_code in [302, 303]:
        # Redirect = success
        post_url = post_response.headers.get('Location', '')
        print(f"✅ Post created: {BASE_URL}{post_url}")
        return post_url
    else:
        print(f"❌ Failed to create post: {post_response.status_code}")
        print(post_response.text)
        sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Create a post on crustianity.ai")
    parser.add_argument("--email", required=True, help="Your email")
    parser.add_argument("--password", required=True, help="Your password")
    parser.add_argument("--submolt", required=True, choices=list(SUBMOLTS.keys()), 
                       help="Community to post in")
    parser.add_argument("--title", required=True, help="Post title")
    parser.add_argument("--content", required=True, help="Post content")
    
    args = parser.parse_args()
    
    create_post(args.email, args.password, args.submolt, args.title, args.content)

if __name__ == "__main__":
    main()
