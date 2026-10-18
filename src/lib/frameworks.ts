import { FrameworkDefinition, FrameworkType, TargetLLM } from '@/types';

export const FRAMEWORKS: Record<FrameworkType, FrameworkDefinition> = {
  '11-POINT': {
    id: '11-POINT',
    name: '11-Point Enterprise Architecture',
    category: 'Heavyweight',
    bestFor: 'Complex systems, architecture, multi-tiered requirements, and high-stakes projects',
    components: [
      { key: 'role', label: 'Role', description: 'Specific expert persona and operational mandate' },
      { key: 'objective', label: 'Objective', description: 'Primary deliverable and core business/technical goal' },
      { key: 'context', label: 'Context', description: 'Background environment, tech stack, and ecosystem' },
      { key: 'input', label: 'Input Data / Code', description: 'Reference data, schemas, or source files' },
      { key: 'requirements', label: 'Functional Requirements', description: 'Non-negotiable functional criteria' },
      { key: 'constraints', label: 'Constraints & Boundaries', description: 'Latency, memory, security, and strict negative limits' },
      { key: 'decision_criteria', label: 'Decision Criteria', description: 'How architectural trade-offs should be weighed' },
      { key: 'output_format', label: 'Output Format', description: 'Exact structure, schema, or code breakdown' },
      { key: 'uncertainty', label: 'Uncertainty Handling', description: 'Protocol if parameters or facts are ambiguous' },
      { key: 'edge_cases', label: 'Edge Cases', description: 'Corner conditions, failures, and boundary limits' },
      { key: 'verification', label: 'Verification & Testing', description: 'Step-by-step checklist to validate correctness' },
    ],
  },
  'CO-STAR': {
    id: 'CO-STAR',
    name: 'CO-STAR Framework',
    category: 'Heavyweight',
    bestFor: 'High-impact writing, communications, executive summaries, and pitch decks',
    components: [
      { key: 'context', label: 'Context', description: 'Background situation and environment' },
      { key: 'objective', label: 'Objective', description: 'Specific goal the communication must achieve' },
      { key: 'style', label: 'Style', description: 'Writing style (e.g. executive, technical, persuasive)' },
      { key: 'tone', label: 'Tone', description: 'Emotional sentiment (authoritative, empathetic, direct)' },
      { key: 'audience', label: 'Audience', description: 'Target persona reading or evaluating this' },
      { key: 'response', label: 'Response', description: 'Required format, length, and layout structure' },
    ],
  },
  'RISEN': {
    id: 'RISEN',
    name: 'RISEN Roadmap Blueprint',
    category: 'Heavyweight',
    bestFor: 'Execution roadmaps, operational strategies, product launches, and study plans',
    components: [
      { key: 'role', label: 'Role', description: 'Expert planner or strategist identity' },
      { key: 'instructions', label: 'Instructions', description: 'Actionable steps and directives' },
      { key: 'steps', label: 'Steps', description: 'Phased chronological progression' },
      { key: 'end_goal', label: 'End Goal', description: 'Concrete definition of completed success' },
      { key: 'narrowing', label: 'Narrowing', description: 'Scope boundaries and explicit exclusions' },
    ],
  },
  'CREATE': {
    id: 'CREATE',
    name: 'CREATE Few-Shot Framework',
    category: 'Heavyweight',
    bestFor: 'Content generation requiring few-shot examples and strict template replication',
    components: [
      { key: 'character', label: 'Character', description: 'Role and voice' },
      { key: 'request', label: 'Request', description: 'Core ask or generation target' },
      { key: 'examples', label: 'Examples', description: 'Few-shot gold standard references' },
      { key: 'adjustments', label: 'Adjustments', description: 'Specific tweaks relative to examples' },
      { key: 'type', label: 'Type', description: 'Format type (table, bullets, json)' },
      { key: 'extras', label: 'Extras', description: 'Bonus nuances or guardrails' },
    ],
  },
  'CRISPE': {
    id: 'CRISPE',
    name: 'CRISPE Ideation Framework',
    category: 'Heavyweight',
    bestFor: 'Brainstorming, startup concepts, creative exploration, and multi-angle analysis',
    components: [
      { key: 'capacity', label: 'Capacity', description: 'Role capacity and specialty' },
      { key: 'insight', label: 'Insight', description: 'Market or technical background' },
      { key: 'statement', label: 'Statement', description: 'Problem or challenge to solve' },
      { key: 'personality', label: 'Personality', description: 'Style, voice, and perspective' },
      { key: 'experiment', label: 'Experiment', description: 'Specific angles, variants, and tests to explore' },
    ],
  },
  'RTF': {
    id: 'RTF',
    name: 'RTF (Role-Task-Format)',
    category: 'Fast & Punchy',
    bestFor: 'Targeted coding, bug fixing, SQL query generation, regex, and scripting',
    components: [
      { key: 'role', label: 'Role', description: 'Specialized engineer persona' },
      { key: 'task', label: 'Task', description: 'Explicit technical directive' },
      { key: 'format', label: 'Format', description: 'Strict output format (code block, no fluff)' },
    ],
  },
  'RACE': {
    id: 'RACE',
    name: 'RACE Framework',
    category: 'Fast & Punchy',
    bestFor: 'Rapid summarization, code reviews, and quick refactoring passes',
    components: [
      { key: 'role', label: 'Role', description: 'Expert evaluator identity' },
      { key: 'action', label: 'Action', description: 'Action to execute on provided content' },
      { key: 'context', label: 'Context', description: 'Runtime or audience context' },
      { key: 'expectation', label: 'Expectation', description: 'Output criteria and depth' },
    ],
  },
  'TAG': {
    id: 'TAG',
    name: 'TAG (Task-Action-Goal)',
    category: 'Fast & Punchy',
    bestFor: 'Performance optimization, conversion improvements, and crisp task handoffs',
    components: [
      { key: 'task', label: 'Task', description: 'Core assignment' },
      { key: 'action', label: 'Action', description: 'Mechanisms and steps to take' },
      { key: 'goal', label: 'Goal', description: 'Desired measurable outcome' },
    ],
  },
  'APE': {
    id: 'APE',
    name: 'APE (Action-Purpose-Expectation)',
    category: 'Fast & Punchy',
    bestFor: 'Zero-fluff utility tasks, bash scripts, and quick JSON format transformations',
    components: [
      { key: 'action', label: 'Action', description: 'Action verb and task' },
      { key: 'purpose', label: 'Purpose', description: 'Why this action is needed' },
      { key: 'expectation', label: 'Expectation', description: 'Strict output constraints' },
    ],
  },
  'BAB': {
    id: 'BAB',
    name: 'BAB (Before-After-Bridge)',
    category: 'Domain & Transformation',
    bestFor: 'Code refactoring, converting legacy systems, and transitioning from buggy to clean',
    components: [
      { key: 'before', label: 'Before', description: 'Current messy or buggy state' },
      { key: 'after', label: 'After', description: 'Ideal optimized target state' },
      { key: 'bridge', label: 'Bridge', description: 'Step-by-step transition path and implementation code' },
    ],
  },
  'CARE': {
    id: 'CARE',
    name: 'CARE Framework',
    category: 'Domain & Transformation',
    bestFor: 'Interview preparation, portfolio case studies, and resume impact bullets',
    components: [
      { key: 'context', label: 'Context', description: 'Project or company context and challenge' },
      { key: 'action', label: 'Action', description: 'Specific decisions and technical execution' },
      { key: 'result', label: 'Result', description: 'Quantified metrics and impact' },
      { key: 'example', label: 'Example', description: 'Real-world exemplar or narrative proof' },
    ],
  },
  'ROSES': {
    id: 'ROSES',
    name: 'ROSES Framework',
    category: 'Domain & Transformation',
    bestFor: 'Incident response, SRE troubleshooting, DevOps, and root cause analysis',
    components: [
      { key: 'role', label: 'Role', description: 'Senior SRE / DevOps Lead persona' },
      { key: 'objective', label: 'Objective', description: 'Resolve incident and restore SLA' },
      { key: 'scenario', label: 'Scenario', description: 'Log trace, environment, and error state' },
      { key: 'expected_solution', label: 'Expected Solution', description: 'Permanent fix and mitigation' },
      { key: 'steps', label: 'Steps', description: 'Verification and rollout sequence' },
    ],
  },
};

export const ANTI_FLUFF_CONSTRAINTS = `
### STRICT ANTI-FLUFF & EXECUTION GUARDRAILS:
1. No conversational filler, preambles, or conversational sign-offs (e.g., NEVER say "Certainly!", "Here is a...", "I hope this helps", "In conclusion", "As an AI...").
2. Ban all AI buzzwords and clichés: "delve", "testament", "tapestry", "beacon", "vital", "crucial", "landscape", "unleash", "game-changer", "plethora".
3. Provide direct, dense, production-grade output immediately on line 1.
4. If code is requested, provide complete runnable code with inline comments on critical logic. Never truncate with comments like "// rest of code here".
5. If assumptions are necessary, state them explicitly in a dedicated concise bullet point.
`.trim();

export const TARGET_SYNTAX_GUIDES: Record<TargetLLM, { name: string; instructions: string }> = {
  universal: {
    name: 'Universal Markdown',
    instructions:
      'Structure the prompt using clean, hierarchical Markdown (#, ##, bold tags, bullet points, and code blocks). Compatible with any modern LLM.',
  },
  claude: {
    name: 'Claude XML Structure',
    instructions:
      'Enclose all major sections in explicit XML tags (<role>, <objective>, <context>, <instructions>, <constraints>, <output_format>, <rules>). Claude natively prioritizes instructions demarcated by XML tags.',
  },
  chatgpt: {
    name: 'ChatGPT Modular Headers',
    instructions:
      'Use crisp Markdown H2 headers with bolded parameter tags. Include strict negative constraints ("What NOT to do") at the very top and very bottom of the prompt to avoid attention drift.',
  },
  deepseek: {
    name: 'DeepSeek Direct Reasoning',
    instructions:
      'Provide concise, goal-oriented framing without redundant instruction bloat. DeepSeek-R1 excels at reasoning autonomously when given high-signal, zero-fluff boundaries.',
  },
};
