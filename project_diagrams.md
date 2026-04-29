# InterviewMate - Project Diagrams

This document contains the core diagrams for the InterviewMate major project report, formatted using Mermaid.js.

## 1. Block Diagram (System Architecture)

This diagram illustrates the high-level architecture and components of the InterviewMate platform, including core AI processing and background queues.

```mermaid
graph TD
    subgraph Client Side
        Frontend[Frontend Application\nReact.js]
    end

    subgraph Server Side
        API[Backend API Server\nNode.js / Express]
        Worker[Background Worker\nBullMQ]
    end

    subgraph Data Layer
        DB[(Primary Database\nMongoDB)]
        Cache[(Cache & Queue\nRedis)]
    end

    subgraph External Services
        Auth[Clerk Auth]
        Payment[Razorpay]
        AI_LLM[OpenRouter AI / VAPI]
        Code_Exec[JDoodle API]
        TTS[AWS Polly]
    end

    Frontend <-->|REST| API
    Frontend <-->|Auth Tokens| Auth
    
    API <-->|Read / Write| DB
    API <-->|Enqueue Jobs| Cache
    Cache <-->|Process Jobs| Worker
    Worker <-->|Save Results| DB
    
    API <-->|Verify Payments| Payment
    API <-->|Generate Responses| AI_LLM
    Worker <-->|Long Analysis| AI_LLM
    API <-->|Execute Code| Code_Exec
    API <-->|Speech Generation| TTS
```

## 2. Flow Chart (User Journey)

This flowchart represents the diverse feature set and typical user journeys across the platform.

```mermaid
---
config:
  layout: fixed
---
flowchart TB
    A(["Start"]) --> B{"Authenticated"}
    B -- No --> C["Register / Login"]
    B -- Yes --> D["User Dashboard"]
    C --> D
    
    D --> E{"Select Feature"}
    
    E -- Custom Interview --> TC1{"Tokens Exist?"}
    E -- Group Discussion --> TC2{"Tokens Exist?"}
    
    TC1 -- No --> Buy["Buy Subscription / Tokens via Razorpay"]
    TC2 -- No --> Buy
    Buy --> D
    
    TC1 -- Yes --> F1["Fill Job Role Context"]
    TC2 -- Yes --> G1["Join GD Session"]
    
    F1 --> F2["Start Interview"]
    F2 --> F3["AI Asks Theory & Coding Questions"]
    F3 --> F4["User Answers"]
    F4 --> F5["Background Report Generation"]
    
    G1 --> G2["Interact with AI Participants"]
    G2 --> F5
    
    E -- Resume ATS --> H1["Upload Resume & JD"]
    H1 --> H2["Extract Text & Match Keywords"]
    H2 --> H3["Detailed Feedback Report"]
    
    E -- Coding Environment --> J1["Write Code"]
    J1 --> J2["Execute via JDoodle"]
    
    E -- Question Bank --> K1["Browse Questions"]
    
    F5 --> L["Deduct Credits & Save to DB"]
    
    L --> M["View Results / Feedback"]
    H3 --> M
    J2 --> M
    K1 --> M
    M --> n1(["End"])

    A:::Sky
    B:::Peach
    C:::Sky
    D:::Sky
    E:::Peach
    TC1:::Peach
    TC2:::Peach
    Buy:::Sky
    F1:::Sky
    F2:::Sky
    F3:::Sky
    F4:::Sky
    F5:::Sky
    G1:::Sky
    G2:::Sky
    H1:::Sky
    H2:::Sky
    H3:::Sky
    J1:::Sky
    J2:::Sky
    K1:::Sky
    L:::Sky
    M:::Sky
    n1:::Sky
    
    classDef Peach stroke-width:1px, stroke-dasharray:none, stroke:#FBB35A, fill:#FFEFDB, color:#8F632D
    classDef Sky stroke-width:1px, stroke-dasharray:none, stroke:#374D7C, fill:#E2EBFF, color:#374D7C
```

## 3. Use Case Diagram

This diagram shows the interactions between the primary actors (User and Admin) and the application's major features.

```mermaid
flowchart LR
    User([User / Candidate])
    Admin([Administrator])

    subgraph PlaceMateAI System
        UC1(Auth & Payments)
        UC2(Custom Mock Interview)
        UC3(Group Discussion)
        UC4(Resume ATS Scoring)
        UC5(LinkedIn Profile Analyzer)
        UC6(Coding Practice Environment)
        UC7(Browse Question Bank)
        UC8(Admin Panel - Manage Content & Users)
    end

    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7

    Admin --> UC1
    Admin --> UC8
```

## 4. Class Diagram

This diagram outlines the primary objects/classes within the backend system covering all major features.

```mermaid
classDiagram
    class User {
        +String clerkId
        +String email
        +login()
        +register()
        +updateProfile()
    }

    class Subscription {
        +ObjectId userId
        +String tier
        +Number credits
        +Date planExpiry
        +upgradeTier()
        +deductCredits()
    }

    class InterviewSession {
        +ObjectId userId
        +String interviewType
        +String status
        +Object report
        +startInterview()
        +completeInterview()
    }

    class GDSession {
        +ObjectId userId
        +String topic
        +String status
        +Number duration
        +joinSession()
        +generateReport()
    }

    class Resume {
        +String clerkId
        +String title
        +String template
        +upload()
        +parseText()
    }

    class AtsScore {
        +String clerkId
        +String jobDescription
        +Number score
        +calculateScore()
    }

    User "1" -- "1" Subscription : has
    User "1" -- "*" InterviewSession : takes
    User "1" -- "*" GDSession : participates
    User "1" -- "*" Resume : creates
    User "1" -- "*" AtsScore : receives
```

## 5. ER Diagram (Entity-Relationship)

This diagram details the database schema and the entity relationships based on the actual backend models.

```mermaid
flowchart TD
    %% Entities
    User[USER]
    Sub[SUBSCRIPTION]
    Int[INTERVIEW_SESSION]
    GD[GD_SESSION]
    Res[RESUME]
    Ats[ATS_SCORE]

    %% Relationships
    Has{Has}
    Takes{Takes}
    Parts{Participates}
    Creates{Creates}
    Receives{Receives}

    %% Attributes for User
    U_Id([_id])
    U_Email([email])
    U_Status([status])
    U_Role([role])
    U_FName([firstName])

    User --- U_Id
    User --- U_Email
    User --- U_Status
    User --- U_Role
    User --- U_FName

    %% Attributes for Subscription
    S_Id([_id])
    S_Tier([tier])
    S_Credits([credits])
    S_Expiry([planExpiry])
    S_Cycle([billingCycle])

    Sub --- S_Id
    Sub --- S_Tier
    Sub --- S_Credits
    Sub --- S_Expiry
    Sub --- S_Cycle

    %% Attributes for InterviewSession
    I_Id([_id])
    I_Type([interviewType])
    I_Status([status])
    I_Dur([actualDuration])
    I_Vapi([vapiCallId])
    I_CAt([createdAt])

    Int --- I_Id
    Int --- I_Type
    Int --- I_Status
    Int --- I_Dur
    Int --- I_Vapi
    Int --- I_CAt

    %% Attributes for GDSession
    G_Id([_id])
    G_Topic([topic])
    G_Duration([duration])
    G_Status([status])
    G_Cat([category])
    G_Limit([timeLimit])

    GD --- G_Id
    GD --- G_Topic
    GD --- G_Duration
    GD --- G_Status
    GD --- G_Cat
    GD --- G_Limit

    %% Attributes for Resume
    R_Id([_id])
    R_Title([title])
    R_Temp([template])
    R_CAt([createdAt])
    R_UAt([updatedAt])

    Res --- R_Id
    Res --- R_Title
    Res --- R_Temp
    Res --- R_CAt
    Res --- R_UAt

    %% Attributes for AtsScore
    A_Id([_id])
    A_Desc([jobDescription])
    A_Score([score])
    A_FName([resumeFileName])
    A_CAt([createdAt])

    Ats --- A_Id
    Ats --- A_Desc
    Ats --- A_Score
    Ats --- A_FName
    Ats --- A_CAt

    %% Connections
    User ---|1| Has
    Has ---|1| Sub

    User ---|1| Takes
    Takes ---|N| Int

    User ---|1| Parts
    Parts ---|N| GD

    User ---|1| Creates
    Creates ---|N| Res

    User ---|1| Receives
    Receives ---|N| Ats

    %% Styling
    classDef entity fill:#9CCC65,stroke:#333,stroke-width:1px,color:#000
    classDef relationship fill:#FFA726,stroke:#333,stroke-width:1px,color:#000
    classDef attribute fill:#4DD0E1,stroke:#333,stroke-width:1px,color:#000

    class User,Sub,Int,GD,Res,Ats entity
    class Has,Takes,Parts,Creates,Receives relationship
    class U_Id,U_Email,U_Status,U_Role,U_FName,S_Id,S_Tier,S_Credits,S_Expiry,S_Cycle,I_Id,I_Type,I_Status,I_Dur,I_Vapi,I_CAt,G_Id,G_Topic,G_Duration,G_Status,G_Cat,G_Limit,R_Id,R_Title,R_Temp,R_CAt,R_UAt,A_Id,A_Desc,A_Score,A_FName,A_CAt attribute
```
