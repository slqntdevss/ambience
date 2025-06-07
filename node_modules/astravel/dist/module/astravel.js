import { defaultTraveler } from "./defaultTraveler.js";
export { attachComments } from "./attachComments.js";
export function makeTraveler(properties) {
  return defaultTraveler.makeChild(properties);
}
export { defaultTraveler };
//# sourceMappingURL=astravel.js.map