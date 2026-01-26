/**
 * Challenge selector
 * - Challenges must contain ONLY Hard questions
 * - Challenges must NOT overlap with Learn questions
 * - Supports phased selection (e.g., 30 per phase)
 * - Avoids repetition across phases using registry sets
 * - If all unique hard questions are exhausted, repeats with a notice
 */

/**
 * Picks hard questions for a challenge phase.
 *
 * @param {Object} params
 * @param {Array}  params.hardProblems       - array of problems where difficulty === "Hard"
 * @param {Set}    params.learnUsedSet       - problemIds already used in Learn (must never appear in Challenges)
 * @param {Set}    params.challengeUsedSet   - hard problemIds already used in previous challenge phases
 * @param {number} params.phaseSize          - how many hard questions to pick (e.g., 30)
 *
 * @returns {Object} { selected, meta }
 */
export function pickChallengeHardPhase({
  hardProblems,
  learnUsedSet,
  challengeUsedSet,
  phaseSize
}) {
  // 1) Remove anything already used in Learn (no overlap rule)
  const hardNotInLearn = hardProblems.filter((p) => !learnUsedSet.has(p.problemId));

  // If Learn already consumed all hard questions, challenges cannot be built (for this dataset)
  if (hardNotInLearn.length === 0) {
    return {
      selected: [],
      meta: {
        requestedCount: phaseSize,
        uniqueProvided: 0,
        repeatedProvided: 0,
        notice:
          "No Hard questions available for Challenges because all Hard questions are already used in Learn. " +
          "Either reset Learn registry or increase dataset size."
      }
    };
  }

  // 2) Find unused hard questions (not used in challenges before)
  const unusedHard = hardNotInLearn.filter((p) => !challengeUsedSet.has(p.problemId));

  // 3) Pick as many unique as possible
  const uniquePick = unusedHard.slice(0, phaseSize);

  // 4) If not enough unique, repeat from previously-used challenge pool
  let repeatedPick = [];
  let notice = null;

  if (uniquePick.length < phaseSize) {
    const shortage = phaseSize - uniquePick.length;

    const alreadyUsedInChallenges = hardNotInLearn.filter((p) =>
      challengeUsedSet.has(p.problemId)
    );

    repeatedPick = alreadyUsedInChallenges.slice(0, shortage);

    if (unusedHard.length === 0) {
      notice =
        "All available Hard questions (excluding Learn) have been used in previous Challenge phases. " +
        "Repeated questions are being displayed.";
    } else {
      notice =
        "Hard question pool (excluding Learn) is almost exhausted. " +
        "Some repeated Challenge questions are being displayed.";
    }
  }

  const selected = uniquePick.concat(repeatedPick);

  return {
    selected,
    meta: {
      requestedCount: phaseSize,
      uniqueProvided: uniquePick.length,
      repeatedProvided: repeatedPick.length,
      notice
    }
  };
}
