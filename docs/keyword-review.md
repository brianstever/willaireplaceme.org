# Keyword spot check

Reviewed September 22, 2026. Seven short excerpts from public USAJOBS announcements were selected through targeted searches for machine learning, electrical transformers, and law degrees. Three excerpts describe AI work; four describe electrical equipment or legal qualifications.

The label is whether the excerpt mentions AI technology, not whether a job requires it. Optional and explicitly negated AI references still count as mentions. Ambiguous excerpts should be marked uncertain and reviewed before adding an alias; they should not be forced into a positive label.

The seven expected labels agree with the matcher and are retained as regression cases in `__tests__/lib/ai-keywords.test.ts`. The sample is deliberately selected, small, and excerpt-based. It has no independent second review and does not establish announcement-level precision or recall. A representative review must also measure omitted terms and references elsewhere in announcements.

| Announcement                                       | Excerpt subject      | Expected mention |
| -------------------------------------------------- | -------------------- | ---------------- |
| [885021600](https://www.usajobs.gov/job/885021600) | AI methods           | Yes              |
| [884783000](https://www.usajobs.gov/job/884783000) | AI methods           | Yes              |
| [884227600](https://www.usajobs.gov/job/884227600) | AI methods           | Yes              |
| [883858400](https://www.usajobs.gov/job/883858400) | Electrical equipment | No               |
| [885342600](https://www.usajobs.gov/job/885342600) | Electrical equipment | No               |
| [884392000](https://www.usajobs.gov/job/884392000) | Legal education      | No               |
| [853385500](https://www.usajobs.gov/job/853385500) | Legal education      | No               |
