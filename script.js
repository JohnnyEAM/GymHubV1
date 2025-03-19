const OPENAI_API_KEY = "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";
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Valid options
const validFitnessLevels = ["beginner", "intermediate", "gym rat"];
const validGoals = ["lose weight", "gain muscle", "both"];
const validBodyParts = [
    "forearms", "legs", "chest", "back", "shoulders", "abs", "glutes",
    "biceps", "triceps", "arms", "calves", "rear delts", "side delts", "front delt",
    "upper chest", "lower chest", "quads", "traps", "lats", "hamstrings", "core",
    "bicep", "abdominals", "six pack", "pecs", "trapezius", "gluteus",
    "rear deltoids", "side deltoids", "front deltoids"
];

let fitnessLevel = "";
let userGoal = "";
let muscleGroup = "";
let awaitingAnotherMuscle = false;
let awaitingFeedback = false;

async function askChatbot() {
    let chatbox = document.getElementById("chatbox");
    let userInput = document.getElementById("muscle").value.trim().toLowerCase();

    // Validate fitness level
    if (!fitnessLevel) {
        if (!validFitnessLevels.includes(userInput)) {
            chatbox.innerHTML += `<p>❌ Invalid fitness level. Please choose: Beginner, Intermediate, or Gym Rat.</p>`;
            document.getElementById("muscle").value = "";
            return;
        }
        fitnessLevel = userInput;
        chatbox.innerHTML += `<p><strong>You:</strong> My fitness level is ${fitnessLevel}.</p>`;
        chatbox.innerHTML += `<p><strong>GymHub Chatbot:</strong> 🏆 Great! What is your fitness goal? (Lose weight, Gain muscle, Both)</p>`;
        document.getElementById("muscle").value = "";
        return;
    }
    
    // Validate goal
    if (!userGoal) {
        if (!validGoals.includes(userInput)) {
            chatbox.innerHTML += `<p>❌ Invalid goal. Please choose: Lose weight, Gain muscle, or Both.</p>`;
            document.getElementById("muscle").value = "";
            return;
        }
        userGoal = userInput;
        chatbox.innerHTML += `<p><strong>You:</strong> My goal is to ${userGoal}.</p>`;
        chatbox.innerHTML += `<p><strong>GymHub Chatbot:</strong> 💪 Awesome! What muscle group do you want to train today?</p>`;
        document.getElementById("muscle").value = "";
        return;
    }

    // Handling training another muscle group
    if (awaitingAnotherMuscle) {
        if (userInput === "yes") {
            chatbox.innerHTML += `<p><strong>GymHub Chatbot:</strong> 💪 Great! What other muscle group do you want to train?</p>`;
        } else if (userInput === "no") {
            chatbox.innerHTML += `<p><strong>GymHub Chatbot:</strong> 🙏 Thanks for using GymHub! Please provide your feedback below.</p>`;
            document.getElementById("feedback-section").style.display = "block";
            awaitingFeedback = true;
        } else {
            chatbox.innerHTML += `<p>❌ Invalid Response. Try: yes, no</p>`;
        }
        awaitingAnotherMuscle = false;
        document.getElementById("muscle").value = "";
        return;
    }

    // Handling feedback submission
    if (awaitingFeedback) {
        submitFeedback();
        awaitingFeedback = false;
        document.getElementById("muscle").value = "";
        return;
    }

    // Validate body part
    if (!validBodyParts.includes(userInput)) {
        chatbox.innerHTML += `<p>❌ Invalid body part. Try: ${validBodyParts.join(", ")}</p>`;
        document.getElementById("muscle").value = "";
        return;
    }

    muscleGroup = userInput;
    chatbox.innerHTML += `<p><strong>You:</strong> I want to train my ${muscleGroup}.</p>`;

    let temperature = fitnessLevel === "beginner" ? 0.7 : fitnessLevel === "intermediate" ? 1.0 : 1.3;

    try {
        let response = await fetch(OPENAI_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: `I'm a ${fitnessLevel} looking to ${userGoal}. What exercises should I do for my ${muscleGroup}?` }],
                temperature: temperature
            })
        });

        let data = await response.json();
        let exercises = formatExercisesWithEmojis(data.choices[0].message.content);
        chatbox.innerHTML += `<p><strong>GymHub Chatbot:</strong> 🏋️ Exercises for ${muscleGroup}:<br>${exercises}</p>`;

        chatbox.innerHTML += `<p><strong>GymHub Chatbot:</strong> 🔄 Would you like to train another muscle group? (Yes/No)</p>`;
        awaitingAnotherMuscle = true;
        document.getElementById("muscle").value = "";
    } catch (error) {
        chatbox.innerHTML += `<p>⚠️ Error fetching exercises. Please try again later.</p>`;
        console.error("API Error:", error);
    }
}

function formatExercisesWithEmojis(exercises) {
    let exerciseList = exercises.split("\n").filter(line => line.trim() !== "");
    let emojiNumbers = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
    return exerciseList.map((exercise, i) => `${emojiNumbers[i % emojiNumbers.length]} ${exercise}`).join("<br>");
}







