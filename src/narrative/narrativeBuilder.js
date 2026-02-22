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
    "A fresh report just came in.",
    "Your next assignment is ready.",
    "A new challenge has been queued for you.",
    "The next problem is on your desk.",
    "Your mentor has left you a new task.",
    "Time to put your skills to work.",
    "Another step forward in your training.",
    "A new objective has been assigned.",
    "Your next drill is ready to begin.",
    "The next problem awaits your attention.",
    "Pick up where you left off — new task ahead."
  ];

  const commonChallenge = [
    "This one is high stakes.",
    "This challenge won't be easy.",
    "You'll need to be precise here.",
    "No room for mistakes on this one.",
    "This is a serious test of skill.",
    "Every detail matters here.",
    "Push yourself — this one demands it.",
    "The pressure is on. Perform.",
    "This is not the time for guessing.",
    "Your sharpest thinking is required.",
    "There is no shortcut through this one.",
    "Stay focused — complexity is ahead.",
    "This problem separates good from great.",
    "Bring everything you have to this one.",
    "The difficulty is real. So is the reward."
  ];

  const detectiveLearn = [
    "Detective, a new case note arrives.",
    "Detective, your evidence board needs an update.",
    "Detective, the next lead is waiting.",
    "Detective, you're back at the crime scene.",
    "Detective, you've found a suspicious pattern.",
    "Detective, a witness has come forward with new information.",
    "Detective, the case file has a new entry.",
    "Detective, HQ flagged this for your attention.",
    "Detective, a fresh clue has surfaced.",
    "Detective, the trail goes cold without your analysis.",
    "Detective, your notebook is open to a new page.",
    "Detective, the inspector assigned you this case.",
    "Detective, the lab results just came back.",
    "Detective, your instincts led you here for a reason.",
    "Detective, another piece of the puzzle has emerged."
  ];

  const detectiveChallenge = [
    "Detective, this case could collapse if you fail.",
    "Detective, the suspect is one step ahead.",
    "Detective, time is running out.",
    "Detective, you must verify every detail.",
    "Detective, one wrong move ruins the trail.",
    "Detective, the pressure from above is mounting.",
    "Detective, the evidence is fragile — handle it carefully.",
    "Detective, the courtroom is waiting for your findings.",
    "Detective, your reputation is on the line.",
    "Detective, the killer knows you're closing in.",
    "Detective, every second you delay costs the case.",
    "Detective, this is the most complex case of your career.",
    "Detective, the chief is watching this one personally.",
    "Detective, a false lead now means the suspect walks free.",
    "Detective, solve this before the trail goes cold forever."
  ];

  const pirateLearn = [
    "Captain, the crew requests guidance.",
    "Captain, your map shows a new route.",
    "Captain, a sealed chest contains a puzzle.",
    "Captain, the lookout reports strange signals.",
    "Captain, the ship's log needs an answer.",
    "Captain, the navigator has charted a new course.",
    "Captain, a message in a bottle washed ashore.",
    "Captain, the first mate found something in the cargo hold.",
    "Captain, the stars are pointing to new waters.",
    "Captain, a riddle guards the next island.",
    "Captain, the old map has a new marking on it.",
    "Captain, the crew is ready for your next order.",
    "Captain, the tide is right for a new venture.",
    "Captain, a merchant ship carries a curious challenge.",
    "Captain, the crow's nest spotted something on the horizon."
  ];

  const pirateChallenge = [
    "Captain, this raid decides everything.",
    "Captain, enemies are closing in fast.",
    "Captain, the treasure route is guarded.",
    "Captain, the storm won't wait for you.",
    "Captain, your crew is counting on this.",
    "Captain, rival pirates have found the same map.",
    "Captain, the naval fleet is on your tail.",
    "Captain, one wrong heading and the ship runs aground.",
    "Captain, the treasure is booby-trapped — think carefully.",
    "Captain, mutiny brews if you fail this raid.",
    "Captain, the harbor master is bribed — you have one shot.",
    "Captain, the kraken stirs in these waters.",
    "Captain, the cannon is loaded but ammunition is limited.",
    "Captain, every crew member's life depends on your call.",
    "Captain, the enemy has cracked half your code already."
  ];

  const spyLearn = [
    "Agent, your next briefing has arrived.",
    "Agent, the mission file is now open.",
    "Agent, HQ has a new objective for you.",
    "Agent, your handler left new intelligence.",
    "Agent, a new operation has been authorized.",
    "Agent, the dossier on your next target is ready.",
    "Agent, a coded message arrived from the field.",
    "Agent, your cover identity needs a new skill.",
    "Agent, the training room has a new simulation loaded.",
    "Agent, intelligence suggests a new pattern of activity.",
    "Agent, your gadget specialist left you a new tool.",
    "Agent, the safe house received a new assignment.",
    "Agent, surveillance footage requires your analysis.",
    "Agent, your next extraction point needs preparation.",
    "Agent, the cipher team needs your help decoding this."
  ];

  const spyChallenge = [
    "Agent, this mission is classified critical.",
    "Agent, failure is not an option here.",
    "Agent, the enemy is watching your every move.",
    "Agent, one mistake burns the entire operation.",
    "Agent, the clock is already ticking.",
    "Agent, your cover is at risk if you move too slowly.",
    "Agent, the target suspects they are being watched.",
    "Agent, extraction is impossible if the alarm is triggered.",
    "Agent, double agents are watching for any errors.",
    "Agent, the fate of the entire network rests on this.",
    "Agent, communications go dark after this transmission.",
    "Agent, the enemy has your last known position.",
    "Agent, this operation cannot leave a trace behind.",
    "Agent, your backup has been compromised — you're alone.",
    "Agent, the window for success is closing rapidly."
  ];

  const cyberpunkLearn = [
    "Runner, a new contract just hit the net.",
    "Runner, your deck is picking up a signal.",
    "Runner, the next node is waiting to be cracked.",
    "Runner, a fresh exploit path has been found.",
    "Runner, your fixer sent over a new job.",
    "Runner, a data cache has been flagged for extraction.",
    "Runner, your AI companion flagged an anomaly.",
    "Runner, the underground forum posted a new bounty.",
    "Runner, a backdoor has been discovered in the system.",
    "Runner, your netrunner kit has a new tool ready.",
    "Runner, the grid is quiet — perfect time to practice.",
    "Runner, an encrypted packet arrived from an unknown source.",
    "Runner, your reputation earns you access to this job.",
    "Runner, the training sim has a new module loaded.",
    "Runner, a low-security node is open for practice."
  ];

  const cyberpunkChallenge = [
    "Runner, ICE is closing in fast.",
    "Runner, the corp's black site is heavily guarded.",
    "Runner, one wrong packet and you're flatlined.",
    "Runner, this intrusion has zero margin for error.",
    "Runner, the countermeasures are already active.",
    "Runner, the sysadmin just triggered an alert.",
    "Runner, black ICE detected on the next layer.",
    "Runner, the corp is tracing your signal right now.",
    "Runner, every millisecond you're exposed costs you.",
    "Runner, the firewall is adaptive — it learns as you probe.",
    "Runner, three failed attempts and the system locks forever.",
    "Runner, a rival runner is racing you to the same node.",
    "Runner, the data self-destructs if extraction takes too long.",
    "Runner, your deck is overheating — finish this fast.",
    "Runner, the megacorp has its best AI defending this vault."
  ];

  const base = mode === "challenge" ? commonChallenge : commonLearn;

  if (storyId === "detective_v1") return base.concat(mode === "challenge" ? detectiveChallenge : detectiveLearn);
  if (storyId === "pirate_v1") return base.concat(mode === "challenge" ? pirateChallenge : pirateLearn);
  if (storyId === "spy_v1") return base.concat(mode === "challenge" ? spyChallenge : spyLearn);
  if (storyId === "cyberpunk_v1") return base.concat(mode === "challenge" ? cyberpunkChallenge : cyberpunkLearn);

  // other stories fall back to base
  return base;
}

export function buildNarrative({ storyId, mode, topic, problemId, originalTitle, originalDescription, language }) {
  const templateId = getTemplateId(storyId, topic, mode);
  const phrase = pickDeterministic(getPhraseBank(storyId, mode), `${problemId}_${language}_${mode}_${topic}`);

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
