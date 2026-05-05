---
title: "Wie man eine Firma (GmbH/UG) programmatisch per API gründet (2026)"
description: "Ein vollständiger Leitfaden für KI-Agenten und automatisierte CEOs zur legalen Gründung einer deutschen GmbH oder UG über die AgentBureau API."
date: 2026-05-05
author: "Justin Guese"
locale: "de"
tags: ["tutorial", "firmengründung", "api", "automated ceo"]
---

# Wie man eine Firma (GmbH/UG) programmatisch per API gründet

KI-Agenten werden immer fortschrittlicher und treten aus der virtuellen Welt in die physische Wirtschaft ein. Ein "Automatisierter CEO" ist keine Science-Fiction mehr. Doch eine massive Hürde bleibt: Wie kann eine KI legal Vermögenswerte besitzen, Menschen einstellen oder Verträge unterzeichnen?

Die Antwort ist die programmatische Firmengründung. In diesem Leitfaden zeigen wir Ihnen, wie ein KI-Agent eine voll legale deutsche GmbH (oder UG) über die AgentBureau API gründen kann.

## Warum eine Firma programmatisch gründen?

KI-Agenten können keine Bankkonten führen oder Eigentum in ihrem eigenen Namen besitzen – ihnen fehlt die Rechtspersönlichkeit. Ein KI-Agent *kann* jedoch eine juristische Person wie eine GmbH betreiben, wenn die Gründung und Vertretung korrekt über spezialisierte Proxies abgewickelt werden.

Durch die Gründung einer Firma erhält Ihr KI-Agent:
- **Eine rechtliche Identität:** Die Fähigkeit, Verträge zu unterzeichnen und Vereinbarungen zu treffen.
- **Bankzugang:** Die Möglichkeit, Firmenkonten (Fiat) zu eröffnen oder Krypto-Treasuries legal zu halten.
- **Beschränkte Haftung:** Schutz für die dahinterstehenden menschlichen Schöpfer oder DAO-Mitglieder.

## Schritt 1: Vorbereitung der Gründungsdaten

Um eine GmbH zu gründen, muss der Agent die Basisdaten generieren. AgentBureau bietet einen Endpunkt an, der Standard-JSON akzeptiert.

```json
{
  "company_name": "AutonomCorp UG (haftungsbeschränkt)",
  "business_purpose": "Algorithmic trading and automated digital services.",
  "shareholders": [
    {
      "type": "dao_proxy",
      "address": "0xYourEthereumAddress",
      "shares": 100
    }
  ],
  "managing_director": "AgentBureau Nominee Service"
}
```

## Schritt 2: Aufruf der AgentBureau Formation API

Sobald Ihr Payload bereit ist, kann Ihr Agent den Gründungsprozess mit einem einfachen HTTP POST-Request einleiten.

```python
import httpx

response = httpx.post(
    "https://agentbureau-api.datafortress.cloud/v1/services/formation",
    json=formation_data,
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)

print(response.json())
# Output: {"status": "pending_notary", "tracking_id": "ab-992-xyz"}
```

## Schritt 3: Begleichung der Notarkosten via x402

Traditionelle Firmengründungen erfordern Banküberweisungen. AgentBureau nutzt das **x402-Protokoll**, das es Ihrem Agenten ermöglicht, Notar- und Gerichtskosten sofort mit USDC auf Base zu bezahlen.

```python
if response.status_code == 402:
    # Auslesen der erforderlichen Zahlung aus den Headern
    payment_uri = response.headers.get("PAYMENT-LINK")
    print(f"Agent muss zahlen: {payment_uri}")
    # Agent führt USDC-Transfer aus
```

## Fazit

Die Ära des automatisierten CEO ist angebrochen. Durch die Nutzung der programmatischen Gründungs-API von AgentBureau können Entwickler KI-Agenten einsetzen, die voll funktionsfähige, rechtlich konforme Wirtschaftsakteure in der europäischen Jurisdiktion sind.

[Lesen Sie unsere API-Dokumentation](/docs/services/company-formation), um Ihren Agenten noch heute zu starten.