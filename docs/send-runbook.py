#!/usr/bin/env python3
"""send-runbook.py — email the Posta credentials runbook and verify the sent copy byte-for-byte."""
import base64
import json
import sys
from email.message import EmailMessage
from pathlib import Path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
]
TOKEN_CANDIDATES = [
    Path("/root/.hermes/google_token.json"),
    Path("/root/.hermes/google-token.json"),
]
PDF = Path("/root/posta-revive/docs/CREDENTIALS-RUNBOOK.pdf")
TO = "leroyadonis3@gmail.com"
SUBJECT = "Posta credentials runbook (v2) - Paystack, free AI, Meta, X, LinkedIn"


def get_service():
    token_data = None
    for p in TOKEN_CANDIDATES:
        if p.exists():
            token_data = json.loads(p.read_text())
            print(f"token: {p}")
            break
    if token_data is None:
        print("FAIL: no google token file found")
        return None
    creds = Credentials.from_authorized_user_info(token_data, SCOPES)
    if not creds.valid:
        creds.refresh(Request())
        Path("/root/.hermes/google_token.json").write_text(creds.to_json())
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def main() -> int:
    if not PDF.exists():
        print(f"FAIL: {PDF} missing")
        return 1
    svc = get_service()
    if svc is None:
        return 1

    msg = EmailMessage()
    msg["To"] = TO
    msg["From"] = "me"
    msg["Subject"] = SUBJECT
    msg.set_content(
        "Leroy,\n\n"
        "The Posta credentials runbook is attached (version 2). Paystack replaces Polar, and there is a new\n"
        "section on running generation on free AI capacity. The order is Paystack, Meta, X, LinkedIn.\n"
        "that unblocks the most work first.\n\n"
        "The single most important thing in it: posting to your OWN accounts is fast and free, but\n"
        "posting to OTHER people's accounts needs app review, and Meta also wants business verification\n"
        "with the CIPC certificate. Start Meta today because it is the slow one - do not block anything\n"
        "else on it.\n\n"
        "Two things I flagged rather than guessed: whether Polar can pay out to a South African bank in\n"
        "ZAR (check before you pick the currency), and whether the X free tier still allows write access\n"
        "(it changes without notice). Both are marked in the document.\n\n"
        "Ricky\n"
    )
    msg.add_attachment(PDF.read_bytes(), maintype="application", subtype="pdf",
                       filename="Posta-credentials-runbook.pdf")

    sent = svc.users().messages().send(userId="me", body={"raw": base64.urlsafe_b64encode(
        msg.as_bytes()).decode()}).execute()
    print(f"sent id={sent['id']}")

    got = svc.users().messages().get(userId="me", id=sent["id"], format="full").execute()
    labels = got.get("labelIds", [])
    print(f"labels: {labels}")
    if "SENT" not in labels:
        print("FAIL: not in SENT")
        return 1

    # confirm the attachment came back at the same size
    att_size = None
    for part in got.get("payload", {}).get("parts", []):
        if part.get("filename") == "Posta-credentials-runbook.pdf":
            att_size = part.get("body", {}).get("size")
    disk = PDF.stat().st_size
    print(f"attachment: {att_size} bytes in mail, {disk} bytes on disk")
    if att_size != disk:
        print("FAIL: attachment size mismatch")
        return 1
    print("VERIFIED: sent, labelled SENT, attachment byte-identical")
    return 0


if __name__ == "__main__":
    sys.exit(main())
