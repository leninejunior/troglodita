#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const readline = require('readline');

const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const VERSION = require(path.join(__dirname, '..', 'package.json')).version;

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
];

function homeDir() {
  return process.env.HOME || process.env.USERPROFILE || '';
}

function hasCommand(cmd) {
  try {
    execFileSync('which', [cmd], { stdio: 'ignore' });
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
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copySkill(skillName, destDir) {
  const src = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  const dest = path.join(destDir, skillName, 'SKILL.md');
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
  return dest;
}

function readSkillContent(skillName) {
  const src = path.join(SKILLS_DIR, skillName, 'SKILL.md');
  return fs.readFileSync(src, 'utf-8');
}

function installClaude() {
  const skills = ['troglodita', 'troglodita-commit', 'troglodita-review', 'troglodita-help'];
  const claudeDir = path.join(homeDir(), '.claude');
  const skillsTarget = path.join(claudeDir, 'skills');

  ensureDir(skillsTarget);

  for (const skill of skills) {
    const dest = copySkill(skill, skillsTarget);
    log(`  skill ${skill} → ${dest}`);
  }

  log('  Claude Code: skills instalados.');
  log('  Usar: /troglodita [leve|total|máximo]');
}

function wrapCursorMdc(skillName, content) {
  return `---
description: "Troglodita: ${skillName} — compressão de tokens PT-BR"
alwaysApply: true
---

${content}`;
}

function installCursor() {
  const cwd = process.cwd();
  const rulesDir = path.join(cwd, '.cursor', 'rules');
  ensureDir(rulesDir);

  const skills = [
    { name: 'troglodita', file: 'troglodita.mdc' },
    { name: 'troglodita-commit', file: 'troglodita-commit.mdc' },
    { name: 'troglodita-review', file: 'troglodita-review.mdc' },
  ];

  for (const skill of skills) {
    const content = readSkillContent(skill.name);
    const mdc = wrapCursorMdc(skill.name, content);
    const dest = path.join(rulesDir, skill.file);
    fs.writeFileSync(dest, mdc, 'utf-8');
    log(`  regra ${skill.name} → ${dest}`);
  }

  log('  Cursor: regras instaladas em .cursor/rules/ (projeto atual).');
  log('  Usar: pedir "modo troglodita" no chat');
}

function installCodex() {
  const codexDir = path.join(homeDir(), '.codex');
  ensureDir(codexDir);

  const agentsFile = path.join(codexDir, 'AGENTS.md');
  const marker = '<!-- troglodita-start -->';
  const markerEnd = '<!-- troglodita-end -->';

  const skillContent = readSkillContent('troglodita');
  const block = `\n${marker}\n${skillContent}\n${markerEnd}\n`;

  let existing = '';
  try {
    existing = fs.readFileSync(agentsFile, 'utf-8');
  } catch {}

  if (existing.includes(marker)) {
    const re = new RegExp(`${escapeRegex(marker)}[\\s\\S]*?${escapeRegex(markerEnd)}`);
    existing = existing.replace(re, block.trim());
    fs.writeFileSync(agentsFile, existing, 'utf-8');
    log('  Codex: AGENTS.md atualizado.');
  } else {
    fs.appendFileSync(agentsFile, block, 'utf-8');
    log('  Codex: instruções adicionadas em ~/.codex/AGENTS.md');
  }

  log('  Usar: pedir "modo troglodita" no chat');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function log(msg) {
  console.log(msg);
}

async function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main() {
  console.log('');
  console.log('  🦴 troglodita v' + VERSION);
  console.log('  compressão de tokens pra PT-BR');
  console.log('');

  const detected = AGENTS.filter((a) => a.detect());
  const notDetected = AGENTS.filter((a) => !a.detect());

  if (detected.length === 0) {
    console.log('  Nenhum agente detectado (Claude Code, Cursor, Codex).');
    console.log('  Instale um dos agentes suportados e rode novamente.');
    process.exit(1);
  }

  console.log('  Agentes detectados:');
  for (const agent of detected) {
    console.log(`    ✅ ${agent.label}`);
  }
  if (notDetected.length > 0) {
    for (const agent of notDetected) {
      console.log(`    ⬚  ${agent.label} (não encontrado)`);
    }
  }
  console.log('');

  const args = process.argv.slice(2);
  const forceAll = args.includes('--all') || args.includes('-a');
  const onlyAgent = args.find((a) => a.startsWith('--only='))?.split('=')[1];
  const uninstall = args.includes('--uninstall');

  if (uninstall) {
    console.log('  Desinstalando...');
    // TODO: implementar uninstall
    console.log('  Desinstalação ainda não implementada. Remova manualmente os arquivos.');
    process.exit(0);
  }

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
