from typing import List, Dict
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Alert thresholds
CYCLONIC_SEVERITY_THRESHOLD = 7.0

# Sample email notification configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "your_email@gmail.com"
EMAIL_PASSWORD = "your_password"

def send_email_alert(recipients: List[str], subject: str, message: str):
    """
    Send email alerts to recipients.
    """
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)

        for recipient in recipients:
            msg = MIMEMultipart()
            msg["From"] = EMAIL_ADDRESS
            msg["To"] = recipient
            msg["Subject"] = subject
            msg.attach(MIMEText(message, "plain"))
            server.sendmail(EMAIL_ADDRESS, recipient, msg.as_string())

        server.quit()
        print("Email alerts sent successfully.")
    except Exception as e:
        print(f"Failed to send email alerts: {e}")

def check_cyclonic_alerts(weather_data: Dict):
    """
    Check if cyclonic severity exceeds the threshold and trigger an alert.
    """
    if weather_data.get("Cyclonic Severity", 0) > CYCLONIC_SEVERITY_THRESHOLD:
        severity = weather_data["Cyclonic Severity"]
        location = f"Lat: {weather_data['Latitude']}, Lon: {weather_data['Longitude']}"
        subject = "Cyclone Alert: Severe Weather Detected!"
        message = (
            f"A cyclonic condition has been detected in your area.\n"
            f"Location: {location}\n"
            f"Severity: {severity}\n"
            f"Please take necessary precautions immediately."
        )
        # Recipients of the alert
        recipients = ["recipient1@example.com", "recipient2@example.com"]
        send_email_alert(recipients, subject, message)
        return {"alert_triggered": True, "message": message}
    return {"alert_triggered": False, "message": "No severe weather detected."}
