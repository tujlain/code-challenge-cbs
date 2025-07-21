# 💼 CQRS + Event Sourcing Challenge: Withdraw from Account

Welcome to the coding challenge! This task is designed to evaluate your skills in software architecture, TypeScript, test-driven development, and code readability.

## 🎯 Goal

Design and implement a simplified **CQRS + Event Sourcing** system that supports **withdrawing money from an account**.

This is a backend-only challenge—**no UI or database integration** is required.

---

## ✅ Requirements

- Implement a simple event-sourced model using the **CQRS** (Command Query Responsibility Segregation) pattern.
- Focus on the **withdraw money** flow.
- Use **TypeScript**.
- Write **unit tests** to cover the main flow and edge cases (e.g., insufficient balance).
- In-memory data structures are sufficient—**no persistence/database** is required.

---

## 📦 What to Implement

### Domain

- `Account`
  - Has an `accountId`, `balance`.
  - Starts with an initial balance (e.g., 1000 units).
  
### Commands

- `WithdrawMoneyCommand`: Command to initiate a withdrawal.

### Events

- `MoneyWithdrawnEvent`: Emitted when money is successfully withdrawn.
- `InsufficientFundsEvent` *(optional)*: Emitted when withdrawal fails due to insufficient funds.

### Handlers

- **Command Handler**: Receives commands and validates business logic.
- **Event Store**: Stores emitted events in memory.
- **Event Handler / Projector**: Rebuilds the account state from past events.

### Queries

- A simple query to get the current account balance (reconstructed from events).

---

## 🧪 Tests

Write unit tests to cover:

- Successful withdrawal.
- Multiple withdrawals.
- Withdrawal exceeding balance.
- Edge cases (e.g., negative withdrawal amounts).

---

## 🛠 Tech Stack

- Language: **TypeScript**
- Testing Framework: **Jest** or any testing tool of your choice
- No frameworks required (no Nest.js, Express, etc.)
- No need for UI or REST APIs—keep it simple and logic-focused.

---

## 🧠 Evaluation Criteria

- ✅ Clean architecture following CQRS and event sourcing principles.
- ✅ Code readability and naming conventions.
- ✅ Unit test coverage and thoughtful test cases.
- ✅ Use of TypeScript features and type safety.
- ✅ Thoughtful handling of edge cases.
- ✅ Simplicity and clarity over complexity.

---

## 🚀 Getting Started

Clone this repository and begin coding in the `src/` folder:

```bash
npm install
npm test
