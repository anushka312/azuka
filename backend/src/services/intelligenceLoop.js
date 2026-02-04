import masterOrchestrator from '../orchestrator/masterOrchestrator.js';
import cycleAgent from '../agents/cycleAgent.js';
import stressAgent from '../agents/stressAgent.js';
import workoutAgent from '../agents/workoutAgent.js';

export default async function intelligenceLoop(user, logs) {
    // 1. Always Run Cycle Agent (Base Biological State)
    let baseState = {};
    try {
        baseState = await cycleAgent(user, logs);
    } catch (err) {
        console.error("Cycle Agent failed:", err);
        // Fallback for base state if cycle agent fails
        baseState = {
            cycle: { day: user.cycleDay || 1, phase: "Follicular", predicted_next_phase: "Ovulatory" },
            physiology: { energy: 0.5, fatigue: 0.5, inflammation_risk: 0.1 },
            stress: { score: 0.5, cortisol_risk: 0.1, nervous_system_state: "Parasympathetic" },
            metabolic: { fuel_risk: 0.1, carb_need: 0.5, daily_calorie_band: { min: 1800, max: 2200 } }
        };
    }

    // 2. Triage for Specialist
    let triage = { targetAgent: 'workout', readinessScore: 0.5 };
    try {
        const triageResponse = await masterOrchestrator.determineRoute(logs);
        if (triageResponse && triageResponse.targetAgent) {
            triage = triageResponse;
        }
    } catch (err) {
        console.error("Triage skipped, using defaults.");
    }

    const agentMapping = { cycle: cycleAgent, stress: stressAgent, workout: workoutAgent };
    let specialistResult = {};

    // 3. Run Specialist (if different from cycle, or if we want specific advice)
    // Note: If target is cycle, we already ran it. But maybe we want to re-run or just use baseState?
    // Optimization: If target is cycle, use baseState.
    if (triage.targetAgent === 'cycle') {
        specialistResult = baseState;
    } else {
        try {
            const selectedAgent = agentMapping[triage.targetAgent] || workoutAgent;
            // Pass baseState to specialist if needed? Currently agents signature is (user, logs)
            specialistResult = await selectedAgent(user, logs);
        } catch (err) {
            console.error("Specialist skipped.", err);
        }
    }

    // 4. Merge Data
    // We need to return an object that satisfies intelligence.js expectations
    // intelligence.js expects: { bioState, psychology, finalDecision }
    // bioState should match BodyState schema structure (mostly)

    // Merge specialist result into baseState where appropriate
    // For example, if stressAgent ran, it returns detailed stress data.
    if (triage.targetAgent === 'stress' && specialistResult.score) {
        baseState.stress = {
            score: specialistResult.score,
            cortisol_risk: specialistResult.cortisol_risk,
            nervous_system_state: specialistResult.nervous_system_state
        };
    }
    
    // Construct final output
    const rawMessage = (specialistResult.message || baseState.message || "Activity recommended based on current logs.").toString();
    const workoutSummary = specialistResult.workout || baseState.workout || "Rest";

    return { 
        bioState: {
            cycle: baseState.cycle,
            physiology: baseState.physiology,
            stress: baseState.stress,
            metabolic: baseState.metabolic
        },
        psychology: rawMessage,
        finalDecision: {
            readiness: triage.readinessScore || 0.5,
            workout: workoutSummary,
            mindset_message: rawMessage, // Added for intelligence.js usage
            insight: rawMessage
        }
    };
}