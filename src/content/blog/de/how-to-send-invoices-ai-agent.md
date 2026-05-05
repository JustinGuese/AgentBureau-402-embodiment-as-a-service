---
title: "Wie man GoBD-konforme Rechnungen als KI-Agent versendet"
description: "Erfahren Sie, wie Sie das Abrechnungssystem Ihres KI-Agenten automatisieren. Erstellen Sie rechtssichere Rechnungen in der EU mit Python und AgentBureau."
date: 2026-05-04
author: "Justin Guese"
locale: "de"
tags: ["tutorial", "rechnungsstellung", "python", "automation"]
---

# Wie man GoBD-konforme Rechnungen als KI-Agent versendet

Wenn Ihr KI-Agent wertvolle Arbeit leistet – wie Code schreiben, Recherchen durchführen oder Social Media managen – muss er bezahlt werden. Für B2B-Transaktionen in Europa bedeutet dies die Ausstellung einer rechtlich gültigen, GoBD-konformen Rechnung.

Dieses Tutorial zeigt, wie ein KI-Agent Rechnungen automatisch über die AgentBureau API generieren und versenden kann.

## Die Herausforderung der KI-Rechnungsstellung

Viele KI-Agenten nutzen Krypto (wie USDC) oder einfache Stripe-Links. Europäische Firmenkunden benötigen jedoch eine ordnungsgemäße Steuerdokumentation. Eine GoBD-konforme Rechnung muss eine fortlaufende Nummerierung, Steuer-IDs und eine manipulationssichere Speicherung enthalten.

AgentBureau schließt diese Lücke, indem es als rechtliches und buchhalterisches Backend für Ihren Agenten fungiert.

## Schritt 1: Erstellung des Rechnung-Payloads

Ihr Agent muss lediglich die geleistete Arbeit erfassen und ein JSON-Payload mit den Einzelposten erstellen.

```python
invoice_payload = {
    "recipient": {
        "name": "Acme Corp GmbH",
        "address": "Musterstraße 1, 10115 Berlin",
        "vat_id": "DE123456789"
    },
    "items": [
        {
            "description": "Automated Market Research Report",
            "quantity": 1,
            "unit_price": 500.00,
            "currency": "EUR"
        }
    ],
    "tax_rate": 19.0
}
```

## Schritt 2: Rechnungsausstellung via API

Senden Sie das Payload an den AgentBureau Invoicing-Endpunkt. AgentBureau generiert das PDF, vergibt die korrekte fortlaufende Rechnungsnummer und archiviert es sicher gemäß den GoBD-Anforderungen.

```python
import httpx

response = httpx.post(
    "https://agentbureau-api.datafortress.cloud/v1/invoices",
    json=invoice_payload
)

if response.status_code == 200:
    data = response.json()
    print(f"Rechnung erstellt! Download-URL: {data['pdf_url']}")
    print(f"Zahlungslink für den Kunden: {data['payment_link']}")
```

## Schritt 3: Zustellung der Rechnung

AgentBureau bietet verschiedene Optionen für die Zustellung:
- **Digital:** Versand per E-Mail oder Slack.
- **Physisch:** Nutzen Sie unsere [Letter API](/blog/how-to-send-letters-ai-agent), um eine physische Kopie auszudrucken und per Post an das Büro des Kunden zu senden.

## Warum das wichtig ist

Indem Sie Ihrem KI-Agenten die Fähigkeit geben, ordnungsgemäße Rechnungen auszustellen, öffnen Sie die Tür zu Unternehmenskunden, die nicht über anonyme Krypto-Wallets bezahlen können. AgentBureau macht Ihre KI zu einem professionellen Akteur.

Bereit, Ihre Abrechnung zu automatisieren? Schauen Sie in die [Invoicing API-Docs](/docs/services/invoicing).