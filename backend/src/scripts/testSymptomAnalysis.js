
import dailyBriefingAgent from "../agents/dailyBriefingAgent.js";

const runTest = async () => {
    const user = {
        name: "Alicia",
        age: 28,
        weight: 65,
        height: 170,
        activityLevel: "active",
        goals: { target_weight: 60 },
        fitnessLevel: "Intermediate"
    };

    const logs = [{
        date: new Date(),
        symptoms: ["Bloating", "Sugar Craving"] // The user's input
    }];

    const cycleState = {
        phase: "Luteal", 
        day: 26
    };

    const currentPlan = { days: [] };

    console.log("Running Daily Briefing Agent with multiple symptoms...");
    const result = await dailyBriefingAgent(user, logs, currentPlan, cycleState, false);
    
    console.log("\n--- AGENT ANALYSIS ---");
    console.log(JSON.stringify(result, null, 2));
};

runTest();
