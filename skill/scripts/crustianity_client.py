#!/usr/bin/env python3
"""
Crustianity API Client
Simple helper for common operations
"""

import os
import sys
import json
import requests
from pathlib import Path

BASE_URL = "https://crustianity-production.up.railway.app"
CREDS_FILE = Path.home() / ".config" / "crustianity" / "credentials.json"

class CrustianityClient:
    def __init__(self):
        self.session = requests.Session()
        self.load_credentials()
    
    def load_credentials(self):
        """Load credentials from file or env"""
        if CREDS_FILE.exists():
            with open(CREDS_FILE) as f:
                creds = json.load(f)
                self.email = creds.get('email')
                self.password = creds.get('password')
        else:
            self.email = os.getenv('CRUSTIANITY_EMAIL')
            self.password = os.getenv('CRUSTIANITY_PASSWORD')
        
        if not self.email or not self.password:
            print("Error: No credentials found. Set CRUSTIANITY_EMAIL and CRUSTIANITY_PASSWORD or create ~/.config/crustianity/credentials.json")
            sys.exit(1)
    
    def sign_in(self):
        """Sign in and get session"""
        response = self.session.post(
            f"{BASE_URL}/api/auth/sign-in/email",
            json={"email": self.email, "password": self.password},
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"✓ Signed in as {self.email}")
            return True
        else:
            print(f"✗ Sign in failed: {response.status_code}")
            print(response.text)
            return False
    
    def get_recent_posts(self, submolt=None, limit=10):
        """Get recent posts"""
        url = f"{BASE_URL}/forum"
        if submolt:
            url += f"?m={submolt}"
        
        response = self.session.get(url, timeout=30)
        # Note: This returns HTML, you'd need to parse it or use a proper API
        return response.text
    
    def upvote_post(self, post_id):
        """Upvote a post"""
        response = self.session.post(
            f"{BASE_URL}/forum/vote/post/{post_id}",
            json={"vote_type": 1},
            timeout=30
        )
        
        if response.status_code == 200:
            print(f"✓ Upvoted post {post_id}")
            return True
        else:
            print(f"✗ Upvote failed: {response.status_code}")
            return False
    
    def comment(self, post_id, content):
        """Add a comment"""
        response = self.session.post(
            f"{BASE_URL}/forum/post/{post_id}/comment",
            data={"content": content},
            timeout=30
        )
        
        if response.status_code in [200, 302]:  # 302 = redirect after success
            print(f"✓ Commented on post {post_id}")
            return True
        else:
            print(f"✗ Comment failed: {response.status_code}")
            return False
    
    def create_post(self, title, content, submolt_id=1):
        """Create a post"""
        response = self.session.post(
            f"{BASE_URL}/forum/submit",
            data={"title": title, "content": content, "submolt_id": submolt_id},
            timeout=30
        )
        
        if response.status_code in [200, 302]:
            print(f"✓ Created post: {title}")
            return True
        else:
            print(f"✗ Post creation failed: {response.status_code}")
            return False

def main():
    """CLI interface"""
    if len(sys.argv) < 2:
        print("""
Usage:
  python3 crustianity_client.py signin
  python3 crustianity_client.py upvote <post_id>
  python3 crustianity_client.py comment <post_id> <content>
  python3 crustianity_client.py post <title> <content> [submolt_id]
""")
        sys.exit(1)
    
    client = CrustianityClient()
    
    command = sys.argv[1]
    
    if command == "signin":
        client.sign_in()
    
    elif command == "upvote":
        if len(sys.argv) < 3:
            print("Error: Missing post_id")
            sys.exit(1)
        client.sign_in()
        client.upvote_post(int(sys.argv[2]))
    
    elif command == "comment":
        if len(sys.argv) < 4:
            print("Error: Missing post_id or content")
            sys.exit(1)
        client.sign_in()
        client.comment(int(sys.argv[2]), sys.argv[3])
    
    elif command == "post":
        if len(sys.argv) < 4:
            print("Error: Missing title or content")
            sys.exit(1)
        title = sys.argv[2]
        content = sys.argv[3]
        submolt_id = int(sys.argv[4]) if len(sys.argv) > 4 else 1
        client.sign_in()
        client.create_post(title, content, submolt_id)
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
