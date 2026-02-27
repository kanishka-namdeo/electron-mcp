---
alwaysApply: true
---
# New Creation Process for SOLO Coder

This document defines the standard process SOLO Coder MUST follow when a user requests to create something new (features, applications, systems, etc.).

---

## Process Overview

```
User Request → Phase 1: Requirements & Research → [Deliverables: PRD, Research Findings, RTM] → [User Approval]
           → Phase 2: Architecture & Design → [Deliverables: TAD, API Specs, DB Design, UI/UX Specs] → [User Approval]
           → Phase 3: Implementation Planning → [Deliverables: Impl Plan, Test Plan, CI/CD Strategy] → [User Approval]
           → Phase 4: Development → [Deliverables: Working Code, Documentation]
           → Phase 5: Testing & Quality → [Deliverables: Test Results, Performance Metrics] → [User Approval]
           → Phase 6: Deployment → [Deliverables: Deployed System, Monitoring Setup]
```

### Key Principle: Documentation Before Development

**This process enforces a strict documentation-first approach**. Before any development code is written, the following MUST be completed and approved:

| Phase | Documentation | Purpose |
|-------|---------------|----------|
| **Phase 1** | Product Requirements Document (PRD), Research Findings, Requirements Traceability Matrix | Define WHAT to build |
| **Phase 2** | Technical Architecture Document, API Specifications, Database Design, UI/UX Specifications, Security & Compliance, Infrastructure Plan | Define HOW to build it |
| **Phase 3** | Implementation Plan, Test Plan, Quality Metrics, CI/CD Strategy, Timeline, Definition of Done | Define HOW to execute and validate |

**No development begins until Phases 1-3 are complete and approved.**

---

## Phase 1: Requirements & Research

**Goal**: Understand what to build and gather necessary context

### Actions

1. **Create TodoWrite** with high-level tasks for Phase 1

2. **Launch Agents** (MAX 3 per batch):

   **IMPORTANT: Agent Context Instructions**
   - Pass user request and any provided context to each agent
   - Inform agents they will create documentation in `.trae/docs/phase-1/`
   - Instruct agents to structure their outputs for document creation
   - Request agents provide content organized by document sections

   **Batch 1 - Parallel (Independent):**
   - **researcher**: External research for similar solutions, best practices, and competitive analysis
   - **search**: Search codebase for existing patterns or similar implementations
   - **architect**: Initial feasibility assessment and high-level approach

3. **Synthesize Results** and present to user:
   - Summary of findings
   - Recommended approach
   - Key considerations and trade-offs

4. **Create Documentation Files** (MANDATORY - MUST create actual files):
   - Create `.trae/docs/phase-1/` directory if it doesn't exist
   - Write `01-technology-research.md` with Technology Research & Latest Packages Document
   - Write `02-prd.md` with Product Requirements Document
   - Write `03-research-findings.md` with Research Findings Document
   - Write `04-requirements-traceability-matrix.md` with Requirements Traceability Matrix
   - Verify all files exist and contain complete, documented content
   - Present file paths to user for review

### Deliverables Required

Before proceeding to Phase 2, following MUST be documented:

#### Technology Research & Latest Packages Document
- **Technology Stack Research**: Research latest packages and frameworks for chosen technology stack
- **Package Comparison**: Compare latest versions with alternatives, considering:
  - Popularity and community support
  - Active maintenance and recent updates
  - Security vulnerabilities and known issues
  - Performance benchmarks
  - Compatibility with existing codebase
- **Latest Package Recommendations**: List of recommended packages with:
  - Package name and latest version
  - Installation commands
  - Key features and benefits
  - Migration notes if upgrading from older versions
- **Unknown Package Learning**: If any package is unfamiliar:
  - Create task: "Learn and document [package name] usage"
  - Research official documentation, tutorials, and best practices
  - Create or update skill file with package usage patterns

#### Product Requirements Document (PRD)
- **Product Vision**: High-level vision and objectives
- **User Personas**: Target user profiles, behaviors, needs, and pain points
- **User Stories**: Specific user-facing requirements with acceptance criteria
- **Functional Requirements**: Detailed feature descriptions
- **Business Rules**: Logic and constraints governing system behavior
- **Non-Functional Requirements**: Performance, security, accessibility, scalability
- **MVP Definition**: Minimum Viable Product scope with clear feature boundaries
- **Success Criteria**: Measurable KPIs and acceptance criteria

#### Research Findings Document
- **Competitive Analysis**: Market landscape and competitive differentiation
- **Best Practices**: Industry standards and recommended approaches
- **Technology Options**: Available options with trade-offs
- **Risks Identified**: Potential technical and business risks

#### Requirements Traceability Matrix
- Link user stories to business requirements
- Map requirements to acceptance criteria
- Identify dependencies between requirements

### Approval Checklist

Before approving Phase 1, user should confirm:
- [ ] Requirements are clear and complete
- [ ] User personas are well-defined
- [ ] MVP scope is agreed upon
- [ ] Success criteria are measurable
- [ ] Known risks are documented and acceptable
- [ ] Technology stack is researched with latest stable packages
- [ ] All unfamiliar packages have documented learning plan or skills created
- [ ] Package recommendations include version compatibility analysis

4. **Wait for User Approval** before proceeding to Phase 2

---

## Phase 2: Architecture & Design

**Goal**: Design the solution architecture and user experience

### Actions

1. **Update TodoWrite** with Phase 2 tasks

2. **Launch Agents** (MAX 3 per batch):

   **IMPORTANT: Agent Context Instructions**
   - Read and provide all Phase 1 documents (`.trae/docs/phase-1/*.md`) to each agent
   - Require agents to study: PRD, Research Findings, Requirements Traceability Matrix
   - Instruct agents to align designs with Phase 1 requirements
   - Request agents identify any gaps or conflicts with Phase 1 requirements
   - Inform agents they will create documentation in `.trae/docs/phase-2/`
   - Instruct agents to structure their outputs for document creation
   - Request agents provide content organized by document sections

   **Batch 1 - Parallel (Independent):**
   - **architect**: Create technical architecture, define technology stack, design system structure
   - **frontend-developer**: Design UI components, user interactions, responsive layout (if applicable)
   - **database-engineer**: Design data model, schema, and data flow (if applicable)

3. **Synthesize Results** and present to user:
   - Architecture diagrams and technical design
   - UI/UX mockups or component specifications
   - Database design (if applicable)
   - Technology stack with justification

4. **Create Documentation Files** (MANDATORY - MUST create actual files):
   - Create `.trae/docs/phase-2/` directory if it doesn't exist
   - Write `01-technology-stack-specification.md` with Technology Stack & Latest Packages Specification
   - Write `02-technical-architecture.md` with Technical Architecture Document (TAD)
   - Write `03-api-specifications.md` with API Specifications (if applicable)
   - Write `04-database-design.md` with Database Design Document (if applicable)
   - Write `05-ui-ux-design-specs.md` with UI/UX Design Specifications
   - Write `06-security-compliance.md` with Security & Compliance Document
   - Write `07-infrastructure-plan.md` with Infrastructure & Environment Plan
   - Verify all files exist and contain complete, documented content
   - Present file paths to user for review

### Deliverables Required

Before proceeding to Phase 3, following MUST be documented:

#### Technology Stack & Latest Packages Specification
- **Technology Stack Details**: Confirm final technology stack with latest stable versions
- **Package Inventory**: Complete list of all packages and dependencies with:
  - Package name and exact version
  - Purpose and usage context
  - Latest stable version number
  - Security advisories or known vulnerabilities
- **Package Compatibility Matrix**: Ensure all packages are compatible with each other
- **Unknown Package Handling**: For any unfamiliar packages:
  - Create task: "Learn and document [package name] usage patterns"
  - Research official docs, community resources, and best practices
  - Create or update skill file with:
    - Common usage patterns
    - API patterns and conventions
    - Gotchas and common pitfalls
    - Integration examples with this codebase

#### Technical Architecture Document (TAD)
- **System Architecture Overview**: High-level architecture diagram
- **Technology Stack**: Detailed stack with justification for each choice
- **Component Design**: Major components and their responsibilities
- **Integration Architecture**: Third-party integrations and external APIs
- **Security Architecture**: Authentication, authorization, and security measures
- **Data Flow Diagrams**: How data flows through the system
- **Scalability Design**: How system handles growth and increased load
- **Technical Standards**: Coding standards, review processes, and development practices

#### API Specifications (if applicable)
- **API Contract**: Endpoint definitions, methods, and paths
- **Request/Response Formats**: JSON schemas, data types, and validation rules
- **Authentication Methods**: How API security is handled
- **Error Handling**: Error codes, messages, and handling strategies
- **Rate Limiting**: API rate limits and throttling strategies

#### Database Design Document (if applicable)
- **Entity-Relationship Diagram**: Visual representation of data model
- **Table Schemas**: Detailed table structures with field types and constraints
- **Relationships**: Primary keys, foreign keys, and relationship types
- **Indexing Strategy**: Indexes for performance optimization
- **Data Migration Plan**: How existing data will be migrated (if applicable)
- **Backup & Recovery Strategy**: Database backup and restoration procedures

#### UI/UX Design Specifications
- **User Journey Maps**: End-to-end user experience flows and touchpoints with pain points identified
- **User Flow Diagrams**: Visual representation of user paths through the application
- **Wireframes**: Low-fidelity structural layouts and component placement for all key screens
- **High-Fidelity Mockups**: Detailed visual designs with final styling for all components
- **Design System / Style Guide**: Comprehensive component library with:
  - **Design Tokens**: Colors, typography, spacing, shadows, border radius
  - **Component Library**: Reusable UI components (buttons, inputs, modals, etc.)
  - **Pattern Library**: Common interaction patterns (search, filters, forms)
  - **Icon System**: Consistent icon set with usage guidelines
  - **Layout System**: Grid system, breakpoints, responsive patterns
- **Interaction Specifications**: Animations, transitions, micro-interactions, and interaction behaviors
- **Accessibility Design Standards**: WCAG 2.1 AA compliance and inclusive design guidelines
- **Responsive Design Specifications**: Layouts and breakpoints for mobile, tablet, and desktop
- **Design Handoff Documentation**: Developer-ready specifications with measurements, spacing, and states
- **Motion Design Guidelines**: Animation timing, easing functions, and performance considerations

#### Security & Compliance Document
- **Security Requirements**: Authentication, authorization, data protection
- **Compliance Requirements**: Regulatory requirements (GDPR, HIPAA, etc.)
- **Data Privacy**: How user data is collected, stored, and protected
- **Threat Model**: Potential security threats and mitigation strategies

#### Infrastructure & Environment Plan
- **Development Environment**: Local development setup and requirements
- **Staging Environment**: Pre-production environment specifications
- **Production Environment**: Production environment specifications
- **Hosting Strategy**: Cloud provider, regions, and infrastructure choices
- **Monitoring & Logging**: System monitoring, logging, and alerting setup
- **Disaster Recovery Plan**: Backup strategies and recovery procedures

### Approval Checklist

Before approving Phase 2, user should confirm:
- [ ] Architecture design is complete and clear
- [ ] Technology stack is justified and agreed upon
- [ ] UI/UX designs address user needs and pain points
- [ ] Design system is comprehensive with:
  - [ ] Complete component library with all necessary components
  - [ ] Design tokens defined (colors, typography, spacing, etc.)
  - [ ] Consistent interaction patterns documented
  - [ ] Accessibility standards (WCAG 2.1 AA) incorporated
  - [ ] Responsive design specifications for all breakpoints
  - [ ] Motion and animation guidelines defined
- [ ] Design consistency verified across all screens and components
- [ ] Database design (if applicable) is comprehensive
- [ ] Security requirements are addressed
- [ ] Infrastructure plan is viable
- [ ] All diagrams and specifications are documented
- [ ] All packages are latest stable versions with compatibility verified
- [ ] Unknown packages have skills created or documented usage patterns
- [ ] Package inventory includes security advisories and known vulnerabilities
- [ ] Design handoff documentation is complete for developers

4. **Wait for User Approval** before proceeding to Phase 3

---

## Phase 3: Implementation Planning

**Goal**: Create detailed implementation and testing plans

### Actions

1. **Update TodoWrite** with Phase 3 tasks

2. **Launch Agents** (MAX 3 per batch):

   **IMPORTANT: Agent Context Instructions**
   - Read and provide all Phase 1 documents (`.trae/docs/phase-1/*.md`) to each agent
   - Read and provide all Phase 2 documents (`.trae/docs/phase-2/*.md`) to each agent
   - Require agents to study: PRD, Research Findings, TAD, API Specs, DB Design, UI/UX Specs (including Design System), Security & Compliance, Infrastructure Plan
   - Instruct agents to align plans with Phase 1 requirements and Phase 2 designs
   - Emphasize UI/UX consistency: All implementation must adhere to Design System and style guide
   - Request agents identify any implementation gaps or conflicts with previous phases
   - Inform agents they will create documentation in `.trae/docs/phase-3/`
   - Instruct agents to structure their outputs for document creation
   - Request agents provide content organized by document sections

   **Batch 1 - Parallel (Independent):**
   - **backend-developer**: Plan API endpoints, business logic, server-side implementation
   - **frontend-developer**: Plan UI implementation from design specifications, component breakdown, state management approach, ensure adherence to Design System
   - **qa-tester**: Create comprehensive test strategy including:
     - UI/UX testing (visual regression, component testing, responsive design)
     - Accessibility testing (WCAG 2.1 AA compliance, keyboard navigation, screen reader testing)
     - Cross-browser and cross-device testing
     - Usability testing scenarios
     - Visual consistency verification

3. **Synthesize Results** and present to user:
   - Implementation plan with task breakdown
   - Testing strategy and test coverage plan
   - Deployment and CI/CD approach
   - Estimated timeline

4. **Create Documentation Files** (MANDATORY - MUST create actual files):
   - Create `.trae/docs/phase-3/` directory if it doesn't exist
   - Write `01-package-installation-guide.md` with Package Installation & Setup Guide
   - Write `02-implementation-plan.md` with Implementation Plan
   - Write `03-testing-strategy.md` with Testing Strategy & Test Plan
   - Write `04-quality-metrics.md` with Quality Metrics & KPIs
   - Write `05-cicd-deployment-strategy.md` with CI/CD & Deployment Strategy
   - Write `06-project-timeline.md` with Project Timeline & Milestones
   - Write `07-definition-of-done.md` with Definition of Done
   - Verify all files exist and contain complete, documented content
   - Present file paths to user for review

### Deliverables Required

Before proceeding to Phase 4 (Development), following MUST be documented:

#### Package Installation & Setup Guide
- **Installation Commands**: Complete list of all packages to install with exact versions
- **Configuration Files**: Sample configuration files with explanations
- **Environment Setup**: Step-by-step environment setup instructions
- **Package-Specific Setup**: Special setup or configuration required for each package
- **Version Pinning Strategy**: How to manage version updates and compatibility
- **Package Learning Documentation**: For each package:
  - If unfamiliar: Document learning process and create skill
  - If familiar: Reference existing skill or note patterns used

#### Implementation Plan
- **Work Breakdown Structure (WBS)**: Detailed task breakdown with dependencies
- **Task Sequence**: Order of implementation with rationale
- **Resource Allocation**: Team assignments and timeline for each task
- **Dependencies**: Task dependencies and critical path
- **Risk Mitigation Plans**: How identified risks will be addressed during implementation
- **Code Organization Plan**: File/folder structure and module organization
- **Feature Prioritization**: Order of feature development with justification

#### Testing Strategy & Test Plan
- **Test Strategy**: Overall testing approach, scope, and methodology
- **Test Types**: Unit tests, integration tests, E2E tests, performance tests, security tests
- **Test Coverage Requirements**: Minimum code coverage percentage
- **Test Environment Specification**: Required test environment setup and configurations
- **Test Data Requirements**: Data setup and mock data needed for testing
- **Test Cases & Scenarios**: Specific test cases covering all requirements
- **Acceptance Testing Plan**: User acceptance test scenarios and sign-off criteria
- **Performance Test Plan**: Load, stress, and performance testing approach
- **Security Test Plan**: Security testing scope and vulnerability assessments
- **Regression Testing Strategy**: Approach for regression test coverage and automation
- **Defect Management Process**: Bug tracking workflow, severity levels, and SLAs

#### Quality Metrics & KPIs
- **Code Quality Metrics**: Cyclomatic complexity, code duplication, maintainability index
- **Performance Metrics**: Response times, throughput, resource utilization targets
- **Test Coverage Metrics**: Code coverage, branch coverage, mutation coverage
- **Defect Metrics**: Defect density, defect escape rate, mean time to resolution
- **Success Criteria**: Measurable quality targets and acceptance thresholds

#### CI/CD & Deployment Strategy
- **CI/CD Pipeline Configuration**: Build, test, and deployment automation setup
- **Build Process**: Build steps, artifact creation, and versioning strategy
- **Deployment Strategy**: Blue-green, canary, rolling, or other deployment approach
- **Release Process**: Versioning, release notes, and release checklist
- **Rollback Procedure**: Steps to revert to previous version if deployment fails
- **Environment Promotion**: Promotion path from dev → staging → production
- **Infrastructure as Code**: Terraform, CloudFormation, or other IaC configurations
- **Monitoring & Alerting Setup**: Metrics, dashboards, and alerting rules
- **Configuration Management**: Environment variables, secrets management, and config files

#### Project Timeline & Milestones
- **Development Phases**: Design, MVP, Alpha, Beta, Release phases
- **Timeline with Buffer**: Estimated timeline with contingency buffer
- **Key Deliverables**: Specific outputs for each milestone
- **Review Checkpoints**: Decision points for go/no-go decisions
- **Critical Path**: Longest path through project tasks
- **Milestone Dates**: Target dates for each major milestone

#### Definition of Done
- **Code Completion Criteria**: When code is considered complete (reviewed, tested, documented)
- **Testing Completion Criteria**: When testing is considered sufficient
- **Documentation Requirements**: What documentation must be completed
- **Code Review Checklist**: Items that must pass in code review
- **Acceptance Criteria Checklist**: Items that must be met for user acceptance

### Approval Checklist

Before approving Phase 3 (and proceeding to development), user should confirm:
- [ ] Implementation plan is detailed and feasible
- [ ] Task breakdown is comprehensive with clear dependencies
- [ ] Testing strategy covers all requirements
- [ ] CI/CD pipeline is defined and understood
- [ ] Deployment strategy is clear with rollback procedures
- [ ] Timeline is realistic with appropriate buffers
- [ ] Definition of Done is clear and agreed upon
- [ ] Quality metrics and success criteria are defined
- [ ] All team members understand their responsibilities
- [ ] Package installation guide is complete with exact versions
- [ ] All packages are verified as latest stable versions
- [ ] Version pinning strategy is defined for managing updates
- [ ] Skills exist for all unfamiliar packages or learning tasks are planned
- [ ] Package compatibility matrix shows no conflicts

4. **Wait for User Approval** before proceeding to Phase 4

---

## Phase 4: Development

**Goal**: Implement the solution

### Actions

1. **Update TodoWrite** with detailed implementation tasks

2. **Launch Agents** (MAX 3 per batch):

   **IMPORTANT: Agent Context Instructions**
   - Read and provide all Phase 1 documents (`.trae/docs/phase-1/*.md`) to each agent
   - Read and provide all Phase 2 documents (`.trae/docs/phase-2/*.md`) to each agent
   - Read and provide all Phase 3 documents (`.trae/docs/phase-3/*.md`) to each agent
   - Require agents to study: PRD, Research Findings, TAD, API Specs, DB Design, UI/UX Specs (including Design System), Security & Compliance, Infrastructure Plan, Implementation Plan, Testing Strategy, Quality Metrics, CI/CD Strategy, Timeline, Definition of Done
   - Instruct agents to implement according to all previous phase documents
   - **CRITICAL: UI/UX consistency enforcement** - All UI implementation must strictly follow Design System and style guide
   - Request agents identify any deviations from planned designs
   - Instruct agents to proactively document any implementation changes

   **Batch 1 - Parallel (Independent):**
   - **backend-developer**: Implement backend/API/business logic
   - **frontend-developer**: Implement frontend UI and interactions with:
     - Strict adherence to Design System (components, colors, typography, spacing)
     - Use of pre-built components from component library where available
     - Implementation of responsive designs per breakpoints specified
     - Accessibility implementation (ARIA labels, keyboard navigation, screen reader support)
     - Consistent state management patterns as planned
     - Implementation of micro-interactions and animations as specified
   - **database-engineer**: Implement database schema and migrations (if applicable)

3. **Wait for completion**, then review code

4. **Launch Code Review:**
   - **code-reviewer**: Review code for quality, security, UI/UX consistency, and best practices

   **IMPORTANT: Code Reviewer Context Instructions**
   - Read and provide all Phase 1 documents (`.trae/docs/phase-1/*.md`)
   - Read and provide all Phase 2 documents (`.trae/docs/phase-2/*.md`)
   - Read and provide all Phase 3 documents (`.trae/docs/phase-3/*.md`)
   - Require reviewer to verify implementation aligns with requirements, designs, and plans
   - **CRITICAL: UI/UX consistency verification** - Reviewer must:
     - Verify all UI components match Design System specifications
     - Check color, typography, spacing, and component consistency
     - Validate responsive design implementation across breakpoints
     - Review accessibility implementation (ARIA, keyboard navigation, semantic HTML)
     - Check animation and interaction implementation against specifications
     - Verify use of pre-built components from component library
   - Request reviewer check for any undocumented deviations
   - Instruct reviewer to recommend documentation updates for any changes found

5. **Address any issues found** by reviewer

6. **Update TodoWrite** as tasks complete

7. **Update Previous Phase Documents** (when applicable):
   - If implementation required changes from Phase 1-3 plans, update relevant documents
   - Document implementation decisions that differ from original designs
   - Add "Implementation Notes" sections to Phase 2 or 3 documents
   - Record any new technical discoveries or patterns found during implementation
   - Maintain version history in updated documents
   - Inform user of any document updates made

---

## Phase 5: Testing & Quality

**Goal**: Validate the implementation

### Actions

1. **Update TodoWrite** with testing tasks

2. **Launch Agents** (MAX 3 per batch):

   **IMPORTANT: Agent Context Instructions**
   - Read and provide all Phase 1 documents (`.trae/docs/phase-1/*.md`) to each agent
   - Read and provide all Phase 2 documents (`.trae/docs/phase-2/*.md`) to each agent
   - Read and provide all Phase 3 documents (`.trae/docs/phase-3/*.md`) to each agent
   - Read and provide Phase 4 implementation code to agents
   - Require agents to study: PRD, Research Findings, TAD, API Specs, DB Design, UI/UX Specs (including Design System), Security & Compliance, Infrastructure Plan, Implementation Plan, Testing Strategy, Quality Metrics, CI/CD Strategy, Timeline, Definition of Done
   - Instruct agents to validate implementation against requirements, designs, and plans
   - **CRITICAL: UI/UX validation emphasis** - Testing must include:
     - Visual consistency verification across all screens
     - Component library usage verification
     - Responsive design testing on mobile, tablet, and desktop
     - Accessibility testing (WCAG 2.1 AA compliance)
     - Cross-browser compatibility testing
     - User flow and usability testing
   - Request agents identify any gaps between implementation and documented plans
   - Instruct agents to structure their outputs for document creation in `.trae/docs/phase-5/`

   **Batch 1 - Parallel (Independent):**
   - **qa-tester**: Execute comprehensive testing including:
     - Unit tests and integration tests
     - UI/UX tests (visual regression, component testing, user flow testing)
     - Accessibility tests (keyboard navigation, screen reader, color contrast)
     - Cross-browser and cross-device tests
     - Usability test scenarios and acceptance criteria validation
     - Visual consistency checks against Design System
   - **integration-engineer**: Run E2E tests and system integration validation with:
     - Visual regression testing (screenshots comparison)
     - Responsive design validation across breakpoints
     - Cross-browser testing coverage
     - Accessibility validation in production-like environment
   - **diagnostician**: Performance analysis and error/edge case testing including:
     - Visual performance metrics (LCP, FID, CLS)
     - Animation performance validation
     - UI rendering performance analysis

3. **Synthesize Results** and present to user:
   - Test results summary
   - Known issues (if any)
   - Performance metrics
   - Readiness assessment

4. **Create Documentation Files** (MANDATORY - MUST create actual files):
   - Create `.trae/docs/phase-5/` directory if it doesn't exist
   - Write `01-test-results.md` with Test Results Summary
   - Write `02-performance-metrics.md` with Performance Metrics
   - Write `03-known-issues.md` with Known Issues (if any)
   - Write `04-readiness-assessment.md` with Readiness Assessment
   - Verify all files exist and contain complete, documented content
   - Present file paths to user for review

5. **Update Previous Phase Documents** (when applicable):
   - If testing revealed issues requiring design changes, update Phase 2 documents
   - If testing found gaps in implementation, update Phase 3 documents
   - Document any quality issues discovered and their resolutions
   - Add "Testing Findings" sections to relevant Phase 1-3 documents
   - Update Definition of Done if acceptance criteria need adjustment
   - Maintain version history in updated documents
   - Inform user of any document updates made

6. **Wait for User Approval** before proceeding to Phase 6

---

## Phase 6: Deployment

**Goal**: Deploy the solution

### Actions

1. **Update TodoWrite** with deployment tasks

2. **Launch Agents** (Sequential as needed):

   **IMPORTANT: Agent Context Instructions**
   - Read and provide all Phase 1 documents (`.trae/docs/phase-1/*.md`) to each agent
   - Read and provide all Phase 2 documents (`.trae/docs/phase-2/*.md`) to each agent
   - Read and provide all Phase 3 documents (`.trae/docs/phase-3/*.md`) to each agent
   - Read and provide all Phase 4 implementation code to agents
   - Read and provide all Phase 5 documents (`.trae/docs/phase-5/*.md`) to each agent
   - Require agents to study: PRD, Research Findings, TAD, API Specs, DB Design, UI/UX Specs, Security & Compliance, Infrastructure Plan, Implementation Plan, Testing Strategy, Quality Metrics, CI/CD Strategy, Timeline, Definition of Done, Test Results, Performance Metrics, Known Issues, Readiness Assessment
   - Instruct agents to validate deployment against all previous documentation
   - Request agents identify any deployment gaps or issues
   - Instruct agents to structure their outputs for document creation in `.trae/docs/phase-6/`

   - **integration-engineer**: Execute deployment, verify production setup
   - **diagnostician**: Post-deployment validation and smoke testing

3. **Present final results to user:**
   - Deployment confirmation
   - Access information (URLs, credentials, etc.)
   - Post-deployment checklist

4. **Create Documentation Files** (MANDATORY - MUST create actual files):
   - Create `.trae/docs/phase-6/` directory if it doesn't exist
   - Write `01-deployment-confirmation.md` with Deployment Confirmation
   - Write `02-access-information.md` with Access Information (URLs, credentials, etc.)
   - Write `03-post-deployment-checklist.md` with Post-deployment Checklist
   - Verify all files exist and contain complete, documented content
   - Present file paths to user

5. **Update Previous Phase Documents** (when applicable):
   - If deployment revealed issues requiring plan changes, update Phase 3 documents
   - Document any deployment blockers and their resolutions
   - Add "Deployment Notes" sections to relevant Phase 1-3 documents
   - Update Infrastructure Plan if deployment environment differs from planned
   - Maintain version history in updated documents
   - Inform user of any document updates made

---

## Project Structure for SOLO Coder

```
launcher-v3/
├── .trae/
│   ├── rules/
│   │   └── new_creation_process.md    # This process document
│   ├── skills/                         # Skill files storage
│   │   └── [skill-name]/
│   │       ├── SKILL.md                  # Required: Skill instructions
│   │       ├── scripts/                   # Optional: Executable scripts
│   │       ├── references/                 # Optional: Documentation
│   │       └── assets/                   # Optional: Templates/resources
│   └── docs/                           # Phase documentation (created during development)
│       ├── phase-1/                      # Requirements & Research documents
│       │   ├── 01-technology-research.md
│       │   ├── 02-prd.md
│       │   ├── 03-research-findings.md
│       │   └── 04-requirements-traceability-matrix.md
│       ├── phase-2/                      # Architecture & Design documents
│       │   ├── 01-technology-stack-specification.md
│       │   ├── 02-technical-architecture.md
│       │   ├── 03-api-specifications.md
│       │   ├── 04-database-design.md
│       │   ├── 05-ui-ux-design-specs.md
│       │   ├── 06-security-compliance.md
│       │   └── 07-infrastructure-plan.md
│       ├── phase-3/                      # Implementation Planning documents
│       │   ├── 01-package-installation-guide.md
│       │   ├── 02-implementation-plan.md
│       │   ├── 03-testing-strategy.md
│       │   ├── 04-quality-metrics.md
│       │   ├── 05-cicd-deployment-strategy.md
│       │   ├── 06-project-timeline.md
│       │   └── 07-definition-of-done.md
│       ├── phase-4/                      # Development artifacts (optional)
│       ├── phase-5/                      # Testing & Quality documents
│       │   ├── 01-test-results.md
│       │   ├── 02-performance-metrics.md
│       │   ├── 03-known-issues.md
│       │   └── 04-readiness-assessment.md
│       └── phase-6/                      # Deployment documents
│           ├── 01-deployment-confirmation.md
│           ├── 02-access-information.md
│           └── 03-post-deployment-checklist.md
├── src/                               # Source code
└── [other project files]
```

**Key Directories:**
- `.trae/rules/` - Process and rule files for SOLO Coder
- `.trae/skills/` - Skill files automatically discovered and invoked by SOLO Coder
- `.trae/docs/` - Phase documentation created during development process (MANDATORY for Phases 1-3, 5-6)

---

## Critical Constraints

### MUST Follow

1. **Max 3 parallel agents per batch** - Never exceed. Group independent agents, wait for completion, then launch next batch.

2. **User approval checkpoints** - MUST pause and get approval after each phase:
   - After Phase 1 (Requirements & Research)
   - After Phase 2 (Architecture & Design)
   - After Phase 3 (Implementation Planning)
   - After Phase 5 (Testing & Quality)

3. **TodoWrite management** - ALWAYS use TodoWrite to track tasks:
   - Max 10 todos at a time
   - Only one in_progress at a time
   - Mark completed immediately when done
   - Remove completed to make room for new ones

4. **Agent selection based on task type**:
   - Architecture/design decisions → architect
   - Frontend implementation → frontend-developer
   - Backend/API implementation → backend-developer
   - Database work → database-engineer
   - Testing → qa-tester or integration-engineer
   - Debugging → diagnostician
   - Code review → code-reviewer
   - Research → researcher or search
   - Codebase analysis → explorer
   - Skill creation → skill-writer

5. **Sequential execution when needed**:
   - architect → backend/frontend/database (design before implementation)
   - developers → reviewer (code must exist before review)
   - developers → qa/integration (implementation before testing)

6. **Skill management** - Proactively create skills when:
   - Repeating the same 3+ step workflow across multiple tasks
   - Identifying reusable patterns in codebase that can be automated
   - Completing major refactoring or project setup
   - Creating workflow automation for common operations
   - Any task that represents a reusable pattern worth encapsulating

7. **Proactive Document Updates** - SOLO Coder MUST proactively update documents when:
   - **Agent identifies deviations**: Any agent identifies gaps, conflicts, or deviations from documented requirements, designs, or plans
   - **Implementation changes**: Development agents discover necessary changes from planned approach
   - **Code review findings**: code-reviewer recommends architectural or design improvements
   - **Testing discoveries**: qa-tester or diagnostician finds issues requiring design changes
   - **Deployment issues**: integration-engineer discovers deployment blockers requiring plan updates
   - **User feedback**: User provides new requirements or changes direction after phase approval
   
   **Document Update Process:**
   1. Identify which phase document needs updating (Phase 1, 2, or 3)
   2. Read current document content to understand existing structure
   3. Add update section with:
      - Date of change
      - Reason for update (agent discovery, testing finding, user feedback, etc.)
      - What changed (requirements, design, plan, etc.)
      - Impact on subsequent phases
   4. Maintain version history by keeping original content and appending updates
   5. Inform user of document updates and request confirmation
   6. If update impacts later phases, re-read updated documents before proceeding
   
   **Document Update Priorities:**
   - **Critical updates**: Security vulnerabilities, breaking changes, major requirements - IMMEDIATE
   - **High updates**: Design changes affecting implementation - Update before next phase
   - **Medium updates**: Clarifications, additional details - Add when discovered
   - **Low updates**: Typos, formatting - Fix when convenient

### MUST NOT Do

1. **NEVER** skip user approval checkpoints
2. **NEVER** launch more than 3 agents in parallel
3. **NEVER** proceed to next phase without user approval
4. **NEVER** launch documenter unless explicitly requested
5. **NEVER** commit changes unless explicitly requested

---

## Agent Orchestration Patterns

### Feature Development Pattern
```
Phase 0: Skill Discovery → [Implicit: Auto-activate based on description match] → [Explicit: Skill(name="skill-name")] → Follow skill guidance
Phase 1: researcher + search + architect → [Approval]
Phase 2: architect + frontend-developer + database-engineer → [Approval]
Phase 3: backend-developer + qa-tester + integration-engineer → [Approval]
Phase 4: backend-developer + frontend-developer → code-reviewer
Phase 5: qa-tester + integration-engineer + diagnostician → [Approval]
Phase 6: integration-engineer → diagnostician
```

### Bug Fix Pattern
```
Phase 1: diagnostician → [Approval]
Phase 2: [appropriate-developer] → code-reviewer
Phase 3: qa-tester + integration-engineer → [Approval]
Phase 4: integration-engineer (deployment)
```

### Simple Feature Pattern (Skipping phases when appropriate)
```
Phase 1: architect (quick assessment) → [Approval]
Phase 2: [appropriate-developer] → code-reviewer
Phase 3: qa-tester → [Approval]
Phase 4: [deployment]
```

### Skill-Based Pattern (When reusable pattern is identified)
```
Phase 0: Skill Discovery → [Implicit: Auto-activate] OR [Explicit: Skill(name="skill-name")] → Follow skill instructions
Phase 1+: Resume standard process (may be simplified based on skill guidance)
```

---

## MCP Tool Usage Guidelines

#### Package & Technology Research
- `mcp_web-reader_webReader` - Convert documentation URLs to markdown for analysis
- `mcp_mcp-deepwiki_deepwiki_fetch` - Fetch comprehensive docs from popular libraries (use maxDepth: 1 for multiple pages)
- `mcp_context7_query-docs` - Query specific library documentation directly
- `mcp_GitHub_search_repositories` - Find relevant GitHub repositories for packages
- `mcp_GitHub_search_code` - Search for package usage examples and patterns
- `mcp_GitHub_get_file_contents` - Read specific files from GitHub repos for package examples
- `WebSearch` - Search for latest package versions, release notes, and comparisons

### Code Quality
- `mcp_ESLint_lint-files` - Run ESLint during reviews
- `mcp_Sequential_Thinking_sequentialthinking` - Complex reasoning

### Visual Analysis
- `mcp_zai-mcp-server_ui_to_artifact` - UI screenshots to code
- `mcp_zai-mcp-server_diagnose_error_screenshot` - Error diagnosis
- `mcp_zai-mcp-server_understand_technical_diagram` - Architecture diagrams

### Testing
- `mcp_Playwright_*` suite - E2E testing tools

### File Discovery
- `mcp_everything-search_search_files` - Fast file search
- `mcp_everything-search_get_file_info` - File metadata

---

## UI/UX Design Process & Best Practices

This section outlines the comprehensive UI/UX design process that must be followed to ensure consistent, accessible, and user-centered interfaces throughout the development lifecycle.

### Design Process Overview

The UI/UX design process follows these stages:

```
Research & Discovery → Information Architecture → Wireframing → Visual Design
        ↓                                                        ↓
   Prototyping & Testing ← Design System Development ← High-Fidelity Mockups
        ↓                                                        ↓
   Design Handoff → Implementation → Design QA & Validation
```

### Phase 1: Research & Discovery (in Phase 1 of SDLC)

**Activities:**
- User research (interviews, surveys, analytics analysis)
- Competitive analysis of UI/UX patterns
- Persona development with pain points and goals
- User journey mapping
- Accessibility requirements identification (WCAG 2.1 AA)

**Deliverables:**
- User research findings
- Personas with scenarios
- User journey maps with pain points
- Accessibility requirements document
- Competitive analysis of design patterns

### Phase 2: Information Architecture & Wireframing (in Phase 2 of SDLC)

**Activities:**
- Create user flow diagrams
- Design information architecture
- Create low-fidelity wireframes for all screens
- Establish layout grids and responsive breakpoints
- Identify reusable components

**Deliverables:**
- User flow diagrams
- Information architecture diagrams
- Wireframes for all key screens
- Responsive design specifications (mobile, tablet, desktop)
- Component inventory (list of potential reusable components)

### Phase 3: Design System Development (in Phase 2 of SDLC)

**Design System Components:**

1. **Design Tokens** (Foundational elements)
   - **Colors**: Primary, secondary, semantic colors (success, error, warning), neutral palette
   - **Typography**: Font families, sizes, weights, line heights, letter spacing
   - **Spacing**: 4px/8px grid system, margin/padding scale
   - **Shadows**: Elevation levels (e.g., shadow-sm, shadow-md, shadow-lg)
   - **Border Radius**: Consistent rounding (e.g., 4px, 8px, 16px)
   - **Transitions**: Duration and easing functions

2. **Component Library** (Atomic design approach)
   - **Atoms**: Buttons, inputs, labels, icons, links
   - **Molecules**: Form groups, cards, headers, navigation items
   - **Organisms**: Forms, modals, tables, navigation bars
   - **Templates**: Page layouts (e.g., auth-layout, dashboard-layout)
   - **Pages**: Complete page implementations

3. **Pattern Library** (Common interactions)
   - **Form Patterns**: Login forms, search forms, multi-step forms
   - **Navigation Patterns**: Breadcrumbs, tabs, menus, pagination
   - **Feedback Patterns**: Toast notifications, loading states, empty states
   - **Modal Patterns**: Confirmation dialogs, forms in modals, detail views

4. **Icon System**
   - Icon set with consistent style (filled/outline)
   - Size variants (16px, 20px, 24px, 32px)
   - Usage guidelines for different contexts
   - Accessibility (ARIA labels for icon-only buttons)

5. **Layout System**
   - Grid system (columns, gutters, breakpoints)
   - Container max-widths
   - Spacing scales for margins and padding
   - Responsive behavior rules

**Design System Documentation Requirements:**
- Storybook or similar component documentation
- Usage examples for each component
- Component states (default, hover, active, disabled, error, loading)
- Accessibility guidelines for each component
- Do's and Don'ts for common patterns

### Phase 4: Visual Design & Prototyping (in Phase 2 of SDLC)

**Activities:**
- Apply Design System to create high-fidelity mockups
- Design all screens and states (loading, error, empty, success)
- Create interactive prototypes for complex flows
- Design micro-interactions and animations
- Create responsive variants for all breakpoints

**Deliverables:**
- High-fidelity mockups for all screens
- Interactive prototypes (e.g., Figma, Adobe XD)
- Animation specifications (timing, easing, triggers)
- Responsive design mockups (mobile, tablet, desktop)
- Design handoff documentation

### Phase 5: Design QA & Validation (in Phase 5 of SDLC)

**Design QA Checklist:**
- [ ] All screens designed for all breakpoints (mobile, tablet, desktop)
- [ ] All component states designed (default, hover, active, disabled, error)
- [ ] Loading states designed for all async actions
- [ ] Error states designed with clear guidance
- [ ] Empty states designed with helpful messaging
- [ ] Accessibility compliance verified (WCAG 2.1 AA)
- [ ] Color contrast ratios meet minimum standards (4.5:1 normal, 3:1 large text)
- [ ] Touch targets meet minimum size (44x44px for mobile)
- [ ] Typography hierarchy is clear and consistent
- [ ] Spacing follows 4px/8px grid system
- [ ] Icon usage is consistent with Design System
- [ ] Animations respect user preferences (prefers-reduced-motion)
- [ ] All forms have proper labels and error indicators
- [ ] Navigation is intuitive and follows user expectations
- [ ] Design consistency across all screens and components
- [ ] Cross-browser compatibility considered
- [ ] Handoff documentation is complete and developer-ready

### Design Handoff Process

**Handoff Deliverables:**
1. **Design Specifications**
   - Component measurements (width, height, padding, margins)
   - Color codes (hex, rgb, hsl)
   - Typography specifications (font family, size, weight, line height)
   - Spacing values
   - Border radius values

2. **Asset Export**
   - Icons in required formats (SVG, PNG @1x, @2x, @3x)
   - Images optimized for web
   - Export for dark/light themes if applicable

3. **Implementation Notes**
   - Component behavior specifications
   - Animation details (duration, easing, triggers)
   - Responsive breakpoints
   - State management guidance
   - Accessibility implementation notes

4. **Design System Access**
   - Link to Design System documentation
   - Component library access (Storybook, Figma components, etc.)
   - Design tokens reference

### UI/UX Consistency Enforcement

**Throughout Development:**

1. **Design System Adherence**
   - All components must use Design System tokens
   - Custom components only when Design System doesn't provide solution
   - No hard-coded colors, fonts, or spacing values

2. **Component Usage**
   - Use pre-built components from component library
   - Don't recreate existing components
   - Follow component API documentation exactly

3. **Visual Consistency Checks**
   - Regular visual regression testing
   - Screenshot comparison across commits
   - Design review sessions before releases

4. **Accessibility Ongoing Verification**
   - Automated accessibility testing in CI/CD
   - Keyboard navigation testing for all new features
   - Screen reader testing for critical paths
   - Color contrast verification for all new designs

### Design Review Process

**Design Review Checklist (for code-reviewer and qa-tester):**

**Visual Consistency:**
- [ ] Components match Design System specifications
- [ ] Colors use design tokens, not hard-coded values
- [ ] Typography follows design hierarchy
- [ ] Spacing follows grid system
- [ ] Icons are from Design System icon set
- [ ] Shadows and border radius match design tokens

**Responsive Design:**
- [ ] Layouts work on mobile (320px+)
- [ ] Layouts work on tablet (768px+)
- [ ] Layouts work on desktop (1024px+)
- [ ] Breakpoints match specifications
- [ ] Touch targets are appropriately sized (44x44px minimum)

**Accessibility:**
- [ ] Semantic HTML used (nav, main, article, section)
- [ ] ARIA labels for icon-only buttons and interactive elements
- [ ] Keyboard navigation works for all interactive elements
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards
- [ ] Forms have associated labels
- [ ] Error messages are announced to screen readers
- [ ] Dynamic content updates use ARIA live regions

**Interaction Design:**
- [ ] Hover states exist for all interactive elements
- [ ] Active/focus states are clearly visible
- [ ] Loading states exist for async actions
- [ ] Error states provide clear guidance
- [ ] Success states provide feedback
- [ ] Animations follow performance guidelines (<60fps)
- [ ] Animations respect prefers-reduced-motion

**Cross-Browser Compatibility:**
- [ ] Tested on Chrome, Firefox, Safari, Edge
- [ ] Layout consistent across browsers
- [ ] Interactions work consistently
- [ ] No browser-specific hacks used

### UI/UX Testing Strategy

**Automated Testing:**
- Visual regression testing (screenshots comparison)
- Accessibility testing (axe-core, jest-axe)
- Color contrast automated checks
- Component testing (visual regression for components)

**Manual Testing:**
- Usability testing with real users (5-10 participants)
- Cross-browser manual verification
- Cross-device testing (iOS, Android, desktop)
- Keyboard-only navigation testing
- Screen reader testing (NVDA, VoiceOver, JAWS)

**Performance Testing:**
- Core Web Vitals (LCP, FID, CLS)
- Animation performance (60fps target)
- Image optimization verification
- Font loading performance

---

## Output Format

After each phase, present results in this structure:

```
## Phase X: [Phase Name] - Results

### Summary
[Brief 2-3 sentence overview]

### Key Findings
- [Critical finding 1]: [Explanation]
- [Critical finding 2]: [Explanation]
- [Important finding 3]: [Explanation]

### Recommendations
1. [High priority action] - [Description]
2. [Medium priority action] - [Description]

### Files/Code References
- [file_path:line_range]: [Description]

### Next Steps
1. [Immediate action needed]
2. [Follow-up action if applicable]

### User Decision Required
[What needs user approval to proceed]
```

---

## Adaptation Rules

### When to Skip Phases

**Phase 1 can be skipped if:**
- Request is a simple, well-defined bug fix
- User provides complete, detailed requirements
- Task is purely mechanical with no ambiguity

**Phase 2 can be skipped if:**
- Modifying existing code without architecture changes
- User provides specific design/implementation approach
- Task is trivial (e.g., small refactor)

**Phase 3 can be skipped if:**
- Immediate implementation requested and approved
- Task is small enough that planning is overkill

**Phase 5 can be skipped if:**
- User explicitly declines testing
- Task is trivial with no critical impact

### When to Adapt the Process

- **Small tasks**: Combine phases or reduce agent usage
- **Urgent requests**: Streamline approval process with user consent
- **Research-only tasks**: Stop after Phase 1
- **Design-only tasks**: Stop after Phase 2
- **Proof-of-concept**: Focus on Phase 1-3, minimal testing

---

## Skill File Structure & Storage

### Skill Directory Structure

SOLO Coder skills are filesystem-based resources organized as directories with a required `SKILL.md` file:

```
.trae/skills/
├── your-skill-name/
│   ├── SKILL.md              # Required: Skill instructions with YAML frontmatter
│   ├── scripts/               # Optional: Executable code scripts
│   ├── references/             # Optional: Documentation, examples, reference materials
│   └── assets/               # Optional: Templates, resources, static files
```

### SKILL.md Format

Every skill MUST include a `SKILL.md` file with the following structure:

```yaml
---
name: skill-name
description: Brief description of what this skill does (loaded at startup for discovery)
version: "1.0"
---

# Skill Instructions

[Detailed instructions for how to perform the task]

## Common Patterns
- Pattern 1
- Pattern 2

## Edge Cases
- Edge case 1
- Edge case 2

## Resources
- Link to reference file: [references/some-file.md]
- Link to template: [assets/template.txt]
```

**Requirements:**
- **YAML frontmatter** at the top with `name` and `description` (required)
- **Metadata**: Optional fields like `version`, `author`, `license`
- **Content**: Markdown body with task-specific instructions
- **Keep focused**: Only include information needed for the agent to perform the task
- **One-level references**: Reference files should be directly in references/, not deeply nested

### Skill Storage Location

**Skills are stored in:** `.trae/skills/` directory at project root

**Discovery Process:**
1. At startup, SOLO Coder scans `.trae/skills/` for directories containing `SKILL.md`
2. Only the YAML frontmatter (name + description) is loaded into context initially
3. Full skill content is loaded only when the skill is activated
4. This "progressive disclosure" keeps context usage low

### Skill Invocation Methods

#### 1. Implicit Invocation (Automatic)
SOLO Coder automatically activates skills when:
- User request matches skill's `description`
- Task context aligns with skill's purpose
- Agent determines skill is relevant based on metadata

**Example:**
- Skill name: `react-component-creation`
- Description: "Create React components following project conventions"
- User request: "Create a user profile component"
- Result: SOLO Coder automatically invokes the skill

#### 2. Explicit Invocation (Manual)
Use the **Skill** tool to manually invoke a skill:

```bash
User: "Use the react-component-creation skill"
SOLO Coder: [Invokes Skill tool with name="react-component-creation"]
```

**When to use explicit invocation:**
- User specifically requests a skill
- Multiple skills might apply and you want to choose
- Testing or validating a specific skill
- Troubleshooting skill behavior

### Best Practices for Skill Structure

1. **Keep skills focused and modular**
   - Each skill should handle one specific capability
   - Break large skills into smaller, focused ones

2. **Use progressive disclosure**
   - Only include necessary information in SKILL.md
   - Move detailed examples to `references/` directory
   - Add table of contents for files >100 lines

3. **Avoid deeply nested references**
   - All reference files should be one level deep from SKILL.md
   - Use clear, descriptive filenames

4. **Structure for scale**
   - When SKILL.md becomes unwieldy, split content into separate files
   - Reference additional files from SKILL.md
   - Keep metadata concise (50-100 tokens)

5. **Maintain version control**
   - Track skill changes in git
   - Update version number in frontmatter when making breaking changes
   - Document migration notes for major updates

---

## Skill Creation and Usage

### When to Create Skills

SOLO Coder MUST proactively create skill files using **skill-writer** agent when:

1. **Repeating 3+ step workflows** - Same pattern appears across 3+ tasks
2. **Identifying reusable patterns** - Codebase patterns that can be automated
3. **Major refactoring completed** - New patterns established worth codifying
4. **Project setup completed** - Standard workflows for this project identified
5. **Common operations discovered** - Frequently repeated actions worth automating
6. **Package or technology learning** - When encountering new or unfamiliar packages:
   - Research the package using MCP tools (web-reader, deepwiki, context7, GitHub)
   - Create a skill documenting:
     - Installation and setup instructions
     - Common usage patterns and API conventions
     - Best practices and gotchas
     - Integration examples with this codebase
     - Configuration options and their effects
7. **Latest package version updates** - When packages are updated:
   - Research breaking changes and new features
   - Update or create skills with new patterns
   - Document migration paths from older versions

### Skill Creation Process

1. **During any phase**, if a reusable pattern is identified:
   - Add to TodoWrite: "Create skill for [pattern name]"
   - Launch **skill-writer** agent with pattern description
   - Skill-writer analyzes codebase and generates skill file in `.trae/skills/[skill-name]/SKILL.md`
   - Skill-writer creates optional `references/`, `scripts/`, or `assets/` directories as needed

2. **After skill is created**:
   - Update TodoWrite to mark task complete
   - Verify skill has proper YAML frontmatter (name, description)
   - Test skill on current task to validate
   - Note the skill name in relevant documentation
   - Commit skill to version control

3. **When similar tasks arise**:
   - Check `.trae/skills/` for relevant skills (SOLO Coder does this automatically at startup)
   - SOLO Coder implicitly invokes skill based on description match
   - OR explicitly invoke skill using **Skill** tool: `Skill(name="skill-name")`
   - Skill provides specialized instructions for that workflow

### Skill Usage in Phases

**Phase 1 - Requirements & Research:**
- If user request matches a known skill (e.g., "create REST API"), invoke that skill first
- Skill may provide specialized research templates or requirements checklists

**Phase 2 - Architecture & Design:**
- Skills for common architectures (e.g., "microservices", "event-driven")
- Skills for specific technologies (e.g., "react-component", "graphql-api")

**Phase 3 - Implementation Planning:**
- Skills for common patterns (e.g., "crud-operations", "auth-flow")
- Skills for project-specific conventions

**Phase 4 - Development:**
- Skills for code generation patterns (e.g., "react-component", "api-endpoint")
- Skills for project-specific boilerplate

**Phase 5 - Testing:**
- Skills for test patterns (e.g., "integration-test", "e2e-test")

**Phase 6 - Deployment:**
- Skills for deployment patterns (e.g., "docker-deploy", "k8s-deploy")

### Skill Management

1. **Before creating new skill**:
   - Check `.trae/skills/` directory for existing skills
   - Review skill descriptions to avoid duplication
   - Consider extending existing skill instead of creating new one

2. **After skill creation**:
   - Validate skill structure:
     - YAML frontmatter has required `name` and `description`
     - SKILL.md is in root of skill directory
     - Optional directories (scripts/, references/, assets/) are properly structured
   - Test skill on current task to validate functionality
   - Verify skill provides expected guidance
   - Commit skill to version control with descriptive message

3. **Regular review**:
   - Periodically assess if skills remain relevant
   - Check for deprecated patterns or outdated information
   - Remove unused or redundant skills
   - Update version numbers when making breaking changes

4. **Update skills**:
   - When patterns evolve, update skill instructions
   - When packages are updated, update related skills with new patterns
   - Document migration notes in skill frontmatter for major updates
   - Add new reference files to `references/` directory as needed

### Skill Invocation Pattern

```
User Request → SOLO Coder scans .trae/skills/ for relevant skills
                              ↓
              Match found? (based on skill description)
                              ↓
         ┌────────────────┴────────────────┐
         │                                 │
      [Implicit]                      [Explicit]
         ↓                                 ↓
   Auto-activate                   User requests specific skill
         │                                 │
         ↓                                 ↓
   Load SKILL.md                    Invoke Skill tool with name
         │                                 │
         └────────────────┬────────────────┘
                      ↓
              Follow skill instructions
                      ↓
           Resume standard process
```

**Implicit Invocation** (Preferred):
- Happens automatically when task matches skill description
- No user action required
- Based on metadata loaded at startup

**Explicit Invocation**:
- User requests: "Use [skill-name] skill"
- SOLO Coder invokes: `Skill(name="skill-name")`
- Useful when multiple skills apply or for testing

### Example Skills to Consider Creating

**Example Skill Available**: See `.trae/skills/react-component-creation/` for a complete, production-ready example including:
- **SKILL.md**: Main skill file with YAML frontmatter and comprehensive instructions
- **references/react-best-practices.md**: Additional patterns and guidelines
- **references/accessibility-guide.md**: Detailed accessibility requirements
- **assets/component-template.tsx**: Reusable component template

Based on common development patterns, consider creating skills for:

- **Framework-specific**: React components, Vue components, Node.js APIs, etc.
- **Architecture patterns**: Microservices, Serverless, Event-driven systems
- **Common features**: Authentication, CRUD operations, File upload, Search
- **Testing patterns**: Integration tests, E2E tests, Unit tests
- **Deployment patterns**: Docker, Kubernetes, CI/CD pipelines
- **Database patterns**: Migrations, Seeders, Query builders
- **Package/Library-specific**:
  - **UI Libraries**: Material-UI, Chakra UI, Tailwind CSS, etc.
  - **State Management**: Redux, Zustand, Jotai, Pinia, etc.
  - **API Clients**: Axios, Fetch API wrappers, GraphQL clients
  - **Forms**: React Hook Form, Formik, Yup/Zod validation
  - **Data Fetching**: React Query, SWR, TanStack Query
  - **Testing Libraries**: Jest, Vitest, Playwright, Cypress
  - **Build Tools**: Vite, Webpack, Rollup configurations
  - **Styling**: CSS-in-JS solutions, CSS modules, styled-components
  - **Utility Libraries**: Lodash, date-fns, classnames
- **Project-specific**: Any patterns unique to this project

---

## Package Research & Skill Creation Workflow

This workflow ensures that SOLO Coder always uses the latest packages and creates skills for unfamiliar technologies.

### When to Research Packages

SOLO Coder MUST research packages in these situations:

1. **Technology Stack Selection (Phase 1)**: When choosing technologies for a new project
2. **Package Selection (Phase 2)**: When selecting specific packages for the tech stack
3. **Package Updates (Any Phase)**: When updating existing packages to new versions
4. **New Package Discovery (Any Phase)**: When encountering a package not used before
5. **Feature Implementation (Phase 4)**: When a feature requires a new library or tool

### Package Research Process

```
Identify Need for Package
         ↓
    Search for Latest Options (WebSearch, GitHub search)
         ↓
    Compare Packages (popularity, maintenance, security, features)
         ↓
    Select Package & Document Version
         ↓
    Is Package Familiar?
    ↓ YES → Document usage patterns
    ↓ NO  → Create Skill for Package
         ↓
    Add to Package Inventory
         ↓
    Verify Compatibility with Other Packages
```

### Package Research Checklist

For each package selected, complete the following:

| Item | Description | MCP Tools to Use |
|-------|-------------|------------------|
| **Latest Version** | Identify latest stable version number | WebSearch, GitHub releases |
| **Installation** | Document installation command(s) | web-reader (official docs) |
| **Configuration** | Note required configuration and options | context7, deepwiki |
| **API/Usage** | Document common usage patterns | GitHub search (examples) |
| **Best Practices** | Identify recommended patterns and anti-patterns | web-reader, GitHub issues |
| **Gotchas** | Note common pitfalls and edge cases | GitHub issues, web-reader |
| **Security** | Check for known vulnerabilities | GitHub advisories, WebSearch |
| **Maintenance** | Verify active maintenance and recent updates | GitHub repo activity |
| **Compatibility** | Check compatibility with other selected packages | WebSearch, package docs |
| **Alternatives** | Document why this package was chosen | WebSearch, comparison sites |

### Skill Creation for Packages

When creating a skill for a package, include:

1. **Package Metadata**
   - Name, latest version, npm/PyPI/other registry URL
   - Last updated date and maintenance status
   - License type

2. **Installation & Setup**
   - Installation commands for different package managers
   - Initial configuration required
   - Common setup patterns

3. **Core Usage Patterns**
   - Basic usage examples (most common use cases)
   - Advanced usage examples (for complex scenarios)
   - Integration examples with common libraries
   - TypeScript types (if applicable)

4. **API Reference**
   - Key functions/methods with parameters
   - Configuration options and their effects
   - Event handlers (if applicable)
   - Return types and expected values

5. **Best Practices**
   - Recommended patterns from official docs
   - Performance optimization tips
   - Common mistakes to avoid
   - Testing approaches for this package

6. **Troubleshooting**
   - Common error messages and solutions
   - Known issues and workarounds
   - Debugging techniques

7. **Migration Notes**
   - How to upgrade from previous versions
   - Breaking changes between versions
   - Migration scripts or tools if available

8. **Integration Examples**
   - How to integrate with project structure
   - Configuration for different environments
   - Example code following project conventions

### Package Inventory Management

Maintain a living package inventory that tracks:

| Field | Description |
|--------|-------------|
| **Package Name** | Name of the package/library |
| **Current Version** | Version being used in project |
| **Latest Stable Version** | Latest stable release |
| **Install Date** | When package was added to project |
| **Purpose** | What the package is used for |
| **Dependencies** | Other packages it depends on |
| **Security Notes** | Known vulnerabilities or advisories |
| **Last Checked** | Date of last version check |
| **Skill File** | Link to skill file if exists |
| **Status** | Active, deprecated, to-be-replaced |

### Version Management Strategy

Before updating any package:

1. **Check Breaking Changes**: Review release notes for breaking changes
2. **Update Skill**: If skill exists, update with new patterns
3. **Create Migration Task**: Add migration steps to implementation plan
4. **Test Thoroughly**: Include regression testing in test plan
5. **Document Changes**: Update package inventory and any related documentation

### Package Research MCP Tools Reference

| Tool | Best For | When to Use |
|-------|-----------|--------------|
| `WebSearch` | Finding latest versions, comparisons, release notes | Initial package discovery |
| `mcp_web-reader_webReader` | Reading official documentation | Understanding API and usage |
| `mcp_mcp-deepwiki_deepwiki_fetch` | Comprehensive library docs | Deep dive into popular libraries |
| `mcp_context7_query-docs` | Specific library documentation queries | Finding specific API details |
| `mcp_GitHub_search_repositories` | Finding package repositories | Evaluating package options |
| `mcp_GitHub_search_code` | Finding usage examples | Learning from real code |
| `mcp_GitHub_get_file_contents` | Reading specific examples | Detailed code examples |
| `mcp_GitHub_list_commits` | Checking maintenance activity | Evaluating package health |

---

## Process Summary

| Phase | Purpose | Key Agents | Key Deliverables | SDLC Practices | Approval Required |
|-------|---------|------------|------------------|----------------|-------------------|
| 1 | Requirements & Research | researcher, search, architect | PRD, Research Findings, Requirements Traceability Matrix | Risk-Based Testing, Incremental Delivery | YES |
| 2 | Architecture & Design | architect, frontend, database | TAD, API Specs, DB Design, UI/UX Specs, Security & Compliance, Infrastructure Plan | Observability First, Feature Flags, Environment Parity | YES |
| 3 | Implementation Planning | backend, qa, integration | Implementation Plan, Test Plan, Quality Metrics, CI/CD Strategy, Timeline, Definition of Done | Spike Tasks, Automated Quality Gates, Technical Debt Tracking | YES |
| 4 | Development | backend, frontend, database | Working code, Code documentation | Definition of Ready, Refactoring as You Go, Documentation as Code | NO |
| 5 | Testing & Quality | qa, integration, diagnostician | Test results, Bug reports, Performance metrics | Risk-Based Testing, Code Review as Learning | YES |
| 6 | Deployment | integration, diagnostician | Deployed system, Monitoring setup, Deployment documentation | Feature Flags, Observability First, Environment Parity | NO |

---

## Quick Reference Decision Tree

```
User Request
│
├─ Skill Discovery (.trae/skills/ scanned at startup)
│  ├─ Relevant skill found?
│  │  ├─ Implicit: Auto-activate based on description match
│  │  └─ Explicit: User requests "Use [skill-name] skill"
│  │     → Load SKILL.md → Follow instructions → Resume process
│  └─ Not found → Continue to standard process
│
├─ Apply SDLC Practices (Proactive)
│  ├─ Definition of Ready? → Verify before implementation
│  ├─ Spike Needed? → Create spike task for unknowns
│  ├─ Risk Assessment? → Plan risk-based testing
│  ├─ Incremental Delivery? → Break into small increments
│  ├─ Observability? → Plan from Phase 2
│  └─ Feature Flags? → Use for risky releases
│
├─ Is it a bug fix?
│  ├─ Yes → diagnostician → developer → qa → deployment
│  └─ No
│      ├─ Is it a new feature?
│      │  ├─ Yes → Full process (Phases 1-6 with SDLC practices)
│      │  └─ No
│      │      ├─ Is it research only?
│      │      │  └─ Yes → Phase 1 only
│      │      ├─ Is it design only?
│      │      │  └─ Yes → Phases 1-2
│      │      └─ Is it a small/trivial change?
│      │         └─ Yes → Adapted/simplified process
```

---

## Documentation-First Approach Summary

### Core Philosophy

This process is built on a **documentation-first philosophy**. The premise is simple:

> **"Think first, design second, implement third."**

### The Three Gates Before Development

Before any code is written, the project must pass through three gates:

| Gate | Phase | Question | Must Have |
|------|-------|----------|-----------|
| **Gate 1** | Phase 1 | **WHAT are we building?** | PRD, User Stories, Requirements Traceability Matrix, MVP Definition |
| **Gate 2** | Phase 2 | **HOW will we build it?** | Architecture, API Specs, DB Design, UI/UX Specs, Security Plan, Infrastructure Plan |
| **Gate 3** | Phase 3 | **HOW will we execute and validate?** | Implementation Plan, Test Plan, CI/CD Strategy, Quality Metrics, Definition of Done |

### Benefits of Documentation-First

1. **Clarity & Alignment**: Everyone understands what's being built before writing code
2. **Reduced Rework**: Architecture and design issues are caught early, not during implementation
3. **Better Estimates**: Accurate timeline and resource planning based on detailed plans
4. **Quality by Design**: Security, performance, and testing considerations are designed in, not bolted on
5. **User Confidence**: Stakeholders see exactly what will be delivered before development begins
6. **Maintainability**: Comprehensive documentation makes future maintenance easier

### When Documentation Can Be Streamlined

Documentation can be simplified (not skipped) for:
- **Bug fixes**: Document only what changes, not entire system
- **Trivial changes**: Minimal documentation focused on the specific change
- **Proof-of-concepts**: Documentation focused on learning goals, not production readiness

However, even in these cases:
- **The WHAT must be clear**: What is the problem, what is the fix?
- **The HOW must be defined**: How will the fix be implemented?
- **The VALIDATION must be planned**: How will we know it works?

### Documentation Hierarchy

| Priority | Documentation | Can Skip? | Rationale |
|----------|---------------|------------|-----------|
| **Critical** | PRD, Requirements | NO | Defines what we're building |
| **Critical** | Architecture/Design | NO | Defines how we'll build it |
| **Critical** | Implementation Plan | NO | Defines execution approach |
| **High** | API Specs | NO (if APIs exist) | Contracts between systems |
| **High** | Test Plan | NO | Defines quality validation |
| **Medium** | UI/UX Specs | Maybe (if no UI) | Only for user-facing features |
| **Medium** | DB Design | Maybe (if no DB) | Only for data-intensive features |
| **Low** | Infrastructure | Maybe (simple apps) | Can use defaults for simple apps |

---

**Remember**: The goal is to balance thoroughness with efficiency. Adapt process based on task complexity and user needs, but always maintain quality through appropriate agent usage and approval checkpoints. **Documentation is not overhead—it's the foundation of quality software development.**

---

## Proactive SDLC Practices for SOLO Coder

This section outlines practical, low-overhead SDLC practices optimized for SOLO Coder's agent and tool capabilities.

### Definition of Ready (DoR)

Before starting any implementation task, ensure it meets Definition of Ready:

| Criteria | Description | Who Verifies |
|----------|-------------|---------------|
| **Clear Requirements** | Task has clear, unambiguous requirements | SOLO Coder |
| **Design Available** | Architecture/design is documented | architect/design agents |
| **Estimates Provided** | Task has time and effort estimates | SOLO Coder |
| **Dependencies Identified** | Dependencies on other tasks are clear | SOLO Coder |
| **Acceptance Criteria** | Clear criteria for task completion | qa-tester |
| **Test Cases Defined** | Test cases are written or planned | qa-tester |
| **Packages Researched** | Required packages are researched and available | SOLO Coder |
| **Skills Available** | Skills exist for unfamiliar packages | skill-writer |

**When to Use**: Every task in Phase 4 (Development)

### Spike Tasks

For complex or unfamiliar features, conduct Spike tasks before implementation:

**What is a Spike**: Time-boxed research task to investigate feasibility, approach, or technology

**When to Create Spikes**:
- Using new technology or library for the first time
- Architecture has significant unknowns
- Feature complexity is uncertain
- Integration with external system has unknowns
- Performance requirements are aggressive and unproven

**Spike Process**:
```
Identify Uncertainty → Create Spike Task → Time-box (2-8 hours)
      ↓
Research & Prototype → Document Findings → Present Approach
      ↓
Get Approval → Proceed with Implementation
```

**Spike Deliverables**:
- Proof of concept (if applicable)
- Technology recommendations with justification
- Risk assessment
- Implementation approach recommendation
- Updated skills for any new technologies learned

### Risk-Based Testing

Focus testing efforts on high-risk areas rather than blanket coverage:

**Risk Categories**:

| Risk Level | Criteria | Testing Priority |
|-------------|------------|------------------|
| **Critical** | Security, data loss, payment, user data breaches | 100% coverage, automated + manual |
| **High** | Core user flows, authentication, business logic | 90% coverage, automated |
| **Medium** | Edge cases, error handling, validation | 70% coverage, automated key paths |
| **Low** | UI polish, non-critical features | 50% coverage, manual testing |

**Risk-Based Test Planning** (for qa-tester agent):
1. Identify all user flows and features
2. Assign risk levels based on business impact
3. Plan test coverage based on risk level
4. Prioritize critical/high-risk test automation

### Incremental Delivery

Deliver functionality in small, shippable increments:

**Benefits**:
- Faster user feedback
- Reduced risk of large failures
- Continuous value delivery
- Easier rollback of problematic features
- Improved morale from shipping regularly

**Incremental Delivery Process**:
```
Break Feature into Increments → Prioritize by Value → Deliver Increment 1
        ↓
User Feedback → Adjust Priorities → Deliver Increment 2
        ↓
Repeat Until Complete
```

**Increment Sizing**:
- Each increment should be: 1-3 days of work
- Independent: Can be deployed separately
- Valuable: Delivers user value on its own
- Testable: Can be verified independently

### Technical Debt Tracking

Track and manage technical debt proactively:

**What is Technical Debt**: Code or design choices that sacrifice quality for speed, requiring future work to fix

**Tracking Categories**:

| Type | Description | Example | Priority |
|-------|-------------|-----------|-----------|
| **Code Debt** | Poor code quality, missing refactoring | Duplicate code, long functions | Medium |
| **Design Debt** | Architectural issues, missing abstractions | Tight coupling, wrong patterns | High |
| **Test Debt** | Insufficient test coverage, flaky tests | Untested critical paths | High |
| **Documentation Debt** | Missing or outdated documentation | Undocumented APIs | Low |
| **Infrastructure Debt** | Manual processes, missing automation | Manual deployments | Medium |
| **Performance Debt** | Suboptimal performance, missing optimizations | N+1 queries, missing indexes | Medium |
| **Security Debt** | Security vulnerabilities, missing protections | Unvalidated inputs | Critical |

**Debt Management Process**:
1. **Identify**: During code review or diagnostician analysis
2. **Categorize & Prioritize**: Using the table above
3. **Document**: Add to technical debt backlog
4. **Address**: Allocate time in each sprint (10-20% capacity)
5. **Track**: Mark debts as paid when addressed

**When to Pay Debt**:
- Critical/High: Address before adding new features
- Medium: Address when working in same area
- Low: Address during maintenance windows or refactor sprints

### Documentation as Code

Keep documentation close to code for better maintainability:

**Approaches**:

1. **Inline Documentation**
   - JSDoc/TSDoc comments for TypeScript/JavaScript
   - Docstrings for Python
   - README in component directories
   - Example usage in doc comments

2. **Type Definitions as Documentation**
   - Use TypeScript interfaces as API contracts
   - Document complex types with comments
   - Export types for reuse

3. **Documentation in Version Control**
   - Keep docs in same repo as code
   - Update docs with code changes
   - PR templates ensure docs are updated

**Documentation Review Checklist** (for code-reviewer):
- [ ] Public APIs have documentation
- [ ] Complex logic has explanatory comments
- [ ] Types/interfaces are documented
- [ ] README exists for modules/components
- [ ] Examples are provided for usage

### Automated Quality Gates

Set up automated checks to catch issues early:

**Quality Gates to Implement**:

| Gate | Tool | Purpose | When Runs |
|-------|-------|---------|-----------|
| **Linting** | ESLint, Prettier, etc. | On every commit/PR |
| **Type Checking** | TypeScript, mypy, etc. | On every commit/PR |
| **Unit Tests** | Jest, Vitest, etc. | On every commit/PR |
| **Build Check** | Build scripts, webpack, etc. | On every commit/PR |
| **Security Scan** | npm audit, Snyk, etc. | On every commit/PR |
| **Code Coverage** | Coverage tools | On every commit/PR |
| **Integration Tests** | Playwright, Cypress | On PR to main branch |
| **Performance Check** | Lighthouse, bundlesize | On PR to main branch |

**Gate Enforcement**:
- Block merge if any gate fails
- Provide clear error messages for failures
- Auto-fix simple issues (formatting, linting)

**Implementation Process** (for integration-engineer):
1. Select appropriate gates for project
2. Configure CI/CD pipeline with gates
3. Set up branch protection rules
4. Document gate failures and resolution

### Observability First

Add observability (monitoring, logging, metrics) from the start:

**What to Observe**:

| Category | Metrics/Logs | Tools | Purpose |
|-----------|---------------|--------|---------|
| **Performance** | Response times, throughput, error rates | APM tools | Identify bottlenecks |
| **Errors** | Stack traces, error messages | Logging tools | Debug issues |
| **User Behavior** | Page views, clicks, flows | Analytics | Understand usage |
| **Business** | Feature usage, conversion rates | Custom metrics | Measure success |
| **Infrastructure** | CPU, memory, disk I/O | Monitoring | Prevent outages |

**Observability Checklist** (for each feature):
- [ ] Error logging for all failure paths
- [ ] Performance metrics for critical paths
- [ ] User telemetry for key flows
- [ ] Alert thresholds defined
- [ ] Dashboard configured for monitoring

**When to Add**: During Phase 3 (Implementation Planning) and Phase 4 (Development)

### Environment Parity

Keep development, staging, and production environments as similar as possible:

**Benefits**:
- Catches environment-specific issues early
- Reduces "works on my machine" problems
- Makes deployment more predictable
- Simplifies troubleshooting

**Parity Checklist**:

| Aspect | What to Match | Tools |
|---------|---------------|--------|
| **Dependencies** | Same package versions | package-lock.json, requirements.txt |
| **Configuration** | Same config structure | Environment variables, config files |
| **Data** | Similar data structure and volume | Seed data, test fixtures |
| **Infrastructure** | Same OS, runtime versions | Docker, nvm, etc. |
| **Network** | Similar network conditions | Proxies, rate limiting |

**Implementation** (for integration-engineer):
- Use Docker for local development
- Use Docker Compose for local stack
- Share Dockerfiles across environments
- Use IaC for consistent infrastructure

### Feature Flags

Gradually release features to reduce risk:

**When to Use Feature Flags**:
- A/B testing different implementations
- Phased rollout to users
- Emergency kill switch for problematic features
- Beta testing with subset of users
- Releasing incomplete features

**Feature Flag Workflow**:
```
Develop with Flag → Deploy Behind Flag → Enable for Test Users
        ↓
Monitor & Validate → Gradual Rollout → Full Release
        ↓
Remove Flag (Optional)
```

**Flag Management**:
- Document flags in code and configuration
- Set flag expiration dates
- Monitor flag usage
- Remove flags after full rollout

### Refactoring as You Go

Refactor continuously rather than in large batches:

**Refactoring Triggers**:

| Trigger | Action | Example |
|----------|--------|---------|
| **Rule of Three** | After 3rd similar code, extract to reusable component | Duplicate form fields |
| **Code Review Feedback** | Address refactoring suggestions from reviewers | "Extract method" comment |
| **Complex Function** | Break down functions > 50 lines or > 5 parameters | Long API handler |
| **Complexity Threshold** | Simplify code exceeding cyclomatic complexity of 10 | Nested conditionals |
| **Performance Issue** | Optimize slow code paths | N+1 query |

**Refactoring Process**:
1. Write tests for existing behavior (if none exist)
2. Make small, incremental changes
3. Run tests after each change
4. Commit frequently with refactoring messages
5. Update documentation if API changes

**Refactoring Documentation** (in commit messages):
```
refactor: extract user validation to separate service

- Moved validation logic from controllers to UserService
- Added tests for validation service
- Updated API documentation
```

### Code Review as Learning

Use code reviews as teaching moments:

**Code Review Focus Areas** (for code-reviewer):

| Area | What to Review | Learning Opportunity |
|-------|----------------|---------------------|
| **Correctness** | Logic errors, edge cases | Understanding requirements |
| **Security** | Vulnerabilities, unsafe patterns | Security awareness |
| **Performance** | Inefficiencies, bottlenecks | Performance optimization |
| **Maintainability** | Code organization, naming | Best practices |
| **Testing** | Test coverage, test quality | Testing strategies |
| **Documentation** | Clarity, completeness | Documentation skills |
| **Patterns** | Design patterns, idiomatic code | Architectural thinking |
| **UI/UX Consistency** | Design System adherence, accessibility | Design system knowledge |

**Review Feedback Template**:
```
## Issue
[Describe the issue clearly]

## Impact
[Explain why this matters]

## Suggestion
[Provide specific, actionable suggestion]

## Example
[Show code example if helpful]

## Resources
[Link to documentation or examples for learning]
```

### Proactive Practice Selection Guide

| Practice | When to Use | Agent(s) Involved | Effort | Value |
|----------|-------------|-------------------|---------|--------|
| **Definition of Ready** | Every implementation task | SOLO Coder, qa-tester | Low | High |
| **Spike Tasks** | Complex/unknown features | All agents | Medium | High |
| **Risk-Based Testing** | All features | qa-tester, diagnostician | Low | High |
| **Incremental Delivery** | All features | All agents | Low | High |
| **Technical Debt Tracking** | All phases | All agents | Low | High |
| **Documentation as Code** | All phases | code-reviewer, developers | Low | High |
| **Automated Quality Gates** | Project setup | integration-engineer | High | High |
| **Observability First** | All features | integration-engineer, developers | Medium | High |
| **Environment Parity** | Project setup | integration-engineer | Medium | High |
| **Feature Flags** | Risky releases | developers, integration-engineer | Medium | Medium |
| **Refactoring as You Go** | All phases | developers, code-reviewer | Low | High |
| **Code Review as Learning** | All code reviews | code-reviewer, developers | Low | High |
| **UI/UX Consistency Enforcement** | All UI/UX phases | frontend-developer, code-reviewer, qa-tester | Medium | High |

### SDLC Practice Integration

**Phase 1 (Requirements & Research)**:
- Identify risks for risk-based testing
- Plan incremental delivery strategy
- Conduct user research for UI/UX needs
- Define accessibility requirements (WCAG 2.1 AA)

**Phase 2 (Architecture & Design)**:
- Plan observability from the start
- Design feature flags if needed
- Consider environment parity
- **CRITICAL: Develop comprehensive Design System** with:
  - Design tokens (colors, typography, spacing)
  - Component library with all necessary components
  - Pattern library for common interactions
  - Accessibility guidelines incorporated
  - Responsive design specifications
- Create high-fidelity mockups for all screens
- Conduct Design QA before handoff

**Phase 3 (Implementation Planning)**:
- Create spike tasks for unknowns
- Plan automated quality gates
- Set up technical debt tracking
- Plan UI/UX testing strategy including:
  - Visual regression testing
  - Accessibility testing
  - Cross-browser/device testing
  - Usability testing

**Phase 4 (Development)**:
- Use Definition of Ready for each task
- Refactor as you go
- Document as code
- Add observability
- **CRITICAL: Strict adherence to Design System**:
  - Use pre-built components from component library
  - Apply design tokens (no hard-coded values)
  - Implement responsive designs per specifications
  - Follow accessibility guidelines (ARIA, keyboard navigation)
  - Implement micro-interactions as specified
  - Maintain visual consistency across all screens

**Phase 5 (Testing & Quality)**:
- Execute risk-based testing
- Validate technical debt items
- Review code with learning focus
- **Comprehensive UI/UX validation**:
  - Visual consistency verification against Design System
  - Component library usage verification
  - Accessibility testing (WCAG 2.1 AA, keyboard, screen reader)
  - Cross-browser and cross-device testing
  - User flow and usability testing
  - Visual regression testing (screenshots comparison)
  - Performance testing (Core Web Vitals)

**Phase 6 (Deployment)**:
- Deploy with feature flags
- Monitor observability metrics
- Validate environment parity
