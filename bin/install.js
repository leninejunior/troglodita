#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const readline = require('readline');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const VERSION = require(path.join(__dirname, '..', 'package.json')).version;

const MARKER = '<!-- troglodita-start -->';
const MARKER_END = '<!-- troglodita-end -->';

const AGENTS = [
  {
    id: 'claude',
    label: 'Claude Code',
    detect: () => hasCommand('claude'),
    install: installClaude,
  },
  {
    id: 'cursor',
    label: 'Cursor',
    detect: () => dirExists(path.join(homeDir(), '.cursor')),
    install: installCursor,
  },
  {
    id: 'codex',
    label: 'Codex CLI',
    detect: () => hasCommand('codex') || dirExists(path.join(homeDir(), '.codex')),
    install: installCodex,
  },
  {
    id: 'windsurf',
    label: 'Windsurf',
    detect: () => dirExists(path.join(homeDir(), '.codeium')),
    install: installWindsurf,
  },
  {
    id: 'cline',
    label: 'Cline',
    detect: () => dirExists(path.join(homeDir(), '.cline')) || vscodeExtPresent('saoudrizwan.claude-dev'),
    install: installCline,
  },
  {
    id: 'roo',
    label: 'Roo Code',
    detect: () => dirExists(path.join(homeDir(), '.roo')),
    install: installRoo,
  },
  {
    id: 'copilot',
    label: 'GitHub Copilot',
    detect: () => vscodeExtPresent('github.copilot'),
    install: installCopilot,
  },
  {
    id: 'gemini',
    label: 'Gemini CLI',
    detect: () => hasCommand('gemini') || dirExists(path.join(homeDir(), '.gemini')),
    install: installGemini,
  },
  {
    id: 'antigravity',
    label: 'Antigravity',
    detect: () => hasCommand('antigravity') || fileExists(path.join(homeDir(), '.gemini', 'AGENTS.md')),
    install: installAntigravity,
  },
  {
    id: 'opencode',
    label: 'OpenCode',
    detect: () => hasCommand('opencode') || dirExists(path.join(homeDir(), '.config', 'opencode')),
    install: installOpenCode,
  },
  {
    id: 'aider',
    label: 'Aider',
    detect: () => hasCommand('aider'),
    install: installAider,
  },
  {
    id: 'amazonq',
    label: 'Amazon Q',
    detect: () => hasCommand('q') || dirExists(path.join(homeDir(), '.amazonq')),
    install: installAmazonQ,
  },
  {
    id: 'zed',
    label: 'Zed AI',
    detect: () => dirExists(path.join(homeDir(), '.config', 'zed')) || macAppPresent('Zed'),
    install: installZed,
  },
];

// --- Helpers ---

function homeDir() {
  return process.env.HOME || process.env.USERPROFILE || '';
}

function hasCommand(cmd) {
  try {
    execFileSync('sh', ['-c', `command -v ${cmd}`], { stdio: 'ignore' });
    return true;
  } catch {
    if (process.platform === 'win32') {
      try {
        execFileSync('where', [cmd], { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

function dirExists(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

function fileExists(p) {
  try { return fs.statSync(p).isFile(); } catch { return false; }
}

function macAppPresent(name) {
  if (process.platform !== 'darwin') return false;
  try {
    execFileSync('mdfind', [`kMDItemKind == 'Application' && kMDItemDisplayName == '${name}'`], { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

function vscodeExtPresent(extId) {
  const extDirs = [
    path.join(homeDir(), '.vscode', 'extensions'),
    path.join(homeDir(), '.vscode-server', 'extensions'),
  ];
  for (const dir of extDirs) {
    try {
      const entries = fs.readdirSync(dir);
      if (entries.some((e) => e.toLowerCase().startsWith(extId.toLowerCase()))) return true;
    } catch {}
  }
  return false;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function readSkillContent(skillName) {
  const src = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  return fs.readFileSync(src, 'utf-8');
}

function copySkill(skillName, destDir) {
  const src = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  const dest = path.join(destDir, skillName, 'SKILL.md');
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return dest;
}

function upsertMarkedBlock(filePath, content) {
  const block = `${MARKER}\n${content}\n${MARKER_END}`;
  let existing = '';
  try { existing = fs.readFileSync(filePath, 'utf-8'); } catch {}

  if (existing.includes(MARKER)) {
    const re = new RegExp(`${escapeRegex(MARKER)}[\\s\\S]*?${escapeRegex(MARKER_END)}`);
    fs.writeFileSync(filePath, existing.replace(re, block), 'utf-8');
    return 'atualizado';
  }
  fs.appendFileSync(filePath, `\n${block}\n`, 'utf-8');
  return 'adicionado';
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function log(msg) {
  console.log(msg);
}

// --- Install functions ---

function installClaude() {
  const skills = ['troglodita', 'troglodita-commit', 'troglodita-review', 'troglodita-help'];
  const skillsTarget = path.join(homeDir(), '.claude', 'skills');
  ensureDir(skillsTarget);
  for (const skill of skills) {
    const dest = copySkill(skill, skillsTarget);
    log(`  skill ${skill} → ${dest}`);
  }
  log('  Usar: /troglodita [leve|total|máximo]');
}

function installCursor() {
  const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
  ensureDir(rulesDir);
  const skills = [
    { name: 'troglodita', file: 'troglodita.mdc' },
    { name: 'troglodita-commit', file: 'troglodita-commit.mdc' },
    { name: 'troglodita-review', file: 'troglodita-review.mdc' },
  ];
  for (const skill of skills) {
    const content = readSkillContent(skill.name);
    const mdc = `---\ndescription: "Troglodita: ${skill.name} — compressão de tokens PT-BR"\nalwaysApply: true\n---\n\n${content}`;
    const dest = path.join(rulesDir, skill.file);
    fs.writeFileSync(dest, mdc, 'utf-8');
    log(`  regra ${skill.name} → ${dest}`);
  }
  log('  Regras instaladas em .cursor/rules/ (projeto atual).');
}

function installCodex() {
  const agentsFile = path.join(homeDir(), '.codex', 'AGENTS.md');
  ensureDir(path.dirname(agentsFile));
  const result = upsertMarkedBlock(agentsFile, readSkillContent('troglodita'));
  log(`  ~/.codex/AGENTS.md ${result}.`);
}

function installWindsurf() {
  const globalFile = path.join(homeDir(), '.codeium', 'windsurf', 'memories', 'global_rules.md');
  ensureDir(path.dirname(globalFile));
  const result = upsertMarkedBlock(globalFile, readSkillContent('troglodita'));
  log(`  Regra global ${result}.`);

  const rulesDir = path.join(process.cwd(), '.windsurf', 'rules');
  ensureDir(rulesDir);
  const skills = [
    { name: 'troglodita', file: 'troglodita.md' },
    { name: 'troglodita-commit', file: 'troglodita-commit.md' },
    { name: 'troglodita-review', file: 'troglodita-review.md' },
  ];
  for (const skill of skills) {
    const content = readSkillContent(skill.name);
    const windsurf = `---\ntrigger: always_on\ndescription: "Troglodita: ${skill.name} — compressão de tokens PT-BR"\n---\n\n${content}`;
    const dest = path.join(rulesDir, skill.file);
    fs.writeFileSync(dest, windsurf, 'utf-8');
    log(`  regra ${skill.name} → ${dest}`);
  }
}

function installCline() {
  const rulesDir = path.join(homeDir(), '.cline', 'rules');
  ensureDir(rulesDir);
  const skills = ['troglodita', 'troglodita-commit', 'troglodita-review'];
  for (const skill of skills) {
    const dest = path.join(rulesDir, `${skill}.md`);
    fs.writeFileSync(dest, readSkillContent(skill), 'utf-8');
    log(`  regra ${skill} → ${dest}`);
  }
  log('  Regras globais instaladas em ~/.cline/rules/');
}

function installRoo() {
  const rulesDir = path.join(homeDir(), '.roo', 'rules');
  ensureDir(rulesDir);
  const skills = ['troglodita', 'troglodita-commit', 'troglodita-review'];
  for (const skill of skills) {
    const dest = path.join(rulesDir, `${skill}.md`);
    fs.writeFileSync(dest, readSkillContent(skill), 'utf-8');
    log(`  regra ${skill} → ${dest}`);
  }
  log('  Regras globais instaladas em ~/.roo/rules/');
}

function installCopilot() {
  const ghDir = path.join(process.cwd(), '.github');
  ensureDir(ghDir);
  const mainFile = path.join(ghDir, 'copilot-instructions.md');
  const result = upsertMarkedBlock(mainFile, readSkillContent('troglodita'));
  log(`  .github/copilot-instructions.md ${result}.`);

  const instrDir = path.join(ghDir, 'instructions');
  ensureDir(instrDir);
  const commitDest = path.join(instrDir, 'troglodita-commit.instructions.md');
  const commitContent = `---\ndescription: "Troglodita: commits concisos PT-BR"\napplyTo: "**/*"\n---\n\n${readSkillContent('troglodita-commit')}`;
  fs.writeFileSync(commitDest, commitContent, 'utf-8');
  log(`  instrução troglodita-commit → ${commitDest}`);
}

function installGemini() {
  const geminiFile = path.join(homeDir(), '.gemini', 'GEMINI.md');
  ensureDir(path.dirname(geminiFile));
  const result = upsertMarkedBlock(geminiFile, readSkillContent('troglodita'));
  log(`  ~/.gemini/GEMINI.md ${result}.`);
}

function installAntigravity() {
  const agentsFile = path.join(homeDir(), '.gemini', 'AGENTS.md');
  ensureDir(path.dirname(agentsFile));
  const result = upsertMarkedBlock(agentsFile, readSkillContent('troglodita'));
  log(`  ~/.gemini/AGENTS.md ${result}.`);
}

function installOpenCode() {
  const agentsFile = path.join(homeDir(), '.config', 'opencode', 'AGENTS.md');
  ensureDir(path.dirname(agentsFile));
  const result = upsertMarkedBlock(agentsFile, readSkillContent('troglodita'));
  log(`  ~/.config/opencode/AGENTS.md ${result}.`);
}

function installAider() {
  const convFile = path.join(process.cwd(), 'CONVENTIONS.md');
  const result = upsertMarkedBlock(convFile, readSkillContent('troglodita'));
  log(`  CONVENTIONS.md ${result} (projeto atual).`);
  log('  Garantir que .aider.conf.yml tem: read: CONVENTIONS.md');
}

function installAmazonQ() {
  const rulesDir = path.join(process.cwd(), '.amazonq', 'rules');
  ensureDir(rulesDir);
  const dest = path.join(rulesDir, 'troglodita.md');
  fs.writeFileSync(dest, readSkillContent('troglodita'), 'utf-8');
  log(`  regra → ${dest}`);
  log('  Amazon Q: regra de projeto instalada.');
}

function installZed() {
  const agentsFile = path.join(homeDir(), '.config', 'zed', 'AGENTS.md');
  ensureDir(path.dirname(agentsFile));
  const result = upsertMarkedBlock(agentsFile, readSkillContent('troglodita'));
  log(`  ~/.config/zed/AGENTS.md ${result}.`);

  const skillsDir = path.join(homeDir(), '.agents', 'skills');
  const skills = ['troglodita', 'troglodita-commit', 'troglodita-review'];
  for (const skill of skills) {
    const dest = copySkill(skill, skillsDir);
    log(`  skill ${skill} → ${dest}`);
  }
}

// --- Main ---

async function prompt(question) {
  let input = process.stdin;
  let shouldDestroy = false;

  if (!process.stdin.isTTY) {
    try {
      input = fs.createReadStream('/dev/tty');
      shouldDestroy = true;
    } catch {
      // Fallback para stdin (provavelmente receberá EOF)
    }
  }

  const rl = readline.createInterface({ input, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      if (shouldDestroy) input.destroy();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  console.log('');
  console.log('  🦴 troglodita v' + VERSION);
  console.log('  compressão de tokens pra PT-BR');
  console.log('');

  const args = process.argv.slice(2);

  if (args.includes('--list') || args.includes('-l')) {
    console.log('  Agentes suportados:');
    for (const agent of AGENTS) {
      const status = agent.detect() ? '✅' : '⬚ ';
      console.log(`    ${status} ${agent.label} (--only=${agent.id})`);
    }
    process.exit(0);
  }

  if (args.includes('--uninstall')) {
    console.log('  Desinstalação ainda não implementada. Remova manualmente os arquivos.');
    process.exit(0);
  }

  const detected = AGENTS.filter((a) => a.detect());
  const notDetected = AGENTS.filter((a) => !a.detect());

  if (detected.length === 0) {
    console.log('  Nenhum agente detectado.');
    console.log('  Use --list pra ver os agentes suportados.');
    process.exit(1);
  }

  console.log('  Agentes detectados:');
  for (const agent of detected) {
    console.log(`    ✅ ${agent.label}`);
  }
  if (notDetected.length > 0) {
    for (const agent of notDetected) {
      console.log(`    ⬚  ${agent.label}`);
    }
  }
  console.log('');

  const forceAll = args.includes('--all') || args.includes('-a');
  const onlyAgent = args.find((a) => a.startsWith('--only='))?.split('=')[1];

  let toInstall = detected;

  if (onlyAgent) {
    toInstall = detected.filter((a) => a.id === onlyAgent);
    if (toInstall.length === 0) {
      console.log(`  Agente "${onlyAgent}" não detectado.`);
      process.exit(1);
    }
  } else if (!forceAll && detected.length > 1) {
    const answer = await prompt(`  Instalar em todos os ${detected.length} agentes? (s/n) `);
    if (answer !== 's' && answer !== 'sim' && answer !== 'y') {
      console.log('  Instalação cancelada.');
      process.exit(0);
    }
  }

  console.log('');
  for (const agent of toInstall) {
    console.log(`  Instalando em ${agent.label}...`);
    agent.install();
    console.log('');
  }

  console.log('  🦴 Pronto! Abra seu agente e diga "modo troglodita".');
  console.log('');
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
