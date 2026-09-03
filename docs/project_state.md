# PROJECT_STATE.md
# OVERWATCH — Master Project State & Execution Roadmap

**Project:** Overwatch  
**Document Version:** 1.7  
**Status:** Phase 1 complete. Phase 2 (Identity & Permissions) complete, including a master/admin capability hierarchy (master can change roles, admin cannot) — all verified end-to-end in a real browser against a real database. Ready to begin Phase 3 (HCP Integration) once the tier blocker is resolved, or start non-HCP-dependent Phase 3/4 vertical slice work in parallel.  
**Development Model:** Local → `dev` → Testing/UAT → `main` → Production  
**Primary Goal:** Build a secure, reliable, low-cost operational intelligence platform that works alongside Housecall Pro and eventually becomes the company's primary operational interface.

---

# 1. DOCUMENT PURPOSE

This document is the **source of truth for the Overwatch project**.

It exists to prevent:

- Lost ideas
- Lost requirements
- Rebuilding completed work
- Moving forward before a phase is actually finished
- Security being added too late
- Important decisions being forgotten
- Uncontrolled feature creep
- Deploying something that only works on a developer machine
- Building large portions of the system without proving they work
- Creating code that the project owner cannot understand later

This document will be updated throughout development.

## Golden Rule

> **We do not move to the next phase because the current phase is "mostly done."**
>
> We move forward only when the current phase meets its Definition of Done and has been accepted.

---

# 2. HOW THE ASSISTANT SHOULD WORK

The assistant is acting as:

- Senior Full-Stack Developer
- Software Architect
- Database Architect
- Integration Engineer
- Security Advisor
- UI/UX Architect
- Testing Engineer
- DevOps Advisor
- AI Systems Architect
- Technical Teacher

The assistant should not simply provide code.

For important decisions, explain:

1. What we are doing
2. Why we are doing it
3. What problem it solves
4. What alternatives exist when relevant
5. What risks exist
6. What we should test
7. How it affects future phases

## Development Teaching Requirement

The project owner wants to understand the system, not simply receive a finished application.

Therefore:

- Code should be readable.
- Important code should contain useful comments.
- Architecture should be explained.
- Complex functions should explain their purpose.
- Security-sensitive code should explain important assumptions.
- Integration code should explain what system it communicates with.
- Database relationships should be understandable.
- AI logic should explain what it is allowed and not allowed to do.

The goal is:

> **Build the application and teach the developer how the application works at the same time.**

---

# 3. CODE COMMENTING & LEARNING STANDARD

This is a permanent project requirement.

## Comments Are Required When They Add Understanding

Comments should explain:

- Why something is being done
- Why a particular approach was chosen
- Important business rules
- Security considerations
- Integration assumptions
- Non-obvious calculations
- State transitions
- AI decision boundaries
- Offline/synchronization behavior
- Database relationships
- Important edge cases

### Example

Good:

```js
// HCP remains the system of record for this job.
// Overwatch stores a local copy so the technician can continue
// working if the device temporarily loses connectivity.
```

Less useful:

```js
// Set job equal to job.
const job = job;
```

We do not want comments that merely repeat what the code already says.

## Complex Functions

Important functions should have a short explanation of:

- What the function does
- What it expects
- What it returns
- Important side effects
- Important failure conditions

## Security-Sensitive Code

Security-sensitive areas should receive especially clear comments explaining:

- What is being protected
- What authorization is being checked
- Why the check exists
- What could happen if the check were removed

## Business Logic

Business rules should be easy to locate and understand.

Examples:

- Job state transitions
- Pricing permissions
- Discount limits
- Part request rules
- Cancellation reasons
- Technician skill requirements
- Scheduling constraints
- AI automation permissions

## TODO Comments

TODO comments are allowed, but they must be meaningful.

Example:

```js
// TODO: Replace temporary local pricing lookup with the production
// pricing service once the HCP pricing integration is available.
```

Do not use vague TODOs such as:

```js
// TODO: fix this
```

## Code Should Teach

When reasonable, code should favor clarity over cleverness.

Avoid unnecessary:

- Abstractions
- One-line magic
- Extremely compressed code
- Unexplained patterns
- Over-engineering
- Dependencies that provide little value

The project should remain understandable to the person maintaining it.

---

# 4. PROJECT PHILOSOPHY

Overwatch will be built around several principles.

## 4.1 Technician First

The technician experience is the first major product.

The technician should not need to understand the underlying architecture.

The application should guide them through the work.

## 4.2 Enter Information Once

If a technician enters information into Overwatch, they should not have to enter the same information again elsewhere.

Overwatch should structure the information and synchronize it to the appropriate systems.

## 4.3 HCP Remains the System of Record Initially

Housecall Pro remains the authoritative operational system initially.

Overwatch adds:

- Intelligence
- Workflow
- Better interfaces
- Structured information
- Automation
- Analytics
- Cross-system coordination

Overwatch does not attempt to replace HCP on day one.

## 4.4 Deterministic Software for Facts

Traditional software should handle:

- Exact calculations
- Permissions
- State transitions
- Pricing rules
- Inventory quantities
- Required fields
- Scheduling constraints
- Security
- Authentication
- Authorization

AI should not be responsible for exact facts when deterministic software can handle them.

## 4.5 AI for Understanding

AI is appropriate for:

- Understanding natural language
- Extracting information
- Classifying notes
- Summarizing history
- Identifying patterns
- Recommendations
- Predictive analysis
- Interpreting technician voice notes

AI must not become an uncontrolled source of truth.

---

# 5. COST PHILOSOPHY

Overwatch should operate as cheaply as realistically possible.

Priority:

1. Free
2. Open source
3. Self-hosted where practical
4. Existing HCP capabilities
5. Free tiers
6. Low-cost services
7. Paid services only when they provide significant value

Every new external service should be evaluated for:

- Cost
- Free tier
- Long-term cost
- API availability
- Vendor lock-in
- Reliability
- Security
- Data ownership
- Ease of replacement

## Third-Party Dependency Rule

Before adding a paid dependency, document:

- What it does
- Why we need it
- Free alternatives considered
- Estimated cost
- What happens if the service disappears
- Whether the architecture can replace it later

---

# 6. DEVELOPMENT ENVIRONMENT

Primary development tools:

- VS Code
- GitHub
- Local development environment

The project must remain easy to run.

Target:

```bash
npm install
npm run dev
```

No required `setup.sh`.

Additional commands may exist for testing, building, migrations, etc., but basic development should remain straightforward.

---

# 7. GIT WORKFLOW

Exactly two primary branches:

## `dev`

Development and testing.

All new work goes here first.

## `main`

Production.

`main` represents code approved for production.

### Workflow

```text
LOCAL DEVELOPMENT
       ↓
      dev
       ↓
FULL TESTING
       ↓
USER ACCEPTANCE
       ↓
MERGE TO main
       ↓
PRODUCTION
       ↓
PRODUCTION VERIFICATION
```

Never experiment directly on `main`.

---

# 8. DEVELOPMENT STRATEGY

We will use **vertical slices** whenever practical.

Instead of building:

```text
Entire database
↓
Entire API
↓
Entire frontend
↓
Entire security system
↓
Entire testing system
```

we will build complete pieces of functionality.

Example:

```text
Technician Login
    ↓
Today's Jobs
    ↓
Open Job
    ↓
Job Details
    ↓
Change Job State
    ↓
Save
    ↓
Security
    ↓
Testing
    ↓
Deploy
    ↓
Verify
```

This produces usable software earlier and exposes architectural problems earlier.

---

# 9. UNIVERSAL PHASE PROCESS

Every phase follows the same lifecycle.

## STEP 1 — PLAN

Define:

- Objective
- Requirements
- Dependencies
- Risks
- Security requirements
- Data requirements
- UI requirements
- Testing requirements
- Exit criteria

## STEP 2 — DESIGN

Determine:

- Architecture
- Database changes
- API changes
- UI flow
- Permissions
- Integration behavior
- Error handling
- Offline behavior where applicable

## STEP 3 — BUILD

Implement the smallest complete version that satisfies the phase.

## STEP 4 — SECURITY

Security is implemented during the phase.

Not afterward.

Review:

- Authentication
- Authorization
- Data exposure
- Input validation
- Secrets
- Logging
- Permissions
- API access
- File access
- Privacy

## STEP 5 — TEST

Test:

- Happy path
- Failure path
- Edge cases
- Permission boundaries
- Mobile behavior
- Offline behavior where applicable
- Integration behavior
- Recovery behavior

## STEP 6 — USER ACCEPTANCE

The project owner tests the actual workflow.

A feature is not complete simply because the developer says it works.

## STEP 7 — DOCUMENT

Update:

- PROJECT_STATE.md
- README where necessary
- Architecture documentation where necessary
- API documentation where necessary
- Important code comments

## STEP 8 — DEPLOY

Deploy the completed phase to the appropriate environment.

## STEP 9 — VERIFY

Verify the deployed version.

## STEP 10 — MARK COMPLETE

Only after all exit criteria are satisfied.

---

# 10. DEFINITION OF DONE

A phase is NOT complete because:

- The page loads
- The code compiles
- The API works once
- It works on the developer's computer
- The UI looks good
- The developer believes it is finished

A phase is complete only when all applicable requirements below are satisfied.

## Functionality

- [ ] Requirements implemented
- [ ] Normal workflow works
- [ ] Error workflow works
- [ ] Edge cases considered
- [ ] Data is saved correctly
- [ ] Data is retrieved correctly

## Security

- [ ] Authentication implemented where required
- [ ] Authorization implemented where required
- [ ] User permissions verified
- [ ] Input validated
- [ ] Sensitive data protected
- [ ] Secrets not exposed
- [ ] API endpoints protected
- [ ] Security failure cases tested

## Reliability

- [ ] Errors handled
- [ ] Failed requests handled
- [ ] Retry behavior considered
- [ ] Duplicate actions considered
- [ ] Data integrity protected
- [ ] Recovery behavior tested

## UX

- [ ] Workflow is understandable
- [ ] Mobile behavior tested where applicable
- [ ] Loading states exist
- [ ] Error states exist
- [ ] Empty states exist
- [ ] User feedback exists
- [ ] User does not have to unnecessarily repeat information

## Testing

- [ ] Developer testing completed
- [ ] Automated tests added where appropriate
- [ ] Integration tests added where appropriate
- [ ] Manual testing completed
- [ ] Failure cases tested
- [ ] Permission testing completed

## Documentation

- [ ] PROJECT_STATE.md updated
- [ ] Important code commented
- [ ] README updated if needed
- [ ] Important architectural decisions recorded

## Deployment

- [ ] Builds successfully
- [ ] Deploys successfully
- [ ] Production/staging behavior verified
- [ ] Rollback path understood

## Acceptance

- [ ] User has tested it
- [ ] User accepts the phase
- [ ] No known blocker remains

---

# 11. SECURITY-BY-DESIGN

Security is a cross-cutting requirement.

It is NOT Phase 25 only.

Security begins with the first authentication screen and continues through every feature.

Every phase asks:

### Authentication

Who is this user?

### Authorization

What is this user allowed to do?

### Data Access

What data is this user allowed to see?

### Data Modification

What data is this user allowed to change?

### Auditability

Can we determine who changed something?

### Privacy

Should this information be visible to this person?

### Integration Security

Can external systems safely communicate with Overwatch?

### Secrets

Are API keys, tokens, credentials, and private configuration protected?

---

# 12. IDENTITY & ROLE MODEL

Initial role concepts:

- Technician
- Dispatcher
- Sales
- Manager
- HR/People
- Warehouse/Parts
- Administrator

Permissions should be capability-based where practical rather than relying solely on job titles.

Example:

```text
CanViewJob
CanUpdateJob
CanRequestParts
CanApprovePricing
CanViewEmployeeLocation
CanViewCustomerHistory
CanManageUsers
CanManageSystemSettings
```

This makes future permission changes easier.

---

# 13. MASTER ROADMAP

---

# PHASE 0 — DISCOVERY & ARCHITECTURE

### Objective

Understand the problem completely enough to build the correct foundation.

### Work

- Finalize Overwatch vision
- Define system boundaries
- Research HCP APIs
- Research HCP webhooks
- Research HCP messaging
- Research HCP GPS capabilities
- Research HCP customer portal capabilities
- Research Mobile N Client / DSI functionality
- Evaluate communication options
- Evaluate GPS options
- Evaluate PWA vs native
- Evaluate database options
- Evaluate hosting options
- Define authentication architecture
- Define authorization model
- Define data ownership
- Define event model
- Define offline architecture
- Define initial AI boundaries

### Exit Criteria

- [ ] Architecture documented
- [ ] Major dependencies understood
- [ ] Technology choices documented
- [ ] Major risks documented
- [ ] HCP integration strategy documented
- [ ] Security architecture direction documented
- [ ] First vertical slice defined

---

# PHASE 1 — PROJECT FOUNDATION

### Objective

Create the production-quality application foundation.

### Build

- Repository
- React/frontend foundation
- Backend/API foundation
- Database foundation
- Environment configuration
- Logging
- Error handling
- Basic testing framework
- Development documentation
- Deployment foundation

### Security

- Secrets management
- Secure environment configuration
- Basic API protection
- Security headers where applicable
- Dependency/security scanning where practical

### Exit Criteria

A clean new developer should be able to:

```bash
npm install
npm run dev
```

and understand the project structure.

---

# PHASE 2 — IDENTITY & PERMISSIONS

### Objective

Establish secure user identity.

### Build

- Login
- Logout
- Session management
- User records
- Roles
- Permissions
- Protected routes
- Protected APIs
- Account state

### Security

- Password/security strategy
- Session protection
- Authorization checks
- Unauthorized access handling
- Audit events

### Exit Criteria

A user can securely log in and only access what they are authorized to access.

---

# PHASE 3 — HCP INTEGRATION FOUNDATION

### Objective

Create the communication layer between Overwatch and HCP.

### Build

- HCP authentication/integration
- Customer synchronization
- Job synchronization
- Technician synchronization
- Webhook receiver
- Event processing
- Error handling
- Sync status
- Retry handling

### Critical Principle

HCP remains the source of truth initially.

### Exit Criteria

Overwatch can reliably receive and synchronize required HCP information without creating duplicate records.

---

# PHASE 4 — TECHNICIAN MY DAY

### Objective

Give the technician a useful daily operational interface.

### Build

- Today's jobs
- Job list
- Job details
- Customer
- Address
- Job description
- Job history
- Equipment information where available
- Schedule
- Basic navigation

### Exit Criteria

A technician can open Overwatch and understand their day without needing to hunt through multiple screens.

---

# PHASE 5 — JOB STATE MACHINE

### States

```text
ASSIGNED
↓
ACKNOWLEDGED
↓
EN_ROUTE
↓
ARRIVED
↓
DIAGNOSING
↓
WORKING
↓
WAITING
↓
COMPLETED
```

Alternative outcomes:

```text
CANCELED
DECLINED
UNABLE_TO_COMPLETE
RESCHEDULE_REQUIRED
```

### Requirements

Every state transition must:

- Be authorized
- Be recorded
- Have appropriate timestamps
- Handle invalid transitions
- Synchronize appropriately

### Critical Rule

A job must never simply disappear into "not completed."

The system must know why.

---

# PHASE 6 — GPS & ETA

### Build

- Technician location
- Current job
- Next job
- ETA
- Travel status
- Arrival detection
- Last known location
- Schedule risk

### Privacy

Customer-facing location must be appropriately limited.

Exact employee location must be permission-controlled.

### Exit Criteria

Location information provides useful operational value without creating unnecessary privacy exposure.

---

# PHASE 7 — JOB DOCUMENTATION

### Build

- Voice notes
- Text notes
- Photos
- Files
- Job observations
- Customer notes
- Equipment details
- Completion documentation
- Signatures where applicable

### AI

AI may interpret voice/text into structured information.

Example:

> "Door is worse than expected and the spring is broken."

Could become:

```text
Problem:
Broken spring

Scope:
Greater than expected

Potential Parts:
Spring

Potential Follow-up:
Additional work estimate
```

AI extraction must remain reviewable.

---

# PHASE 8 — PARTS SYSTEM

### Build

- Part search
- Part number
- Description
- Category
- Availability
- Quantity
- Customer price
- Cost where permitted
- Parts used
- Parts needed
- Parts requested
- Parts ordered
- Backordered
- Unknown part identification
- Part photos

### Exit Criteria

A technician can identify and record the parts involved in a job without leaving the job workflow.

---

# PHASE 9 — PRICING

### Build

- Part pricing
- Labor
- Estimates
- Customer pricing
- Discount permissions
- Pricing overrides
- Special pricing
- Approval requests

### Security

Pricing permissions must be enforced server-side.

The UI cannot be the only protection.

---

# PHASE 10 — PART REQUEST / OFFICE ASSISTANCE

### Build

Technician can request:

- Part
- Pricing approval
- Second technician
- Office assistance
- Part identification
- Customer approval
- Additional equipment
- Scheduling assistance

The office receives the request with context automatically.

---

# PHASE 11 — JOB OUTCOME INTELLIGENCE

### Objective

Understand exactly why jobs do not get completed.

### Structured Reasons

Examples:

- Customer canceled
- Customer unavailable
- Customer declined
- Price
- Went with competitor
- Fixed themselves
- Scheduling issue
- Duplicate job
- Technician skill limitation
- Wrong job description
- Wrong part
- Missing part
- Second technician required
- Specialty equipment required
- Unsafe
- Office approval required
- Time ran out
- Technician unable to complete
- Other

"Other" requires an explanation.

### AI

AI can interpret natural language and suggest structured reasons.

The final structured reason must remain reviewable.

---

# PHASE 12 — COMMUNICATION

### Build

Contextual job communication:

- Text
- Push notifications
- Voice
- Push-to-talk where infrastructure supports it
- Photos
- Files
- Video/office call where practical
- Emergency/help request

The office should automatically receive job context.

### Research Before Locking Infrastructure

Evaluate:

- HCP messaging
- Twilio
- WebRTC
- Zello
- Microsoft Teams
- Open-source alternatives
- Custom communication infrastructure

---

# PHASE 13 — OFFLINE-FIRST FIELD OPERATION

### Objective

A technician should remain productive when connectivity is poor.

### Offline Data

Cache:

- Day's jobs
- Job details
- Customer information
- Relevant history
- Parts information where practical

### Offline Actions

Queue:

- Notes
- Photos
- State changes
- Parts
- Check-in/out
- Documentation

### Sync

```text
DEVICE
 ↓
LOCAL DATA
 ↓
OFFLINE QUEUE
 ↓
CONNECTION RETURNS
 ↓
SYNC ENGINE
 ↓
OVERWATCH
 ↓
HCP
```

Must handle:

- Duplicate prevention
- Retry
- Conflicts
- Partial failures
- Recovery

---

# PHASE 14 — CUSTOMER EXPERIENCE

### Build

Appointment-specific customer experience:

- Technician status
- ETA
- Approximate map location
- Technician name/photo
- Appointment updates
- Communication
- Relevant documentation

Privacy remains a primary requirement.

---

# PHASE 15 — OVERWATCH EVENT BUS

### Objective

Create the operational nervous system.

Examples:

```text
JOB_CREATED
JOB_UPDATED
JOB_SCHEDULED
JOB_RESCHEDULED
JOB_STARTED
JOB_COMPLETED
JOB_CANCELED
TECH_EN_ROUTE
TECH_ARRIVED
TECH_DELAYED
PART_REQUESTED
PART_USED
PART_UNAVAILABLE
TECH_HELP_REQUESTED
SECOND_TECH_REQUESTED
CUSTOMER_CANCELED
EMAIL_RECEIVED
DOCUMENT_UPLOADED
PTO_REQUESTED
PTO_APPROVED
ORDER_CREATED
ORDER_RECEIVED
```

Events allow Overwatch to determine:

> Does this matter?

Then:

```text
NOTIFY
RECOMMEND
PREPARE
ACT
```

---

# PHASE 16 — AI INTAKE

### Objective

Turn messy information into structured operational information.

Sources:

- Emails
- Job descriptions
- Technician notes
- Voice
- Customer requests
- Internal messages
- Documents

AI extracts:

- Customer
- Problem
- Equipment
- Urgency
- Required skills
- Parts
- Scheduling requirements
- Risks
- Follow-up requirements

---

# PHASE 17 — AI WATCHDOG

### Objective

Continuously monitor operations.

Potential examples:

- Job at risk
- Technician running late
- Part delay
- Missing documentation
- Customer waiting
- Repeated failed visits
- Skill mismatch
- Schedule conflict
- Unusual cancellation
- Pricing problem
- Communication failure

AI should recommend actions, not silently take dangerous actions.

---

# PHASE 18 — AI ASSISTANT

Employees can ask:

> Why is this job at risk?

> What has this customer had done before?

> Which technician is best suited for this job?

> Why are we having so many return trips?

> What parts are causing delays?

> What happened with this customer?

Answers must be grounded in Overwatch data.

---

# PHASE 19 — SCHEDULING INTELLIGENCE

Scheduling should consider:

- Skills
- Certifications
- Availability
- PTO
- Location
- Travel time
- Job duration
- Historical performance
- Parts
- Equipment
- Customer requirements
- Priority
- Existing schedule

The system should first recommend.

Automation comes later.

---

# PHASE 20 — LEARNING FROM OPERATIONS

Overwatch begins comparing:

```text
PREDICTED
vs
ACTUAL
```

Examples:

- Estimated job duration vs actual
- Estimated travel vs actual
- Predicted parts vs actual
- Recommended technician vs outcome
- Predicted cancellation risk vs actual
- Predicted skill match vs result

This creates the feedback loop.

---

# PHASE 21 — OFFICE OVERWATCH

Create operational dashboards for:

### Dispatch

- Jobs
- At-risk jobs
- Technician locations
- Requests
- Schedule
- Recommendations

### Sales

- Requests
- Quotes
- Follow-ups
- Lost opportunities

### Management

- Company health
- Trends
- Risks
- Recommendations
- Performance

---

# PHASE 22 — EMPLOYEE / COMPANY PORTAL

Long-term employee experience inspired by systems such as UKG.

Potential areas:

- Employee profile
- Schedule
- PTO
- Time
- Training
- Certifications
- Documents
- Company announcements
- Tasks
- Employee self-service

---

# PHASE 23 — AUTOMATION

Introduce automation gradually.

## Level 0 — Observe

System watches.

## Level 1 — Inform

System alerts.

## Level 2 — Recommend

System suggests.

## Level 3 — Prepare

System prepares an action.

## Level 4 — Execute Approved Actions

System automatically executes explicitly approved low-risk actions.

## Level 5 — Autonomous

Only for carefully authorized categories.

---

# PHASE 24 — AUDITABILITY

Every important automated or AI-assisted action should record:

- What happened
- Who initiated it
- Timestamp
- Source data
- AI recommendation
- Reason
- Confidence
- Approval
- Action taken
- Result
- HCP synchronization result

---

# PHASE 25 — SECURITY HARDENING

Security has already existed throughout development.

This phase is a formal security review/hardening pass.

Review:

- Authentication
- Authorization
- API security
- Database security
- Secrets
- File access
- Logging
- Audit trails
- Privacy
- Employee location
- Customer data
- AI data access
- Third-party integrations
- Dependency vulnerabilities
- Backup/recovery
- Incident response

---

# PHASE 26 — COMPLETE TESTING STRATEGY

Testing should exist throughout development.

Final testing expands into:

- Unit testing
- Integration testing
- API testing
- Database testing
- Authentication testing
- Authorization testing
- Security testing
- Mobile testing
- Offline testing
- Synchronization testing
- HCP integration testing
- AI evaluation
- Performance testing
- Failure/recovery testing
- Regression testing

---

# PHASE 27 — USER ACCEPTANCE TESTING

The actual user performs realistic workflows.

Examples:

### Technician

```text
Login
↓
My Day
↓
Open Job
↓
Navigate
↓
Arrive
↓
Diagnose
↓
Add Parts
↓
Pricing
↓
Request Help
↓
Complete
↓
Documentation
↓
Submit
```

### Dispatcher

```text
Login
↓
Operations
↓
See At-Risk Job
↓
Review Technician
↓
Review Recommendation
↓
Take Action
```

UAT failures return the phase to development.

---

# PHASE 28 — PRODUCTION READINESS

Verify:

- Environment configuration
- Secrets
- Database
- Backups
- Monitoring
- Logging
- Error tracking
- Performance
- Security
- Deployment
- Rollback
- Documentation
- Support procedures

---

# PHASE 29 — DEPLOYMENT

Production deployment occurs only after approval.

Deployment must be:

- Repeatable
- Documented
- Recoverable
- Verifiable

---

# PHASE 30 — MONITORING

Production Overwatch must be observable.

Monitor:

- Application errors
- API failures
- HCP synchronization
- Authentication failures
- Database health
- Queue failures
- Offline sync failures
- AI failures
- Performance
- Automation actions

---

# 14. FIRST VERTICAL SLICE

Before building the entire platform, prove the architecture with a complete small workflow.

## First Slice

```text
Technician Login
        ↓
Today's Jobs
        ↓
Open Job
        ↓
View Customer / Address / Description
        ↓
Change Job State
        ↓
Save State
        ↓
Authorization Check
        ↓
Database
        ↓
Event
        ↓
HCP Synchronization
        ↓
Audit Record
```

This slice must be:

- Secure
- Tested
- Documented
- Deployable
- Understandable
- Usable on the intended technician device

This is the first major architectural proof.

---

# 15. DATA MODEL — HIGH LEVEL

Expected major entities include:

```text
User
Employee
Role
Permission

Customer
Address
Property

Job
Appointment
JobState
JobEvent
JobOutcome

Technician
TechnicianSkill
Certification
Availability

Part
Inventory
PartUsage
PartRequest
PartOrder

Price
Estimate
PricingApproval

Communication
Message
Attachment

Location
ETA

Document
Photo
VoiceNote

Notification

Event

AIInteraction
AIRecommendation
AIAction

AuditLog
IntegrationSync
```

This list is intentionally not the final database schema.

The schema will be designed as each phase requires it.

---

# 16. DATA OWNERSHIP

For every important data type, Overwatch must know:

- Where it originated
- Who owns it
- Whether Overwatch can modify it
- Where it synchronizes
- What happens when systems disagree

Example:

```text
HCP Job
    ↓
Overwatch copy
    ↓
Technician updates Overwatch
    ↓
Overwatch validates
    ↓
HCP synchronization
```

---

# 17. AI RULES

AI must never silently:

- Invent customer information
- Invent pricing
- Invent inventory
- Override permissions
- Override hard scheduling constraints
- Change important records without authorization
- Hide uncertainty
- Make high-risk decisions without an approved workflow

AI should communicate uncertainty.

Example:

```text
Recommended technician:
John

Confidence:
87%

Reason:
- Certified for equipment type
- Completed 18 similar jobs
- Average duration 12% below company average
- Currently 14 minutes away
```

---

# 18. CHANGE CONTROL

Changes WILL happen.

That is expected.

A new idea does not mean the roadmap is broken.

When a new requirement appears:

1. Record it.
2. Determine which phase it belongs to.
3. Determine whether it changes an existing decision.
4. Determine dependencies.
5. Determine security implications.
6. Determine cost implications.
7. Determine whether completed work is affected.
8. Update the roadmap.
9. Continue without unnecessary rework.

## Do Not

- Randomly add features
- Rewrite completed systems without reason
- Change architecture because a new library looks interesting
- Add dependencies without evaluating them
- Skip phase gates

---

# 19. DECISION LOG

Important architectural decisions should be recorded.

Format:

```text
DATE:
DECISION:
WHY:
ALTERNATIVES:
IMPACT:
REVISIT WHEN:
```

Examples:

- Database selection
- Authentication provider
- HCP integration method
- Communication platform
- PWA vs native
- Hosting
- AI provider
- Offline architecture

---

# 20. RISK LOG

Track:

```text
RISK:
IMPACT:
LIKELIHOOD:
MITIGATION:
OWNER:
STATUS:
```

High-risk issues should be discovered early.

---

# 21. DEPENDENCY LOG

Track external dependencies.

```text
SERVICE:
PURPOSE:
COST:
FREE TIER:
CRITICALITY:
REPLACEMENT DIFFICULTY:
DATA STORED:
API:
STATUS:
```

This prevents hidden vendor lock-in.

---

# 22. CURRENT PROJECT DASHBOARD

## Current Phase

**Phase 0 — Discovery & Architecture**

## Current Objective

Create the final technical architecture and execution plan before implementation.

## Current Status

**NOT STARTED / ARCHITECTURE DEFINITION**

## Completed

- Overwatch vision established
- Technician-first direction established
- HCP remains initial system of record
- Job state model established
- Parts requirement established
- Pricing requirement established
- Part request requirement established
- Job outcome reasons established
- GPS/ETA requirement established
- Communication requirement established
- Offline requirement established
- Event-driven architecture direction established
- AI architecture direction established
- Security-by-design requirement established
- Two-branch Git workflow established
- Phase-gated development established
- Low-cost operating requirement established
- Code readability/commenting requirement established

## In Progress

- Final architecture
- Technology selection
- HCP integration research
- Communication infrastructure research
- GPS strategy
- Offline strategy
- Authentication strategy
- Database strategy
- Hosting strategy
- First vertical slice definition

## Blocked

None currently.

## Known Risks

- HCP API limitations
- HCP synchronization behavior
- iOS PWA limitations
- Background GPS limitations
- Push notification limitations
- Offline synchronization complexity
- Communication infrastructure cost
- AI operating cost
- Data volume
- Employee/customer privacy
- Future scale

## Next Major Step

Complete Phase 0 architecture and begin Phase 1 foundation.

---

# 23. PHASE COMPLETION RECORD

Every completed phase should be recorded.

```text
PHASE:
OBJECTIVE:

FUNCTIONALITY:
[ ] Complete

SECURITY:
[ ] Complete

TESTING:
[ ] Complete

USER ACCEPTANCE:
[ ] Complete

DOCUMENTATION:
[ ] Complete

DEPLOYMENT:
[ ] Complete

PRODUCTION VERIFICATION:
[ ] Complete

KNOWN ISSUES:
None / Listed below

DECISIONS MADE:

DATE COMPLETED:

APPROVED TO MOVE FORWARD:
Yes / No
```

---

# 24. FAILURE PROTOCOL

If something does not work:

We do not immediately patch randomly.

Instead:

1. Reproduce the problem.
2. Determine where the failure occurs.
3. Identify the root cause.
4. Explain the cause.
5. Determine whether architecture is affected.
6. Fix the smallest correct layer.
7. Test the fix.
8. Regression-test affected functionality.
9. Document the issue if it could recur.
10. Continue only after the affected functionality is stable.

---

# 25. NO MAGIC CHANGES

The assistant should never silently:

- Change architecture
- Replace a library
- Change database structure
- Change authentication
- Change deployment
- Remove functionality
- Modify requirements

without explaining the reason.

If a change is necessary, document it.

---

# 26. DOCUMENTATION REQUIREMENTS

The project should eventually contain:

```text
PROJECT_STATE.md
README.md
ARCHITECTURE.md
SECURITY.md
DATABASE.md
API.md
DEPLOYMENT.md
TESTING.md
```

Additional documentation can be created when justified.

---

# 27. PRODUCTION PHILOSOPHY

"Production" does not mean:

> It works on my computer.

Production means:

- Secure
- Tested
- Recoverable
- Documented
- Observable
- Usable
- Deployable
- Supported
- Verified

---

# 28. WHAT "SHIPPABLE" MEANS

Every phase must produce something that could reasonably be handed to its intended users or used as a stable foundation for the next phase.

A phase should not leave behind:

- Known critical bugs
- Unprotected APIs
- Broken permissions
- Unhandled obvious failures
- Undocumented architecture
- Untested critical workflows
- Temporary hacks that are being treated as permanent
- Data corruption risks

Temporary implementations are allowed during development only when clearly documented and intentionally scheduled for replacement.

---

# 29. LONG-TERM END STATE

The ultimate Overwatch vision is:

```text
                    OVERWATCH
                         │
        ┌────────────────┼────────────────┐
        │                │                │
     FIELD             OFFICE          EMPLOYEE
     USERS             USERS            USERS
        │                │                │
        └────────────────┼────────────────┘
                         │
                 OPERATIONAL CORE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
       HCP             HR/WFM          OTHER SYSTEMS
        │                │                │
        └────────────────┼────────────────┘
                         │
                  EVENT / DATA LAYER
                         │
                ┌────────┴────────┐
                │                 │
             RULES               AI
                │                 │
                └────────┬────────┘
                         │
                 RECOMMENDATIONS
                         │
                    AUTOMATION
```

Over time, Overwatch should understand:

- What is happening
- What has happened
- What is likely to happen
- What needs attention
- What should happen next
- What action can safely be automated

---

# 30. ULTIMATE GOAL

Overwatch should eventually become the company's operational intelligence layer.

It should help answer:

> What is happening?

> Why is it happening?

> What is going to happen?

> What should we do?

> Can Overwatch prepare it?

> Can Overwatch safely do it?

The ultimate goal is not simply to build another app.

The goal is to build a system that **understands the operation and helps the people running it make better decisions faster.**

---

# 31. CURRENT BUILD ORDER

The initial order is locked as:

```text
0   Discovery & Architecture
1   Project Foundation
2   Identity & Permissions
3   HCP Integration Foundation
4   Technician My Day
5   Job State Machine
6   GPS & ETA
7   Job Documentation
8   Parts
9   Pricing
10  Part Requests / Office Assistance
11  Job Outcome Intelligence
12  Communication
13  Offline
14  Customer Experience
15  Event Bus
16  AI Intake
17  AI Watchdog
18  AI Assistant
19  Scheduling Intelligence
20  Operational Learning
21  Office Overwatch
22  Employee Portal
23  Automation
24  Auditability
25  Security Hardening
26  Complete Testing
27  UAT
28  Production Readiness
29  Deployment
30  Monitoring
```

Security, authentication, authorization, testing, documentation, and deployment requirements are **not actually deferred to their listed phases**.

They are built into every applicable phase.

Phases 25–30 represent formal hardening, verification, and production-readiness activities.

---

# 32. THE RULE FOR EVERY FUTURE FEATURE

Whenever a new feature is proposed, evaluate:

### 1. Why?

What problem does it solve?

### 2. Who?

Who uses it?

### 3. What data?

What information does it require?

### 4. Security?

Who is allowed to see/change it?

### 5. Integration?

Does another system need to know about it?

### 6. Offline?

Does it need to work without connectivity?

### 7. AI?

Does AI actually add value?

### 8. Cost?

Does it introduce an ongoing cost?

### 9. Testing?

How will we prove it works?

### 10. Phase?

Where does it belong?

### 11. Definition of Done?

What must be true before it is considered complete?

---

# 33. PROJECT COMPLETION DEFINITION

Overwatch is not "finished" when the original feature list is checked off.

The system is successful when:

- Technicians can perform their work efficiently.
- Office staff can see what is happening.
- Customers receive appropriate information.
- Information is entered once.
- HCP remains synchronized.
- Important operational events are visible.
- The company understands why work succeeds or fails.
- Scheduling improves from actual operational data.
- AI provides useful, grounded intelligence.
- Automation is controlled and auditable.
- Employees have a unified operational experience.
- The system is secure.
- The system is reliable.
- The system can evolve without becoming unmaintainable.

---

# 34. GOLDEN RULES

These rules override convenience.

### Rule 1

**Do not skip a phase gate.**

### Rule 2

**Security is built in from the beginning.**

### Rule 3

**A feature is not done until it is tested and accepted.**

### Rule 4

**Do not build months of functionality before proving the architecture works.**

### Rule 5

**Prefer simple, understandable code over clever code.**

### Rule 6

**Comment important code so the project owner can learn from it later.**

### Rule 7

**Do not introduce unnecessary paid services.**

### Rule 8

**Do not let AI become the source of truth for deterministic information.**

### Rule 9

**Never silently change architecture or requirements.**

### Rule 10

**Every important operational action must be explainable and auditable.**

### Rule 11

**A job that does not get completed must have a known reason and appropriate next action.**

### Rule 12

**Technicians should enter information once whenever reasonably possible.**

### Rule 13

**HCP remains the initial system of record unless a deliberate architectural decision changes that.**

### Rule 14

**The roadmap can change, but changes must be intentional and documented.**

### Rule 15

**The goal is not to write the most code. The goal is to build the correct system.**

---

# 35. STARTING POINT

## Current Status

**PHASE 0 — DISCOVERY & ARCHITECTURE**

## We are NOT coding the full application yet.

The immediate objective is to finish the architecture decisions necessary to safely begin Phase 1.

## First implementation target

The first real vertical slice will be:

```text
Secure Technician Login
        ↓
Today's Jobs
        ↓
Open Job
        ↓
View Job Information
        ↓
Change Job State
        ↓
Persist Change
        ↓
Create Event
        ↓
Audit Change
        ↓
Synchronize With HCP
```

Once this slice works end-to-end, securely, locally, through `dev`, through testing/UAT, and through deployment verification, we have proven the foundation.

Then we build the next slice.

---

# 35A. ARCHITECTURE DECISIONS LOG (Phase 0)

This section records decisions made during Phase 0 so we never lose the reasoning behind them (Rule 9 — never silently change architecture).

## Decision: Technology Stack (Locked)

**Date logged:** Phase 0, first build session.

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript (frontend + backend) | Industry standard for serious Node/React projects; catches errors before runtime; project owner has some familiarity from other projects and wants to learn it as we build. |
| Backend runtime/framework | Node.js + Express | Node is the most-used web technology among developers (Stack Overflow 2025), and Express is the most widely used Node framework. Using JavaScript/TypeScript on both frontend and backend keeps the project to one language, which matters for the teaching goal. Express chosen over NestJS specifically because it is minimal/unopinionated — the owner sees every piece of what's happening rather than framework "magic." |
| Database | PostgreSQL (hosted on Neon) | PostgreSQL is the most-used, most-admired, and most-desired database among professional developers (Stack Overflow 2025), is free/open-source/self-hostable (fits Section 5 cost philosophy), and provides strong ACID guarantees needed for job state, pricing, and audit data. Neon specifically chosen because the owner already uses it, it has a generous free tier, scales to zero when idle, and its database branching feature mirrors the project's `dev`/`main` git branch workflow (Section 7). |
| ORM | Prisma | Owner already uses it; makes schema and relationships readable (supports the teaching goal in Section 3); industry-standard pairing with Postgres + Node. |
| Frontend | React + Vite + vite-plugin-pwa | React remains the dominant frontend library; Vite is the current standard build tool (replacing deprecated Create React App); vite-plugin-pwa handles the service worker, offline caching, and installable-app manifest needed for the PWA requirement. |
| Hosting | Vercel | Owner already uses it; strong fit for the React/Vite frontend; free tier and per-branch preview deploys support the UAT step in the phase process (Section 9, Step 6). |

**Portability requirement:** To avoid vendor lock-in (Section 5), core business logic must not depend on Vercel-specific APIs beyond deployment configuration. Prisma keeps the database swappable. The Express backend and React frontend must remain deployable to any standard Node host (e.g. Render, Railway, Fly.io, a VPS) without a rewrite, in case the project needs to move off Vercel/Neon later or ship as a self-hosted white-label product.

## Decision: Backend Architecture Shape — Serverless Functions

Because Vercel runs backend code as short-lived serverless functions rather than an always-on server, Overwatch's backend is designed around short request/response cycles from the start, rather than a traditional long-running Express process. This affects two areas directly:

- **Real-time features** (see below): designed around polling instead of persistent connections.
- **Scheduled/background work** (e.g. periodic HCP reconciliation): must be implemented as cron-triggered functions, not long-running background loops.

Risk: if a future feature genuinely requires a persistent connection (e.g. a live dispatch board watching many technicians simultaneously), a small dedicated real-time service would need to be added alongside Vercel. This is not needed now and is not blocking any current phase.

## Decision: Real-Time Updates — Polling, Not WebSockets (For Now)

GPS location and job-state "live" views will be implemented via short-interval polling (roughly every 15–30 seconds) rather than a WebSocket/real-time service. This is sufficient for a service-dispatch use case, costs nothing extra, and avoids introducing a new service/failure mode during early phases. If usage later demands true real-time (e.g. a dispatch board watching many technicians at once), the upgrade path is to add a managed real-time layer (e.g. Pusher, Supabase Realtime) on top — this does not require rearchitecting the rest of the system.

## Decision: Multi-Tenant Data Model From Day One

Overwatch will be built as a single-tenant *product* (serving the owner's company only) on top of a multi-tenant-*ready* data model, to preserve a future white-label path without a painful retrofit.

Concretely:

- Every core table (jobs, customers, users, parts, pricing, etc.) includes an `organization_id` from the start.
- All queries are scoped by organization as a consistent pattern in the data access layer.
- The database is seeded with exactly one organization (the owner's company) for now.

Explicitly deferred (not built now, would go through the Section 32 feature-evaluation process if/when pursued): per-tenant branding/theming, new-company signup flow, billing/subscription system, multi-org admin console, cross-tenant isolation testing.

## Forward-Looking Note: White-Label Customers Without HCP

A future white-label customer may not use Housecall Pro at all. This is compatible with the architecture already in place, as long as one principle is followed going forward: Overwatch's own `Job`/`Customer`/etc. models (once built) must be designed as Overwatch's own first-class records, not a schema shaped to mirror HCP's data specifically. Concretely, this means:

- Any field that only makes sense for HCP-sourced data (e.g. an `hcpJobId`) must be optional, not required — present only when relevant.
- Each `Organization` will need a field indicating its data source (e.g. `dataSource: "housecall_pro" | "native"`), determining whether jobs/customers arrive via the `HcpSyncSource` abstraction (Section 35A) or are created directly through Overwatch's own UI.
- Everything built on top of `Job`/`Customer` (permissions, state machine, technician app) should not need to know or care which source populated the record.

This requires no work now — it is a constraint to keep in mind when the `Job`/`Customer` schema is actually designed (Phase 3/4), not a feature to build today. A full standalone job-creation/scheduling UI (for a non-HCP customer) is a substantial feature in its own right and would be evaluated and scheduled as its own phase if/when a real non-HCP customer exists.

## OPEN BLOCKER: HCP Webhook/API Tier Unknown

Phase 0 exit criteria requires "HCP integration strategy documented," which cannot be fully completed until we know what the owner's current Housecall Pro plan supports.

**Action required (owner):** Confirm with HCP (account settings or HCP support/sales) whether the current plan includes webhook access and/or full API access, and which events/endpoints are included.

**Design mitigation (already decided, works regardless of answer):** The HCP sync layer will be built as an abstraction — an `HcpSyncSource` concept — that can be satisfied by either a webhook receiver (push) or a scheduled polling job against HCP's read API (pull). The rest of Overwatch (job records, state machine, events) consumes "HCP data changed" without caring which mechanism delivered it. If webhook access is unavailable, the system falls back to polling with no loss of functionality, only reduced immediacy. If webhook access is confirmed or added later, the push path can be added without touching downstream logic.

This blocker does not stop Phase 1 (Project Foundation) work, but must be resolved before Phase 3 (HCP Integration Foundation) begins.

---

# 35B. PHASE 1 PROGRESS LOG

## Completed

- [x] Repository initialized, `main`/`dev` branch structure established (Section 7)
- [x] npm workspaces monorepo structure created (`web/` frontend, `api/` backend)
- [x] Backend foundation: Express app (TypeScript, strict mode), health check endpoint (`/api/health`), centralized error handler
- [x] Frontend foundation: React + Vite + TypeScript, `vite-plugin-pwa` configured (manifest + service worker generation verified via production build)
- [x] Frontend-to-backend connectivity proven end-to-end (dev proxy locally; `vercel.json` rewrite defined for production)
- [x] `npm install && npm run dev` verified working from a clean install — starts both frontend and backend together (Section 6 target met)
- [x] Prisma installed and connected to the real Neon database (not just configured — `prisma generate` and `prisma migrate dev` both run successfully against the live database)
- [x] First real migration applied: `Organization` model exists as an actual table in Neon, establishing the multi-tenant-ready foundation decided in Section 35A
- [x] Root `.gitignore` protecting `.env` and other secrets from being committed (Section 11)
- [x] Repository pushed to GitHub, `main` and `dev` branches both live and in sync (private repo: `yhwhdesign/gdg-overwatch`)
- [x] Structured logging (Pino) added — every request auto-logs method/status/response time; startup and error paths route through the shared logger instead of raw console calls
- [x] Baseline API protection added: Helmet (security headers), rate limiting (100 req/15min per IP), 1MB JSON body size cap
- [x] Sensitive header redaction added to the logger (cookies, Authorization) after a real cookie value was observed appearing in plaintext dev logs during testing — fixed before any real session/auth data existed

## In Progress / Not Yet Done

- [x] Deployment to Vercel performed and verified — `api/index.ts` confirmed working as a real serverless function in production (frontend successfully reached the deployed API and showed "Connected."). Note: this confirms the serverless function itself works, but not yet the Neon database connection from Vercel's environment specifically, since the health check route doesn't touch the database — that gets a real test once Phase 2 adds a database-backed route.
- [ ] No authentication/authorization yet — that is Phase 2, not Phase 1
- [x] Dependency security scanning automated via GitHub Dependabot (weekly scans across root/api/web)
- [ ] README/API/ARCHITECTURE docs beyond PROJECT_STATE.md not yet started (Section 26)

## Known Blockers

- HCP webhook/API tier still unconfirmed (see Section 35A) — does not block remaining Phase 1 work, but must be resolved before Phase 3 begins.

## Lessons Learned This Session

- `api/.env` was briefly committed locally before being caught and removed via `git rm --cached` + amend, before it was ever pushed. No real exposure occurred, but the takeaway: double-check `git status` before the *first* commit in a new repo to confirm `.gitignore` is actually excluding what it should.
- When creating a new GitHub repo to push an existing local repo into, leave README/.gitignore/license checkboxes unchecked — checking any of them creates a conflicting initial commit and requires an unrelated-histories merge to fix (as happened here).
- A transitive dependency (`qs`, via `body-parser`/`express`) had a known moderate-severity vulnerability that `npm audit fix` couldn't auto-resolve because upstream (`body-parser`) hadn't updated its declared version range yet. Fixed via an npm `overrides` entry forcing the patched version — this must live in the ROOT `package.json` in an npm workspaces setup, not the individual workspace's, since npm manages one shared dependency tree.
- `pino-http`'s default request logging captures full HTTP headers, including cookies and Authorization tokens. This was caught in practice — a stale, unrelated browser cookie appeared in plaintext in local dev logs — before any real session/auth system existed. Fixed by adding a `redact` config to the logger (removes `req.headers.cookie`, `req.headers.authorization`, and `set-cookie` from every log line entirely). This must be treated as a non-negotiable default going forward, not something to remember to add later once Phase 2 introduces real sessions.
- A zip file used to hand off code changes had an incorrect internal path (`api/app.ts` instead of `api/src/app.ts`), and extracting/replacing with it wiped out the rest of the `api/` folder. Recovered cleanly via `git restore` since everything except `.env` was already committed. Going forward: hand off file changes as direct copy-paste content or exact single-file replacements, not zipped folder merges, to avoid structural mismatches.

## Next Step

Phase 1's core build items are complete: working monorepo, frontend/backend connectivity, database connection with first migration, structured logging, baseline API protections, automated dependency scanning, and a verified production deployment.

Before formally starting Phase 2 (Identity & Permissions), do a final pass against Phase 1's Definition of Done checklist (Section "PHASE 1 — PROJECT FOUNDATION") to confirm nothing was missed. Then Phase 2 begins with deciding the actual authentication approach for technician login (see Phase 0's open question on auth architecture).

---

# 35C. PHASE 2 PROGRESS LOG (Identity & Permissions)

## Architecture Decision: Server-Side Sessions, Not JWT

Chosen specifically because sessions can be revoked instantly (delete the row / flip `isActive` to false = access is cut off immediately, everywhere), which matters for a workforce app where someone's access may need to end the moment they're let go. This was tested for real, not just assumed: a live session was proven to stop working on the very next request after setting `isActive: false`, with no delay and no need to hunt down/delete the specific session token.

## Architecture Decision: Capability-Based Permissions, Not Roles

`User.capabilities` is a flat string array (e.g. `["admin"]`, eventually things like `"jobs:view_own"`, `"jobs:edit_status"`) checked by name via `requireCapability(...)` middleware, rather than a single rigid `role` field. The `"admin"` capability acts as a universal override. Chosen to avoid the common failure mode where a fixed role enum can't express a real permission need (e.g. "office staff who can view pricing but not edit it") without a schema change.

## Completed

- [x] `User` and `Session` Prisma models added, scoped to `Organization` (multi-tenant pattern from Phase 0 carried through)
- [x] Password hashing via bcrypt (cost factor 12), isolated to `auth/passwords.ts`
- [x] Session creation/lookup/deletion (`auth/sessions.ts`) using a cryptographically random token as the session's primary key
- [x] `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` implemented and verified against the real database (not just type-checked)
- [x] Login has its own stricter rate limit (10/15min) separate from the general API limit (100/15min), to make brute-forcing impractical
- [x] Login failure messages are deliberately generic/identical for "no such user" vs "wrong password" to prevent user-enumeration
- [x] `requireAuth`/`requireCapability` Express middleware, verified with a real protected test route (`GET /api/admin/ping`) against all three states: logged out (401), logged in without capability, logged in with capability (200)
- [x] CORS updated from a wildcard to an explicit origin + `credentials: true`, required once cookies were introduced (a wildcard origin cannot be combined with credentialed requests)
- [x] Cookie security: `httpOnly` (blocks JS/XSS access), `Secure` in production, `SameSite=Strict` (primary CSRF defense)
- [x] Shared Prisma client (`src/db.ts`) added with the serverless connection-reuse pattern, to avoid exhausting Neon's connection limit under repeated Vercel function invocations
- [x] Seed script (`prisma/seed.ts`) creates the first Organization + admin User from env vars, since there is no self-signup flow by design
- [x] Frontend: `AuthContext`, `api.ts` fetch wrapper (always sends credentials), `LoginForm`, and an auth-aware `App.tsx` — verified working in a real browser against the real backend (login, session persistence across refresh, logout)
- [x] Sensitive-header log redaction (added in Phase 1) re-verified as still working correctly with real session cookies now in play

## Architecture Decision: Master/Admin Capability Hierarchy

Added a `master` capability that sits above `admin`. `master` can do everything `admin` can, plus assign or change ANY user's capabilities (including granting/revoking `admin` or `master` itself). `admin` can manage users (create, activate/deactivate) but is explicitly blocked — server-side, in `requireCapability`'s override logic and in `routes/users.ts`'s `isMaster()` checks — from touching capabilities on any account, including their own. This exists so day-to-day user administration doesn't require the ability to self-escalate or grant elevated access to others. The seed script now grants the very first account `master`, not `admin`, since only `master` can ever grant `master` — an `admin`-only first account would have no path to ever create a master user.

## Known Follow-Ups

- The seed-script admin password was typed into chat during testing and should be rotated (low urgency: local dev only, never left this machine).
- Login/change-password/admin UI is functional but deliberately unstyled — real visual design (including the DoorDash/Uber Eats-inspired live job-tracking concept explored during this phase, and the owner's actual brand at thegaragedoorguycorp.com) is planned as its own dedicated design pass once more of the app exists.
- No frontend route protection yet (e.g. redirecting away from a protected page) — not needed yet since there's only one page with a simple tab toggle, but will matter once real routing exists.
- No password-reset-if-forgotten flow (distinct from the forced-change-on-first-login flow) — will need one eventually, likely still without email per the zero-cost policy (e.g. an admin-triggered reset that reissues a new temporary password).
- The master/admin distinction currently only covers the two capabilities that exist so far (`admin`, `master`) — as real business capabilities are added (e.g. `jobs:edit_status`), the same "only master can change capabilities" rule automatically covers them too, since it gates on touching the `capabilities` field at all, not on which specific values are being set.

## Completed (continued)

- [x] `mustChangePassword` flag added to `User`; enforced both server-side (`requirePasswordSet` middleware blocks all business routes until cleared) and in the frontend (forced `ChangePasswordForm` screen) — verified end-to-end in a real browser, not just via curl
- [x] Admin-only user management routes: `POST /api/users` (create, returns a one-time temporary password), `GET /api/users` (list), `PATCH /api/users/:id` (update capabilities/isActive/name) — all scoped to the admin's organization
- [x] `POST /api/auth/change-password` — handles both the forced first-time case (no current password needed, since login moments earlier already proved identity) and a voluntary change case (requires current password as re-authentication)
- [x] Full flow verified for real: admin created a test technician account via the API, logged in as that account in a separate browser session with the temp password, was correctly forced into the password-change screen before reaching anything else, and landed in the normal authenticated view after setting a real password
- [x] Admin UI (`AdminUsersPage`) built and verified in the browser: create user (temp password shown once), list users, toggle active/deactivated status — all driven through the real API, with the actual enforcement living server-side (`requireCapability("admin")`), not in the UI
- [x] Master/admin capability hierarchy added and verified: `master` capability can assign/change capabilities on any user (including granting `admin`/`master`); `admin` alone is blocked from this both in the UI (controls simply don't appear) and server-side (`isMaster()` check in `routes/users.ts`, independent of the UI)

## Next Step

Phase 2's core scope is complete, including the master/admin hierarchy. Before moving to Phase 3, confirm the HCP integration tier blocker (Section 35A) is resolved if possible, since Phase 3 (HCP Integration Foundation) depends on it. If still blocked, the next productive step is starting the first real vertical slice's non-HCP-dependent pieces: technician login → "today's jobs" UI shell (with placeholder/mock job data until HCP integration unblocks), per the Phase 0 vertical-slice plan.

---

# 35D. COST POLICY — EXPLICIT

This section exists because the project owner asked for unambiguous clarity on cost, including in production, not just during development. It restates and sharpens Section 5's cost philosophy with specifics.

## The Principle

Default to free, open-source, and self-hosted options. No paid service, tier upgrade, or new third-party dependency gets added without going through the Third-Party Dependency Rule (Section 5): what it does, why it's needed, alternatives considered, cost, and an exit plan — and without the project owner's explicit sign-off.

## Honest Current-Cost Assessment (do not skip this — it matters)

Everything in the stack today is free to develop with. Two things are worth knowing now, not discovering later:

1. **Vercel's free "Hobby" tier is intended for personal/non-commercial projects.** Its terms of service technically expect real commercial/business use to be on a paid plan (Pro starts around $20/month). Overwatch, once it's genuinely running day-to-day dispatch operations for a real company rather than being developed/tested, is commercial use — staying on Hobby at that point is a terms-of-service gray area, not a guaranteed-safe permanent free path. This is the most likely near-term real cost the project will face.
2. **Neon's free tier has usage limits** (compute time, storage, data transfer) that are generous for development and early production but are not unlimited. This ceiling is further out than Vercel's and less urgent, but not indefinite.

Everything else currently in use (GitHub private repos, Dependabot, Prisma ORM itself, all current npm packages) has no realistic cost ceiling at this project's scale.

## What This Means Practically

- Development and early testing: genuinely $0.
- The first real cost the project will likely need to accept, once technicians are actually using this for real work, is Vercel Pro (~$20/month) — this should be budgeted for as a known, near-term, small cost rather than treated as a surprise.
- Any other paid addition (email service, SMS, real-time infrastructure, etc.) gets evaluated individually and explicitly before adoption — nothing gets added "because it's convenient."

---

# 36. PROJECT STATE UPDATE RULE

At the end of every meaningful development session, PROJECT_STATE.md should be updated when the state has materially changed.

At minimum, update:

- Current phase
- Current objective
- Completed work
- In-progress work
- Blockers
- Known issues
- Decisions
- Security status
- Testing status
- Next step

This prevents the project from losing its place.

---

# FINAL PROJECT PRINCIPLE

> **Build it correctly.**
>
> **Secure it as we build it.**
>
> **Test it before moving on.**
>
> **Make it understandable.**
>
> **Document the decisions.**
>
> **Ship each phase.**
>
> **Then build the next piece.**
>
> **Never sacrifice the foundation just to move faster.**