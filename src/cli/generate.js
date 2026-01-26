import fs from "fs";
import path from "path";

import { log } from "../utils/logger.js";
import { makeProblemId } from "../utils/idMaker.js";

import { loadCsvRows } from "../loaders/readCsv.js";
import { normalizeCsvRowToProblem, ensureExecutionFieldsExist } from "../normalizer/normalizeRow.js";

import { detectTopic } from "../classifier/topicClassifier.js";
import { detectBloom } from "../classifier/bloomClassifier.js";

import { makeBeatId } from "../narrative/beatMaker.js";
import { makeLanguageVariants } from "../narrative/variantMaker.js";

import { pickLearnProblems } from "../selector/learnSelector.js";
import { pickChallengeHardPhase } from "../selector/challengeSelector.js";

import {
  loadUsageRegistry,
  saveUsageRegistry,
  getLearnUsedSet,
  getChallengeUsedHardSet,
  addLearnUsed,
  addChallengeUsedHard,
  resetRegistryAll,
  resetRegistryLearnOnly,
  resetRegistryChallengesOnly
} from "../registry/usageRegistry.js";

import { validateOutputRecord } from "../validator/outputValidator.js";

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function getArg(name, fallback = null) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const next = process.argv[idx + 1];
  if (!next || next.startsWith("--")) return fallback;
  return next;
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function mustExist(filePath, label) {
  if (!fs.existsSync(filePath)) throw new Error(`${label} not found: ${filePath}`);
}

function toNumberOrFallback(value, fallbackNumber) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallbackNumber;
}

async function main() {
  const dataset = getArg("dataset");
  const input = getArg("input");
  const mode = getArg("mode"); // learn | challenge
  const phase = toNumberOrFallback(getArg("phase", "1"), 1);

  // OPTIONAL flags (do nothing unless explicitly passed)
  const resetAll = hasFlag("reset-registry");
  const resetLearnOnly = hasFlag("reset-learn-only");
  const resetChallengesOnly = hasFlag("reset-challenges-only");

  if (!dataset || !input || !mode) {
    log.error(
      "Usage: npm run generate -- --dataset <name> --input <csvPath> --mode <learn|challenge> [--phase N]\n" +
      "Optional reset flags:\n" +
      "  --reset-registry\n" +
      "  --reset-learn-only\n" +
      "  --reset-challenges-only"
    );
    process.exit(1);
  }

  const mappingPath = path.join("config", "dataset_mappings", `${dataset}.json`);
  const rulesPath = path.join("config", "selection_rules.json");
  const storiesPath = path.join("config", "stories.json");
  const registryPath = path.join("data", "registry", "usage_registry.json");

  mustExist(mappingPath, "Dataset mapping");
  mustExist(rulesPath, "Selection rules");
  mustExist(storiesPath, "Stories config");
  mustExist(input, "Input CSV");
  mustExist(registryPath, "Usage registry");

  const mappingConfig = readJson(mappingPath);
  const rules = readJson(rulesPath);
  const stories = readJson(storiesPath);

  const { rows } = await loadCsvRows(input);

  log.info(`Loaded ${rows.length} rows from ${input}`);

  // 1) Normalize rows to canonical problems
  const normalizedProblems = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      const p = normalizeCsvRowToProblem(rows[i], mappingConfig);

      // skip premium (if present)
      if (p.isPremium) continue;

      // execution fields required for your platform
      ensureExecutionFieldsExist(p);

      // deterministic numeric-based IDs
      const sourceIdNumber = toNumberOrFallback(p.source.source_question_id, i + 1);
      const problemId = makeProblemId(sourceIdNumber);

      normalizedProblems.push({
        ...p,
        problemId
      });
    } catch (e) {
      if (mappingConfig.strict) {
        throw new Error(`Row ${i + 1} failed: ${e.message}`);
      } else {
        log.warn(`Skipping row ${i + 1}: ${e.message}`);
      }
    }
  }

  if (!normalizedProblems.length) {
    throw new Error("No usable problems found after normalization/validation.");
  }

  // 2) Add topic + bloom + beat
  const enrichedProblems = normalizedProblems.map((p) => {
    const combinedText = `${p.original.title}\n${p.original.description}`;
    const topic = detectTopic(combinedText);
    const bloom = detectBloom(combinedText, p.difficulty);
    const beatId = makeBeatId(bloom.score);

    return {
      ...p,
      topic,
      bloom,
      beatId
    };
  });

  // 3) Load registry
  const registry = loadUsageRegistry(registryPath);

  // 3.1) Optional reset — ONLY if user passed flags
  if (resetAll) {
    resetRegistryAll(registry);
    saveUsageRegistry(registryPath, registry);
    log.warn("Registry reset: ALL (learn + challenges) cleared.");
  } else {
    if (resetLearnOnly) {
      resetRegistryLearnOnly(registry);
      saveUsageRegistry(registryPath, registry);
      log.warn("Registry reset: LEARN cleared.");
    }
    if (resetChallengesOnly) {
      resetRegistryChallengesOnly(registry);
      saveUsageRegistry(registryPath, registry);
      log.warn("Registry reset: CHALLENGES cleared.");
    }
  }

  const learnUsedSet = getLearnUsedSet(registry);
  const challengeUsedSet = getChallengeUsedHardSet(registry);

  const languages = rules.languages;
  const languageToStory = stories.languageToStory;
  const defaultStory = stories.defaultStory;
  const chapterId = stories.defaultChapterId;

  // 4) LEARN mode: Easy + Medium + Hard (15 each)
  if (mode === "learn") {
    // avoid repeating learn problems across reruns unless you reset
    const availableForLearn = enrichedProblems.filter(p => !learnUsedSet.has(p.problemId));

    const { selected, meta } = pickLearnProblems({
      allProblems: availableForLearn,
      countsPerDifficulty: rules.learn.countsPerDifficulty
    });

    // record learn used IDs (so challenges never reuse them)
    addLearnUsed(registry, selected.map(p => p.problemId));
    saveUsageRegistry(registryPath, registry);

    const outputItems = selected.map((p) => {
      const variants = makeLanguageVariants({
        problemId: p.problemId,
        languages,
        languageToStory,
        defaultStory,
        mode: "learn",
        topic: p.topic,
        original: p.original
      });

      const record = {
        problemId: p.problemId,
        source: p.source,
        original: p.original,
        difficulty: p.difficulty,
        topic: p.topic,
        bloom: p.bloom,
        story: {
          chapterId,
          beatId: p.beatId
        },
        examples: p.examples,
        constraints: p.constraints,
        test_cases: p.test_cases,
        variants
      };

      validateOutputRecord(record);
      return record;
    });

    const outPath = path.join("data", "output", "learn_programming.json");
    writeJson(outPath, {
      meta: {
        dataset,
        mode: "learn",
        generatedAt: new Date().toISOString(),
        selection: meta
      },
      items: outputItems
    });

    log.info(`Wrote Learn output: ${outPath}`);
    log.info(`Updated registry: ${registryPath}`);
    return;
  }

  // 5) CHALLENGE mode: Hard only, 30 per phase, MUST NOT overlap Learn
  if (mode === "challenge") {
    const hardProblems = enrichedProblems.filter(p => p.difficulty === "Hard");

    const { selected, meta } = pickChallengeHardPhase({
      hardProblems,
      learnUsedSet,
      challengeUsedSet,
      phaseSize: rules.challenge.phaseSize
    });

    // record new unique challenge IDs only (no overlap with learn)
    const newUniqueIds = selected
      .filter(p => !challengeUsedSet.has(p.problemId) && !learnUsedSet.has(p.problemId))
      .map(p => p.problemId);

    addChallengeUsedHard(registry, newUniqueIds, phase);
    saveUsageRegistry(registryPath, registry);

    const outputItems = selected.map((p) => {
      const variants = makeLanguageVariants({
        problemId: p.problemId,
        languages,
        languageToStory,
        defaultStory,
        mode: "challenge",
        topic: p.topic,
        original: p.original
      });

      const record = {
        problemId: p.problemId,
        source: p.source,
        original: p.original,
        difficulty: p.difficulty,
        topic: p.topic,
        bloom: p.bloom,
        beatId: null,
        examples: p.examples,
        constraints: p.constraints,
        test_cases: p.test_cases,
        variants
      };

      validateOutputRecord(record);
      return record;
    });

    const outPath = path.join("data", "output", `challenges_phase_${phase}.json`);
    writeJson(outPath, {
      meta: {
        dataset,
        mode: "challenge",
        phase,
        generatedAt: new Date().toISOString(),
        ...meta
      },
      items: outputItems
    });

    log.info(`Wrote Challenge output: ${outPath}`);
    log.info(`Updated registry: ${registryPath}`);
    return;
  }

  throw new Error(`Unknown mode '${mode}'. Use learn or challenge.`);
}

main().catch((e) => {
  log.error(e.message);
  process.exit(1);
});
