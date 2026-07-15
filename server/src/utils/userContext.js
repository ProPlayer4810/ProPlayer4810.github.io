import { getUser } from "../services/nutritionService.js";

export function userContext() {
  const user = getUser();
  return {
    goal: user.goal,
    dietType: user.diet_type,
    region: user.region,
  };
}
