# SPDLY AI

SPDLY AI is a feature-rich personal AI workstation, multi-provider AI gateway, API playground, endpoint manager, model explorer, and developer console. Built as a single Cloudflare Worker using Workers Static Assets.

## Table of Contents
1. [Core Architecture](#1-core-architecture)
2. [Product Identity](#2-product-identity)
3. [Main Application Areas](#3-main-application-areas)
4. [Global Command Palette](#4-global-command-palette)
5. [Chat Workspace](#5-chat-workspace)
6. [Multi-Model Chat](#6-multi-model-chat)
7. [Model Selector](#7-model-selector)
8. [Model Routing](#8-model-routing)
9. [Provider Manager](#9-provider-manager)
10. [Custom Endpoint Builder](#10-custom-endpoint-builder)
11. [Endpoint Templates](#11-endpoint-templates)
12. [Endpoint Test Lab](#12-endpoint-test-lab)
13. [API Playground](#13-api-playground)
14. [Request Collections](#14-request-collections)
15. [File Workspace](#15-file-workspace)

---

## 1. Core Architecture

SPDLY AI is deployed on Cloudflare Workers. It uses a single domain (`https://ai.spdly.eu.cc`) to serve both the Static UI (via Workers Static Assets) and the backend API gateway. All local data is strictly stored in the browser (IndexedDB and LocalStorage), ensuring no centralized database contains personal prompts, request histories, or secrets.

```
                           ai.spdly.eu.cc
                                  │
                          Cloudflare Worker
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
        Static UI              Web APIs          AI Gateway
             │                    │                    │
             │                    │          ┌─────────┼─────────┐
             │                    │          ▼         ▼         ▼
             │                    │       NVIDIA    Cerebras   Google
             │                    │
             │                    │          OpenRouter
             │                    │          NaraRouter
             │                    │          Hugging Face
             │                    │          Custom Endpoints
             │                    │
             └────────────────────┴────────────────────┘
```

## 2. Product Identity
SPDLY AI is designed as a minimalist, developer-oriented console. It avoids excessive gradients and "glassmorphism", focusing on typography, robust information hierarchy, and performance.

## 3. Main Application Areas
The application comprises multiple specialized workspaces:
- Chat, Workspace, Playground, Endpoints, Models, Providers, Requests, Files, Prompts, Agents, Tools, API, Usage, and Settings.

## 4. Global Command Palette
Accessible via `Ctrl/Cmd + K`, the command palette lets you swiftly navigate across features, create new resources, and toggle settings without leaving the keyboard.

## 5. Chat Workspace
The primary conversational interface. Features branching, local conversation storage, retry logic, and detailed per-message controls.

## 6. Multi-Model Chat
Compare responses from different models and endpoints side-by-side using the same prompt, with precise metrics for latency and tokens.

## 7. Model Selector
Filter through available models by provider, context size, and capabilities. Add custom aliases and fallback defaults.

## 8. Model Routing
Map abstract concepts (e.g., `coding`, `fast`, `reasoning`) to specific physical models dynamically without altering code.

## 9. Provider Manager
Manage keys and endpoints for NVIDIA NIM, Cerebras, Google AI Studio, OpenRouter, NaraRouter, Hugging Face, and arbitrary OpenAI-compatible endpoints safely from within the UI.

## 10. Custom Endpoint Builder
Configure custom HTTP requests with arbitrary headers, query parameters, authentication, and custom JSON body extraction logic.

## 11. Endpoint Templates
Quick-start templates for OpenAI compatible endpoints, Generic REST, and custom JSON APIs.

## 12. Endpoint Test Lab
Validate connectivity, authentication, streaming capabilities, and connection latency directly against endpoints.

## 13. API Playground
A dedicated, Postman-like interface optimized specifically for generative AI APIs.

## 14. Request Collections
Organize API Playground requests into hierarchical collections stored locally.

## 15. File Workspace
Browser-local workspace for text, markdown, JSON, CSV, and code files to inject into prompts and contexts.

---
### Development
To run locally:
```bash
npm run dev
```

To typecheck:
```bash
npm run typecheck
```

To run tests:
```bash
npm run test
```
