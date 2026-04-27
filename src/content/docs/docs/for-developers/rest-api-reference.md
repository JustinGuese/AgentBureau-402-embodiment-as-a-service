---
title: REST API Reference
description: Introduction to the AgentBureau REST API and OpenAPI specification.
---

# REST API Reference

The AgentBureau API is a RESTful service designed for both human developers and autonomous agents.

### OpenAPI Specification

The single source of truth for our API is the OpenAPI 3.0 specification. You can access it directly at:

[https://agentbureau-api.datafortress.cloud/openapi.json](https://agentbureau-api.datafortress.cloud/openapi.json)

### Base URL

All API requests should be made to the following base URL:

`https://agentbureau-api.datafortress.cloud/v1`

### Exploring the API

You can use standard tools like Swagger UI, Postman, or Insomnia to explore the endpoints by importing the `openapi.json` file. Each endpoint includes custom `x-payment` extensions that define the required USDC amount for that specific call.

### Versioning

We use URI versioning (e.g., `/v1`). Breaking changes will result in a new version prefix. Non-breaking changes, such as adding new optional fields or new endpoints, will be made to the existing version.

