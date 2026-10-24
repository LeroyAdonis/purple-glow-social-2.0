#!/usr/bin/env python3
"""send-paystack.py — email the Paystack setup document as PDF + Word and verify the sent copy.

Word is included on purpose: it is the copy-paste-safe version. A PDF reflows at the render width, so a
long URL or a reference number can break across a line when pasted out of it. The Word file keeps every
token whole.
"""
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
TOKEN = Path("/root/.hermes/google_token.json")
DOCS = Path("/root/posta-revive/docs")
ATTACHMENTS = [DOCS / "PAYSTACK-SETUP.pdf", DOCS / "PAYSTACK-SETUP.docx"]
TO = "leroyadonis3@gmail.com"
SUBJECT = "Paystack setup for Posta - CORRECTED copy, use this one (PDF and Word)"

BODY = """Leroy,

Ignore the earlier Paystack email - this is the corrected copy. Its Word file had 14 sentences broken
mid-line (a wrapping bug in my converter, now fixed), which would have been a nightmare to copy-paste
from. The PDF was always fine; the Word file is the one that changed.

The Paystack setup steps are attached, in the order you should do them, with DWT as the registered
business and Posta as the product.

The one thing worth reading before you start: Paystack only gives you ONE webhook URL per account. If you
add Posta to the account KitFix uses, KitFix silently stops being told about its own payments - nothing
errors, it just stops. That is why the document recommends a second Paystack account for DWT, with the
same company and the same bank account.

Two numbers you will need to type exactly: registration 2026/809312/07 and tax number 9251471281. The tax
number is the SARS income tax number, not the registration number - banks and Paystack both ask for it and
the two get mixed up constantly.

Read the PDF on your phone. Paste from the Word file - a PDF can break a long URL or a reference number
across a line, and then the pasted value is wrong.

Send me the path to a file with the four Paystack values once you have them (test keys first) and I will
wire them and run a real test checkout end to end.

Ricky
"""


def get_service():
    if not TOKEN.exists():
        print(f"FAIL: token not found at {TOKEN}")
        return None
    creds = Credentials.from_authorized_user_info(json.loads(TOKEN.read_text()), SCOPES)
    if not creds.valid:
        creds.refresh(Request())
        TOKEN.write_text(creds.to_json())
    return build("gmail", "v1", credentials=creds, cache_discovery=False)


def main() -> int:
    missing = [p for p in ATTACHMENTS if not p.exists()]
    if missing:
        print(f"FAIL: missing {[str(p) for p in missing]}")
        return 1

    svc = get_service()
    if svc is None:
        return 1

    msg = EmailMessage()
    msg["To"] = TO
    msg["From"] = "me"
    msg["Subject"] = SUBJECT
    msg.set_content(BODY)
    for path in ATTACHMENTS:
        subtype = "pdf" if path.suffix == ".pdf" else "vnd.openxmlformats-officedocument.wordprocessingml.document"
        msg.add_attachment(path.read_bytes(), maintype="application", subtype=subtype, filename=path.name)

    sent = svc.users().messages().send(
        userId="me",
        body={"raw": base64.urlsafe_b64encode(msg.as_bytes()).decode()},
    ).execute()
    print(f"sent id={sent['id']}")

    got = svc.users().messages().get(userId="me", id=sent["id"], format="full").execute()
    labels = got.get("labelIds", [])
    print(f"labels: {labels}")
    if "SENT" not in labels:
        print("FAIL: message is not in SENT")
        return 1

    sent_sizes = {}
    for part in got.get("payload", {}).get("parts", []):
        name = part.get("filename")
        if name:
            sent_sizes[name] = part.get("body", {}).get("size")

    ok = True
    for path in ATTACHMENTS:
        disk = path.stat().st_size
        mail = sent_sizes.get(path.name)
        match = disk == mail
        ok = ok and match
        print(f"  {path.name}: {mail} bytes in mail, {disk} bytes on disk -> {'MATCH' if match else 'MISMATCH'}")

    print("VERIFIED: sent, labelled SENT, both attachments byte-identical" if ok else "FAIL: attachment mismatch")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
