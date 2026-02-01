import masterOrchestrator from '../orchestrator/masterOrchestrator.js';
import cycleAgent from '../agents/cycleAgent.js';
import stressAgent from '../agents/stressAgent.js';
import workoutAgent from '../agents/workoutAgent.js';

export default async function intelligenceLoop(user, logs) {
    // 1. Set Default Fallbacks
    let triage = { targetAgent: 'workout', readinessScore: 0.5 };
    let specialistResult = { 
        workout: "Gentle Movement", 
        message: "Your AI experts are thinking. Listen to your body in the meantime.",
        analysis: "Status: Standby" 
    };

    try {
        // CALL 1: Triage
        const triageResponse = await masterOrchestrator.determineRoute(logs);
        if (triageResponse && triageResponse.targetAgent) {
            triage = triageResponse;
        }
    } catch (err) {
        console.error("Triage skipped, using defaults.");
    }

    const agentMapping = { cycle: cycleAgent, stress: stressAgent, workout: workoutAgent };

    try {
        // CALL 2: Specialist
        const selectedAgent = agentMapping[triage.targetAgent] || workoutAgent;
        const result = await selectedAgent(user, logs);
        if (result) specialistResult = result;
    } catch (err) {
        console.error("Specialist skipped, using defaults.");
    }

    // NO SPLIT - Just pass the raw message through safely
    const rawMessage = (specialistResult.message || specialistResult.workout || "Activity recommended based on current logs.").toString();

    return { 
        bioState: {
            cycle: { physiology: specialistResult.analysis || "Stable" },
            stress: { level: logs.stressLevel || 5, analysis: specialistResult.analysis || "Processing" }
        },
        psychology: rawMessage,
        finalDecision: {
            readiness: triage.readinessScore || 0.5,
            workout: specialistResult.workout || "Rest",
            insight: rawMessage // Sending the full message here
        }
    };
}