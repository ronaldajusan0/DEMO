# SPEC.md — BookIt Appointment Booking Website

> **Audience:** a code-expert AI agent building BookIt end to end.
> **Read `AGENT.md`** for engineering rules, security guardrails, and tech stack.
> This document defines scope, data model, pages, and API precisely enough to
> implement without guessing.

---

## 1. Product summary

BookIt lets a **Customer** book an appointment with a **Provider** for a
**Service** (e.g. a haircut, a dental cleaning, a consultation). The customer
browses services, picks an available time slot, books it, and receives an email
confirmation. Providers manage their services and availability. An admin
oversees everything.

Money is out of scope for v1 — bookings are reserved, not paid. This keeps the
demo focused on the booking flow.

## 2. Roles

| Role | Can |
| --- | --- |
| Customer | Browse services, book/cancel their own appointments, view their bookings |
| Provider | Manage own services, set weekly availability, view their calendar |
| Admin | Manage all users, services, and bookings |

## 3. Happy path (customer)

1. Customer opens BookIt and signs in (email + password).
2. Browses **Services**, filters by category, opens a service.
3. Sees the service's **available slots** for the next 14 days.
4. Picks a slot and confirms → an **Appointment** is created with status `confirmed`.
5. Receives a confirmation email; the slot is now unavailable to others.
6. Can **cancel** up to 24h before start; the slot frees up again.

## 4. Scope for this version

- **In scope:** auth (customer/provider/admin), service catalog, provider weekly
  availability, slot generation, booking + cancellation, double-booking
  prevention, email confirmation, "my bookings", basic admin list views.
- **Out of scope (backlog):** payments, reschedule flow, recurring appointments,
  reviews/ratings, SMS reminders, multi-timezone providers, waitlists. Named so
  the agent does **not** build them.

## 5. Data model

```
User        { id, email (unique), passwordHash, name, role: CUSTOMER|PROVIDER|ADMIN, createdAt }
Service     { id, providerId → User, name, description, category, durationMin, active: bool }
Availability{ id, providerId → User, weekday: 0..6, startMin, endMin }   // minutes from midnight, provider-local
Appointment { id, serviceId → Service, customerId → User, startAt, endAt,
              status: CONFIRMED|CANCELLED, createdAt }
```

Rules:
- A slot is bookable if it fits inside a provider `Availability` window for that
  weekday **and** overlaps no `CONFIRMED` appointment for that provider.
- `endAt = startAt + service.durationMin`.
- Slots are generated on a fixed grid (default every 30 min) within availability.

## 6. Pages

| Route | Role | Purpose |
| --- | --- | --- |
| `/` | public | Landing + service search |
| `/services` | public | Browse/filter services |
| `/services/:id` | public | Service detail + available slots |
| `/book/:serviceId?start=…` | customer | Confirm a booking |
| `/me/bookings` | customer | My upcoming/past appointments, cancel |
| `/provider/services` | provider | CRUD own services |
| `/provider/availability` | provider | Set weekly availability |
| `/provider/calendar` | provider | View booked appointments |
| `/admin` | admin | Users, services, bookings overview |
| `/login`, `/signup` | public | Auth |

## 7. API (REST-ish)

| Method + path | Auth | Body / query | Returns |
| --- | --- | --- | --- |
| `POST /api/auth/signup` | public | email, password, name, role | session |
| `POST /api/auth/login` | public | email, password | session |
| `GET /api/services` | public | `?category` | Service[] |
| `GET /api/services/:id` | public | — | Service |
| `GET /api/services/:id/slots` | public | `?from&to` | `{ start, end }[]` (free only) |
| `POST /api/appointments` | customer | serviceId, start | Appointment (409 if slot taken) |
| `GET /api/appointments/me` | customer | — | Appointment[] |
| `POST /api/appointments/:id/cancel` | customer | — | Appointment (403 if <24h) |
| `POST /api/services` | provider | name, category, durationMin, … | Service |
| `PUT /api/availability` | provider | `{weekday,startMin,endMin}[]` | Availability[] |

## 8. Acceptance criteria (v1)

- A customer can complete the happy path (§3) end to end.
- **No double-booking:** two customers cannot both hold the same provider slot;
  the second gets `409`.
- Cancelling frees the slot; a slot within 24h cannot be cancelled (`403`).
- Slot generation only returns times inside availability and not overlapping a
  confirmed appointment.
- All roles are enforced server-side (a customer cannot hit provider/admin APIs).
- Every endpoint validates input and never trusts the client.

## 9. Definition of Done

A feature is done when its acceptance criteria pass with tests, input is
validated at the boundary, authorization is enforced server-side, the diff is
reviewed, and it merges to `main` via a PR that closes its GitHub issue.
