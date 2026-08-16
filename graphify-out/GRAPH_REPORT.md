# Graph Report - INTELLI-X-master  (2026-04-24)

## Corpus Check
- 100 files · ~221,196 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 280 nodes · 330 edges · 9 communities detected
- Extraction: 58% EXTRACTED · 42% INFERRED · 0% AMBIGUOUS · INFERRED: 138 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]

## God Nodes (most connected - your core abstractions)
1. `Select()` - 47 edges
2. `useTheme()` - 42 edges
3. `useAuth()` - 30 edges
4. `useAppQuery()` - 23 edges
5. `getStudentRecord()` - 6 edges
6. `ErrorBoundary` - 5 edges
7. `AIChatbot()` - 4 edges
8. `AnalyticsPage()` - 4 edges
9. `MaterialsPage()` - 4 edges
10. `ResultsPage()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Select()` --calls--> `fetchProfile()`  [INFERRED]
  src\components\ui\FormField.jsx → src\services\profileService.js
- `useAuth()` --calls--> `AttendancePage()`  [INFERRED]
  src\context\AuthContext.jsx → src\pages\dashboard\AttendancePage.jsx
- `useAuth()` --calls--> `ProfilePage()`  [INFERRED]
  src\context\AuthContext.jsx → src\pages\dashboard\ProfilePage.jsx
- `AIChatbot()` --calls--> `useTheme()`  [INFERRED]
  src\components\dashboard\AIChatbot.jsx → src\context\ThemeContext.jsx
- `AIVisualization()` --calls--> `useTheme()`  [INFERRED]
  src\components\AIVisualization.jsx → src\context\ThemeContext.jsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (40): getAttendanceByBatchAndDate(), getAttendanceByLecture(), getAttendanceByStudent(), getAttendanceStats(), getStudentAttendanceForBatch(), upsertAttendance(), upsertLectureAttendance(), createBatch() (+32 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (22): AIVisualization(), CTA(), DashboardPreview(), FAQ(), FAQItem(), FeatureCard(), Features(), Footer() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (20): ActiveTestsPage(), AIChatbot(), AITestCreatorModal(), AnalyticsPage(), useAuth(), AuthPage(), BatchesPage(), BatchList() (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (20): AdminDashboard(), AdminAttendanceView(), AttendancePage(), StudentAttendanceView(), InstitutesPage(), LecturesPage(), LogsPage(), MasterAdminDashboard() (+12 more)

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (3): generateMCQs(), generateWithGroq(), parseAndValidateMCQs()

### Community 5 - "Community 5"
Cohesion: 0.39
Nodes (6): fetchProfile(), fetchStudentBatches(), fetchStudentStats(), fetchSubjectPerformance(), fetchTestScores(), getStudentRecord()

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 11 - "Community 11"
Cohesion: 0.83
Nodes (3): callGroq(), cleanResponse(), sendChatMessage()

### Community 12 - "Community 12"
Cohesion: 0.83
Nodes (3): callGroq(), cleanResponse(), sendMessage()

## Knowledge Gaps
- **Thin community `Community 7`** (6 nodes): `ErrorBoundary`, `.componentDidCatch()`, `.constructor()`, `.getDerivedStateFromError()`, `.render()`, `ErrorBoundary.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useTheme()` connect `Community 1` to `Community 2`, `Community 3`?**
  _High betweenness centrality (0.115) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 2` to `Community 3`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `Select()` connect `Community 0` to `Community 11`, `Community 5`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Are the 46 inferred relationships involving `Select()` (e.g. with `sendChatMessage()` and `getAttendanceByBatchAndDate()`) actually correct?**
  _`Select()` has 46 INFERRED edges - model-reasoned connections that need verification._
- **Are the 41 inferred relationships involving `useTheme()` (e.g. with `AIChatbot()` and `AIVisualization()`) actually correct?**
  _`useTheme()` has 41 INFERRED edges - model-reasoned connections that need verification._
- **Are the 29 inferred relationships involving `useAuth()` (e.g. with `AIChatbot()` and `NotificationsMenu()`) actually correct?**
  _`useAuth()` has 29 INFERRED edges - model-reasoned connections that need verification._
- **Are the 22 inferred relationships involving `useAppQuery()` (e.g. with `ActiveTestsPage()` and `AdminDashboard()`) actually correct?**
  _`useAppQuery()` has 22 INFERRED edges - model-reasoned connections that need verification._