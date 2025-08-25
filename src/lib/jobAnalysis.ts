// Dynamic job description analysis utilities (lightweight heuristic, no external AI)
// Extracts keywords, requirements, and skill gaps against candidate skills.

export interface AIJobAnalysisResult {
  keywords: string[];
  requirements: string[];
  skillsGap: string[];
}

// Basic stop words to exclude from keyword frequency counts
const STOP_WORDS = new Set([
  'and','or','the','a','an','to','of','in','with','for','on','by','at','as','is','are','be','will','you','your','our',
  'we','they','from','this','that','can','ability','etc','into','using','use','over','under','per','via','it','their',
  'within','across','have','has','had','may','must','should','such','than','other','both','more','less','any','all'
]);

// Common multi-word skill phrases to preserve
const PHRASE_SKILLS = [
  'machine learning','deep learning','artificial intelligence','natural language processing','project management',
  'data analysis','data science','continuous integration','continuous deployment','customer success',
  'unit testing','test automation','cloud computing','product management','software development','object oriented',
  'user experience','user interface','version control','problem solving'
];

// Known technology tokens (extendable)
const TECH_TOKENS = new Set([
  'javascript','typescript','react','nextjs','next','node','nodejs','express','java','python','go','golang','rust',
  'aws','gcp','azure','docker','kubernetes','graphql','rest','api','sql','mysql','postgres','mongodb','redis','html',
  'css','sass','tailwind','ci','cd','git','github','gitlab','bitbucket','terraform','ansible','linux','bash','shell',
  'kafka','rabbitmq','elasticsearch','hadoop','spark','pytorch','tensorflow','sklearn','pandas','numpy','jira','agile',
  'scrum','kanban','webpack','vite','jest','cypress','playwright','storybook','redux','zustand','prisma','sequelize'
]);

const CLEAN_BULLET = /^\s*(?:[-*•]|\d+\.|\d+\)|\((?:[a-z]|\d)\))\s*/i;

export function analyzeJobDescription(jobDescription: string, candidateSkills: string): AIJobAnalysisResult {
  if (!jobDescription) return { keywords: [], requirements: [], skillsGap: [] };

  // Normalize text
  const normalized = jobDescription.replace(/\r/g, '').replace(/\t/g, ' ').replace(/ {2,}/g, ' ');
  const lines = normalized.split(/\n+/).map(l => l.trim()).filter(Boolean);

  // Extract requirement lines: bullet lines OR lines containing action verbs / requirement keywords
  const requirementIndicators = /(responsibil|require|must|should|own|design|develop|implement|deliver|maintain|optimiz|improv|build|collaborate|coordinate|manage|lead)/i;
  const requirementsSet = new Set<string>();
  for (const line of lines) {
    if (CLEAN_BULLET.test(line) || requirementIndicators.test(line)) {
      const cleaned = line.replace(CLEAN_BULLET, '').trim();
      if (cleaned.split(' ').length > 2 && cleaned.length < 260) requirementsSet.add(capitalizeFirst(cleaned));
    }
  }

  // Tokenize for keyword frequency
  const lower = normalized.toLowerCase();
  const phraseHits: string[] = [];
  for (const phrase of PHRASE_SKILLS) {
    if (lower.includes(phrase)) phraseHits.push(phrase);
  }

  const wordTokens = lower
    .replace(/[^a-z0-9+.#\s]/g, ' ') // keep + . # for C#, C++, etc.
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));

  const freq = new Map<string, number>();
  for (let token of wordTokens) {
    // Normalize common variants
    token = token.replace(/\+$/, '') // remove trailing +
                 .replace(/[,;.]$/, '');
    if (TECH_TOKENS.has(token) || /[a-z]{3,}/.test(token)) {
      freq.set(token, (freq.get(token) || 0) + 1);
    }
  }

  // Combine phrase skills (boost weight)
  for (const phrase of phraseHits) {
    const weight = phrase.split(' ').length; // weight by words
    freq.set(phrase, (freq.get(phrase) || 0) + weight + 1);
  }

  // Rank tokens by frequency, prefer technology tokens and phrases
  const ranked = Array.from(freq.entries())
    .sort((a, b) => {
      const [ta, fa] = a; const [tb, fb] = b;
      const techBoostA = TECH_TOKENS.has(ta) || ta.includes(' ')? 2 : 0;
      const techBoostB = TECH_TOKENS.has(tb) || tb.includes(' ')? 2 : 0;
      return (fb + techBoostB) - (fa + techBoostA);
    })
    .map(([t]) => t)
    .filter(t => t.length <= 40);

  // Deduplicate while preserving order
  const seen = new Set<string>();
  const keywords: string[] = [];
  for (const token of ranked) {
    const norm = token;
    if (!seen.has(norm)) {
      keywords.push(norm);
      seen.add(norm);
    }
    if (keywords.length >= 20) break;
  }

  // Candidate skills tokenization
  const candidateTokens = candidateSkills.toLowerCase().split(/[,;\n]+|\s•\s/).map(s => s.trim()).filter(Boolean);
  const candidateSet = new Set<string>(candidateTokens);

  // Determine skill gaps (keywords not present in candidate skill set, limited)
  const skillsGap = keywords.filter(k => !candidateSet.has(k) && !candidateTokens.some(ct => k.includes(ct) || ct.includes(k))).slice(0, 10);

  return {
    keywords: keywords.map(formatKeyword),
    requirements: Array.from(requirementsSet).slice(0, 25),
    skillsGap: skillsGap.map(formatKeyword)
  };
}

function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatKeyword(k: string) {
  if (k.includes(' ')) return k.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  if (k === k.toLowerCase()) return k.toUpperCase() === 'API' ? 'API' : k.replace(/^./, c => c.toUpperCase());
  return k;
}
