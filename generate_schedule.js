const fs = require('fs');

const subjects = [
  {
    "name": "Bank PO Reasoning",
    "topics": [
      "Seating", "Tables", "Logical Reasoning", "Syllogism", "Input-Output", 
      "Coding-Decoding", "Alphanumeric Sequences", "Blood Relations", "Order", 
      "Information Sufficiency", "Distance and Direction", "Coded Inequality", "Verbal Reasoning"
    ]
  },
  {
    "name": "Banking PO Mathematics",
    "topics": [
      "Simplification and Approximation", "Data Interpretation", "Data Sufficiency", "Series", 
      "Ratio and Proportions", "Quadratic Equations", "Averages", "Boats and Flows", 
      "Simple and Compound Interest", "Percentages", "Profit and Loss", "Mixtures and Alligation", 
      "Time and Distance", "Probability", "Partnership", "Tubes and Tanks"
    ]
  },
  {
    "name": "Awareness Mix",
    "topics": [
      "Banking News", "Financial Affairs", "National News", "International News", 
      "Government Schemes & Policies", "RBI Interest Rates and Functions", "Account Types", 
      "Money Market Instruments", "Capitals and Currencies", "International Organizations"
    ]
  }
];

const schedule = [];
const rTopics = subjects[0].topics;
const mTopics = subjects[1].topics;
const aTopics = subjects[2].topics;

for (let d = 0; d < 100; d++) {
  // Reasoning slot: 180 min
  schedule.push({ day: d, topicName: rTopics[d % rTopics.length], minutes: 180 });
  
  // Math slot: 180 min
  schedule.push({ day: d, topicName: mTopics[d % mTopics.length], minutes: 180 });
  
  // Awareness slot: 120 min
  schedule.push({ day: d, topicName: aTopics[d % aTopics.length], minutes: 120 });
}

fs.writeFileSync('defaultSchedule.json', JSON.stringify(schedule, null, 2));
console.log("Generated defaultSchedule.json for 100 days.");
