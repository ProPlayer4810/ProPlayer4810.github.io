# Zaikora — Requirements Document

## Product Vision

Zaikora should feel like a **smart Indian food companion** — not a strict diet app. It works *with* users' cravings and cultural food habits rather than restricting them. The guiding philosophy across every feature is:

> **Keep the Zaika. Improve the lifestyle.**

---

## Final Feature Set

### 1. Smart Indian Food Tracker

Track Indian meals naturally, without complicated logging.

**Input methods:**
- Click a food photo
- Type meals casually (free text)
- Voice input

**Zaikora identifies:**
- Dish name
- Quantity estimate
- Calories
- Protein
- Carbs
- Fats
- Other nutrients

**Must support:**
- Homemade meals
- Restaurant food
- Street food
- Regional Indian dishes

**Example:**
Input: `"2 rotis + dal + paneer sabzi"` → Output: complete nutrition breakdown

---

### 2. Taste Match Engine ⭐ (Core Feature)

Zaikora understands cravings, not just calories. Instead of blocking a food choice, it finds ways to satisfy the same taste more intelligently.

**Behavior:**
- Never respond with a flat "don't eat this"
- Interpret craving/mood-based requests
- Suggest healthier alternatives, better portions, and similar flavour profiles

**Example:**
User: `"I want something spicy and crunchy."`
Zaikora suggests: healthier alternatives with similar spice/crunch, right-sized portions, and comparable flavours.

**Goal:** Keep the Zaika. Improve the lifestyle.

---

### 3. Zaikora Balance Score

A simple daily score reflecting overall balance, not just calorie counting.

**Based on:**
- Nutrition
- Protein intake
- Hydration
- Activity
- Sleep
- Consistency

**Example output:**
> "Zaikora Score: 86/100"
> "You enjoyed your favourite foods while staying balanced."

---

### 4. Street Food Optimizer ⭐

Helps users enjoy Indian street food intelligently instead of avoiding it.

**Supported foods:**
- Pani puri
- Pav bhaji
- Chaat
- Momos
- Rolls
- Vada pav
- Biryani

**Provides:**
- Recommended portions
- Healthier customizations
- Meal balancing suggestions for the rest of the day

**Example:**
> "Enjoy pani puri today. Add a protein-rich dinner to balance your day."

---

### 5. Family Food Mode ⭐

Designed for Indian households where a separate "fitness meal" isn't realistic — everyone eats the same home-cooked food.

**Example:**
Input: `"Mom made rajma chawal."`
Zaikora suggests: ideal quantity, nutrition estimate, and how to balance remaining meals for the day.

---

### 6. Recipe Transformer

Turns favourite foods into goal-friendly versions — same taste, smarter ingredients.

**Examples:**
- Maggi → balanced protein Maggi
- Paratha → healthier stuffed paratha
- Butter chicken → improved macro version

**Focus:** Preserve the taste identity of the dish while optimizing ingredients/method.

---

### 7. Regional Food Intelligence

Understands and adapts to India's food diversity rather than applying a generic diet template.

**Supported cuisines (non-exhaustive):**
- North Indian
- South Indian
- Gujarati
- Punjabi
- Bengali
- Maharashtrian
- Hyderabadi
- More regional cuisines over time

**Behavior:** Recommendations adapt to the user's normal/regional food style rather than forcing generic suggestions.

---

### 8. Goal Personalization

Zaikora tailors advice based on the individual's goal — the same dish produces different guidance depending on who's eating it.

**Supported goals:**
- Lose fat
- Gain muscle
- Maintain weight
- Improve fitness
- Improve eating habits

**Example — Biryani:**
- For weight loss: "Adjust portion + balance dinner."
- For muscle gain: "Add more protein."

---

### 9. Zaikora Plate Builder

Lets users plan a meal before eating it, building a better version of what they already want.

**Example:**
User: `"I want dosa tonight."`
Zaikora creates:
- Preferred food (kept as-is)
- Better combinations
- Improved nutrition balance

**Example output:**
> "Have dosa + extra sambar + protein side."

---

### 10. Smart Grocery Assistant

Generates shopping lists based on the user's nutrition goals and gaps.

**Example:**
> "You need more protein this week."
> Suggestions: paneer, dal, chana, curd, eggs

**Must adapt to:**
- Vegetarian
- Non-vegetarian
- Regional preferences

---

### 11. Zaikora Journey (Gamification)

Makes healthy eating enjoyable and habit-forming through game mechanics.

**Includes:**
- Streaks
- Milestones
- Achievements
- Challenges

**Examples:**
- "7-day balanced eating streak"
- "Street Food Master"
- "Protein Goal Completed"

---

### 12. Health Connect

Integrates with external health and fitness data sources to make recommendations activity-aware.

**Connects with:**
- Smartwatches
- Fitness apps
- Step counters

**Uses:**
- Workouts
- Steps
- Sleep

**Example:**
> "You played basketball today. Increase protein intake."

---

## Future Expansion Features

Features considered for a later phase, not part of the current core scope.

### Budget Healthy Eating

Helps users eat healthily within a fixed budget — deferred to a future release.

---

## Notes

- Numbering above reflects the finalized, in-scope feature set only; features not chosen for this phase have been removed from the list.
- Items marked ⭐ are considered differentiating/core to the Zaikora product identity (Taste Match Engine, Street Food Optimizer, Family Food Mode).
