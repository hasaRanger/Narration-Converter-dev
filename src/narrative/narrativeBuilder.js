import { pickDeterministic } from "../utils/simpleHash.js";

function getTemplateId(storyId, topic, mode) {
  return `${storyId}_${topic}_${mode}_01`;
}

function getPhraseBank(storyId, mode) {
  const commonLearn = [
    "Here's your next task.",
    "Let's move to the next clue.",
    "Time for your next training step.",
    "You've got a new lead to follow.",
    "A fresh report just came in."
  ];

  const commonChallenge = [
    "This one is high stakes.",
    "This challenge won't be easy.",
    "You'll need to be precise here.",
    "No room for mistakes on this one.",
    "This is a serious test of skill."
  ];

  const detectiveLearn = [
    "Detective, a new case note arrives.",
    "Detective, your evidence board needs an update.",
    "Detective, the next lead is waiting.",
    "Detective, you're back at the crime scene.",
    "Detective, you've found a suspicious pattern."
  ];

  const pirateLearn = [
    "Captain, the crew requests guidance.",
    "Captain, your map shows a new route.",
    "Captain, a sealed chest contains a puzzle.",
    "Captain, the lookout reports strange signals.",
    "Captain, the ship's log needs an answer."
  ];

  const detectiveChallenge = [
    "Detective, this case could collapse if you fail.",
    "Detective, the suspect is one step ahead.",
    "Detective, time is running out.",
    "Detective, you must verify every detail.",
    "Detective, one wrong move ruins the trail."
  ];

  const pirateChallenge = [
    "Captain, this raid decides everything.",
    "Captain, enemies are closing in fast.",
    "Captain, the treasure route is guarded.",
    "Captain, the storm won't wait for you.",
    "Captain, your crew is counting on this."
  ];

  const base = mode === "challenge" ? commonChallenge : commonLearn;

  if (storyId === "detective_v1") return base.concat(mode === "challenge" ? detectiveChallenge : detectiveLearn);
  if (storyId === "pirate_v1") return base.concat(mode === "challenge" ? pirateChallenge : pirateLearn);

  // other stories fall back to base
  return base;
}

export function buildNarrative({ storyId, mode, topic, problemId, originalTitle, originalDescription, language }) {
  const templateId = getTemplateId(storyId, topic, mode);
  const phrase = pickDeterministic(getPhraseBank(storyId, mode), `${problemId}_${language}_${mode}`);

  // Keep the original meaning, add a story wrapper
  const narrativeTitle = `${phrase} (${topic})`;
  const narrativeText =
    `${phrase}\n\n` +
    `Task: ${originalTitle}\n` +
    `${originalDescription}\n\n` +
    (mode === "challenge"
      ? "Use the given test cases to validate your solution."
      : "Focus on writing a clear solution before checking test cases.");

  return {
    templateId,
    narrative: {
      title: narrativeTitle,
      description: narrativeText
    }
  };
}
